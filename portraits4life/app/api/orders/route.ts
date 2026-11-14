import { sql } from '@vercel/postgres';
import { head } from '@vercel/blob';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { canvasSizes, digitalProduct, canvasProduct, type CanvasSizeId } from '@/content/products';
import { escapeHtml } from '@/lib/escape-html';
import { isRateLimited } from '@/lib/rate-limit';
import { orderSubmitSchema, validateStoredImage, type OrderSubmit } from '@/lib/order-schema';
import { buildFileLink } from '@/lib/signed-link';

const DEFAULT_FROM = 'onboarding@resend.dev';
const DEFAULT_ORDER_EMAIL = 'portraits4life.art@gmail.com';
const LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// TODO(client): set SITE_URL to the live domain; the default only works in development.
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

function productLabel(order: OrderSubmit): string {
  if (order.product === 'canvas') {
    const size = canvasSizes.find((item) => item.id === (order.canvasSize as CanvasSizeId));
    return `Canvas Print (${size ? `${size.widthCm} × ${size.heightCm} cm` : order.canvasSize})`;
  }
  return 'Digital JPEG';
}

function orderEmailHtml(order: OrderSubmit, orderId: unknown, links: { ultrasound: string; reference: string }): string {
  const row = (label: string, value: string) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
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
    ${row('Order ID', String(orderId))}
    ${row('Customer Name', order.name)}
    ${row('Email', order.email)}
    ${row('Product', productLabel(order))}
    ${order.childName ? row("Child's Name", order.childName) : ''}
    ${order.weeksInWomb ? row('Weeks in Womb', order.weeksInWomb) : ''}
    ${order.specialRequests ? row('Special Requests', order.specialRequests) : ''}
    ${shipping}
    <p>Photos are private. Each link works for 30 days.</p>
    <p><a href="${escapeHtml(links.ultrasound)}">Ultrasound Image</a></p>
    ${links.reference ? `<p><a href="${escapeHtml(links.reference)}">Reference Image</a></p>` : ''}
  `;
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(clientKey(request))) {
      return NextResponse.json({ success: false, message: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    const parsed = orderSubmitSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
      return NextResponse.json({ success: false, message: 'Invalid order data', issues }, { status: 400 });
    }
    const order = parsed.data;

    // Honeypot filled: treat as a bot, with the same generic error.
    if (order.website !== '') {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    // Every photo must exist in private storage and pass the same checks as the browser.
    const paths = [order.ultrasoundPath, order.referencePath].filter(Boolean);
    for (const pathname of paths) {
      try {
        const meta = await head(pathname);
        const error = validateStoredImage({ size: meta.size, contentType: meta.contentType });
        if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });
      } catch {
        return NextResponse.json({ success: false, message: 'Upload missing. Please upload the photo again.' }, { status: 400 });
      }
    }

    const result = await sql`
      INSERT INTO orders (
        name, email, product, canvas_size, child_name, weeks_in_womb,
        special_requests, ultrasound_image_url, reference_image_url,
        shipping_address, status, created_at
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
        ${JSON.stringify(order.product === 'canvas' ? {
          fullName: order.shippingFullName,
          street: order.shippingStreet,
          city: order.shippingCity,
          state: order.shippingState,
          postalCode: order.shippingPostalCode,
          country: order.shippingCountry,
        } : null)},
        ${'pending'},
        ${new Date().toISOString()}
      )
      RETURNING id, created_at;
    `;

    const orderId = result.rows[0]?.id;
    const expires = Date.now() + LINK_TTL_MS;
    const secret = process.env.ORDER_LINK_SECRET;
    const links = {
      ultrasound: buildFileLink(SITE_URL, order.ultrasoundPath, expires, secret),
      reference: order.referencePath ? buildFileLink(SITE_URL, order.referencePath, expires, secret) : '',
    };
    const subject = `New Order #${orderId} - ${order.product === 'canvas' ? 'Canvas Print' : 'Digital JPEG'}`;
    const from = process.env.ORDER_FROM_EMAIL || DEFAULT_FROM;
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Emails are sent after the order is saved. A failed email is logged, not shown to the visitor.
    const adminEmail = {
      from,
      to: process.env.ORDER_EMAIL || DEFAULT_ORDER_EMAIL,
      replyTo: order.email,
      subject,
      html: orderEmailHtml(order, orderId, links),
    };
    const customerEmail = {
      from,
      to: order.email,
      subject: 'Order Confirmed - Portraits 4 Life',
      html: `
        <h2>Thank You for Your Order!</h2>
        <p>Hi ${escapeHtml(order.name)},</p>
        <p>We've received your order and will review your images shortly.</p>
        <p><strong>Order ID:</strong> ${escapeHtml(String(orderId))}</p>
        <p><strong>Product:</strong> ${escapeHtml(productLabel(order))}</p>
        <p><strong>Expected Delivery:</strong> ${order.product === 'canvas' ? `${canvasProduct.deliveryWeeksMin}-${canvasProduct.deliveryWeeksMax} weeks` : `${digitalProduct.deliveryWeeks} week`}</p>
        <p>We'll contact you within 24 hours to confirm your images are suitable for processing.</p>
        <p>Best regards,<br/>Portraits 4 Life Team</p>
      `,
    };

    for (const email of [adminEmail, customerEmail]) {
      try {
        const sent = await resend.emails.send(email);
        if (sent.error) console.error('Order email rejected', sent.error);
      } catch (emailError) {
        console.error('Order email failed', emailError);
      }
    }

    return NextResponse.json({ success: true, orderId, message: 'Order submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Order processing failed', error);
    return NextResponse.json({ success: false, message: 'Failed to process order' }, { status: 500 });
  }
}
