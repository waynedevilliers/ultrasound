import { sql } from '@vercel/postgres';
import { logOrderFailure } from '@/lib/order-log';
import { createRequestCode, isRequestCode } from '@/lib/request-code';
import { withReference } from '@/lib/order-reference';
import { buildCustomerEmail, deliveryText, productName } from '@/lib/customer-email';
import { clientKey } from '@/lib/client-key';
import { head } from '@vercel/blob';
import { Resend } from 'resend';

type MailMessage = Parameters<Resend['emails']['send']>[0];
import { NextRequest, NextResponse } from 'next/server';
import { canvasSizes, type CanvasSizeId } from '@/content/products';
import { escapeHtml } from '@/lib/escape-html';
import { isRateLimited } from '@/lib/rate-limit';
import { orderSubmitSchema, validateStoredImage, type OrderSubmit } from '@/lib/order-schema';
import { buildFileLink } from '@/lib/signed-link';

const DEFAULT_FROM = 'onboarding@resend.dev';
const DEFAULT_ORDER_EMAIL = 'portraits4life.art@gmail.com';
const LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// TODO(client): set SITE_URL to the live domain so links stay stable; otherwise the request address is used.

function productLabel(order: OrderSubmit): string {
  if (order.product === 'canvas') {
    const size = canvasSizes.find((item) => item.id === (order.canvasSize as CanvasSizeId));
    return `Canvas Print (${size ? `${size.widthCm} × ${size.heightCm} cm` : order.canvasSize})`;
  }
  return 'Digital JPEG';
}

function orderEmailHtml(
  order: OrderSubmit,
  reference: string,
  links: { ultrasound: string; reference: string },
): string {
  const row = (label: string, value: string) =>
    `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
  const shipping =
    order.product === 'canvas'
      ? `<h3>Shipping Address</h3>
         <p>${escapeHtml(order.shippingFullName)}<br/>
         ${escapeHtml(order.shippingStreet)}<br/>
         ${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingState)} ${escapeHtml(order.shippingPostalCode)}<br/>
         ${escapeHtml(order.shippingCountry)}</p>`
      : '';
  return `
    <h2>New Order Received</h2>
    ${row('Reference', reference)}
    ${row('Customer Name', order.name)}
    ${row('Email', order.email)}
    ${row('Product', productLabel(order))}
    ${order.childName ? row("Child's Name", order.childName) : ''}
    ${order.weeksInWomb ? row('Weeks in Womb', order.weeksInWomb) : ''}
    ${row('Showcase permission', order.consent.showcase ? 'yes' : 'no')}
    ${order.specialRequests ? row('Special Requests', order.specialRequests) : ''}
    ${shipping}
    <p>Photos are private. Each link works for 30 days.</p>
    ${links.ultrasound ? `<p><a href="${escapeHtml(links.ultrasound)}">Ultrasound Image</a></p>` : '<p>Photo links could not be created. Find the photos for this order in the database.</p>'}
    ${links.reference ? `<p><a href="${escapeHtml(links.reference)}">Reference Image</a></p>` : ''}
  `;
}

export async function POST(request: NextRequest) {
  let requestId = createRequestCode();
  // The step that is running, so a failure is logged under the right name.
  let step = 'request';
  try {
    if (isRateLimited(clientKey(request))) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    // The browser sends the code it showed during the photo upload, so both logs share it.
    const claimed =
      typeof body === 'object' && body !== null
        ? (body as { requestCode?: unknown }).requestCode
        : undefined;
    if (isRequestCode(claimed)) requestId = claimed;

    const parsed = orderSubmitSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, message: 'Invalid order data', issues },
        { status: 400 },
      );
    }
    const order = parsed.data;

    // Honeypot filled: treat as a bot, with the same generic error.
    if (order.website !== '') {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    // Every photo must exist in private storage and pass the same checks as the browser.
    const photos = [
      { field: 'ultrasoundPath', pathname: order.ultrasoundPath },
      { field: 'referencePath', pathname: order.referencePath },
    ].filter((photo) => photo.pathname !== '');
    for (const photo of photos) {
      let error: string | null;
      try {
        const meta = await head(photo.pathname);
        error = validateStoredImage({ size: meta.size, contentType: meta.contentType });
      } catch (lookupError) {
        // Usually a visitor who never finished the upload; logged so a storage outage is visible too.
        logOrderFailure(requestId, 'photo-check', lookupError);
        error = 'Upload missing. Please upload the photo again.';
      }
      if (error) {
        return NextResponse.json(
          { success: false, message: error, issues: [{ field: photo.field, message: error }] },
          { status: 400 },
        );
      }
    }

    step = 'save';
    // A reference that is already taken is replaced and the save is tried again.
    const { reference } = await withReference(
      (candidate) => sql`
      INSERT INTO orders (
        name, email, product, canvas_size, child_name, weeks_in_womb,
        special_requests, ultrasound_image_url, reference_image_url,
        shipping_address, status, created_at, consent_showcase, consent_version, consent_at, reference
      ) VALUES (
        ${order.name},
        ${order.email},
        ${order.product},
        ${order.canvasSize || null},
        ${order.childName || null},
        ${order.weeksInWomb || null},
        ${order.specialRequests || null},
        ${order.ultrasoundPath},
        ${order.referencePath || ''},
        ${JSON.stringify(
          order.product === 'canvas'
            ? {
                fullName: order.shippingFullName,
                street: order.shippingStreet,
                city: order.shippingCity,
                state: order.shippingState,
                postalCode: order.shippingPostalCode,
                country: order.shippingCountry,
              }
            : null,
        )},
        ${'pending'},
        ${new Date().toISOString()},
        ${order.consent.showcase},
        ${order.consent.version},
        NOW(),
        ${candidate}
      );
    `,
    );

    // The order is saved from here on; a failure now is logged as links, not as a lost order.
    step = 'links';
    const expires = Date.now() + LINK_TTL_MS;
    const siteUrl = process.env.SITE_URL || new URL(request.url).origin;
    const secret = process.env.ORDER_LINK_SECRET;
    let links = { ultrasound: '', reference: '' };
    try {
      links = {
        ultrasound: buildFileLink(siteUrl, order.ultrasoundPath, expires, secret),
        reference: order.referencePath
          ? buildFileLink(siteUrl, order.referencePath, expires, secret)
          : '',
      };
    } catch (linkError) {
      // The order is already saved, so the visitor still gets success. The admin email goes out without links.
      logOrderFailure(requestId, 'links', linkError);
    }
    const subject = `New Order ${reference} - ${order.product === 'canvas' ? 'Canvas Print' : 'Digital JPEG'}`;
    const from = process.env.ORDER_FROM_EMAIL || DEFAULT_FROM;
    const contactEmail = process.env.ORDER_EMAIL || DEFAULT_ORDER_EMAIL;
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Emails are sent after the order is saved. A failed email is logged, not shown to the visitor.
    const adminEmail = {
      from,
      to: contactEmail,
      replyTo: order.email,
      subject,
      html: orderEmailHtml(order, reference, links),
    };
    const customer = buildCustomerEmail({
      locale: order.locale,
      name: order.name,
      reference,
      product: order.product,
      productLabel: productName(order.locale, order.product, order.canvasSize),
      delivery: deliveryText(order.locale, order.product),
      contactEmail,
    });
    // Replies to the customer's confirmation go to our address.
    const customerEmail = {
      from,
      to: order.email,
      replyTo: contactEmail,
      subject: customer.subject,
      text: customer.text,
    };

    // Returns whether the email was accepted, so the visitor is only told about a confirmation that is on its way.
    const sendMail = async (email: MailMessage): Promise<boolean> => {
      try {
        const sent = await resend.emails.send(email);
        if (sent.error) {
          logOrderFailure(requestId, 'email', sent.error);
          return false;
        }
        return true;
      } catch (emailError) {
        logOrderFailure(requestId, 'email', emailError);
        return false;
      }
    };
    await sendMail(adminEmail);
    const confirmationSent = await sendMail(customerEmail);

    return NextResponse.json(
      { success: true, reference, confirmationSent, message: 'Order submitted successfully' },
      { status: 201 },
    );
  } catch (error) {
    logOrderFailure(requestId, step, error);
    return NextResponse.json(
      { success: false, message: 'Failed to process order', code: requestId },
      { status: 500 },
    );
  }
}
