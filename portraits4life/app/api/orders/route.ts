import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

type Product = 'digital' | 'canvas';

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderData {
  name: string;
  email: string;
  product: Product;
  canvasSize?: string;
  childName?: string;
  weeksInWomb?: string;
  specialRequests?: string;
  shippingAddress?: ShippingAddress;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const orderData: OrderData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      product: formData.get('product') as 'digital' | 'canvas',
      canvasSize: formData.get('canvasSize') as string,
      childName: formData.get('childName') as string,
      weeksInWomb: formData.get('weeksInWomb') as string,
      specialRequests: formData.get('specialRequests') as string,
    };

    if (orderData.product === 'canvas') {
      orderData.shippingAddress = {
        fullName: formData.get('shippingFullName') as string,
        street: formData.get('shippingStreet') as string,
        city: formData.get('shippingCity') as string,
        state: formData.get('shippingState') as string,
        postalCode: formData.get('shippingPostalCode') as string,
        country: formData.get('shippingCountry') as string,
      };
    }

    // Validate required fields
    if (!orderData.name || !orderData.email || !orderData.product) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const uploadFile = async (file: File | null, prefix: string): Promise<string> => {
      if (!file || file.size === 0 || !(file instanceof File)) return '';
      try {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: file.type });
        const uploaded = await put(`orders/${Date.now()}-${prefix}-${file.name}`, blob, {
          access: 'private',
        });
        return uploaded.url;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        if (msg.includes('blob credentials') || msg.includes('BLOB_READ_WRITE_TOKEN')) {
          return '';
        }
        throw new Error(`Failed to upload ${prefix}: ${msg}`);
      }
    };

    const ultrasoundImageUrl = await uploadFile(
      formData.get('ultrasoundImage') as File | null,
      'ultrasound'
    );
    const referenceImageUrl = await uploadFile(
      formData.get('referenceImage') as File | null,
      'reference'
    );

    // Save to database
    const result = await sql`
      INSERT INTO orders (
        name, email, product, canvas_size, child_name, weeks_in_womb,
        special_requests, ultrasound_image_url, reference_image_url,
        shipping_address, status, created_at
      ) VALUES (
        ${orderData.name},
        ${orderData.email},
        ${orderData.product},
        ${orderData.canvasSize || null},
        ${orderData.childName || null},
        ${orderData.weeksInWomb || null},
        ${orderData.specialRequests || null},
        ${ultrasoundImageUrl},
        ${referenceImageUrl},
        ${JSON.stringify(orderData.shippingAddress || null)},
        ${'pending'},
        ${new Date().toISOString()}
      )
      RETURNING id, created_at;
    `;

    const orderId = result.rows[0]?.id;

    // Send emails
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmails = ['portraits4life.art@gmail.com', 'wrdevilliers@gmail.com'];

    try {
      await resend.emails.send({
        from: 'noreply@portraits4life.art',
        to: adminEmails,
        subject: `New Order #${orderId} - ${orderData.product === 'canvas' ? 'Canvas Print' : 'Digital JPEG'}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer Name:</strong> ${orderData.name}</p>
          <p><strong>Email:</strong> ${orderData.email}</p>
          <p><strong>Product:</strong> ${orderData.product === 'canvas' ? `Canvas Print (${orderData.canvasSize})` : 'Digital JPEG'}</p>
          ${orderData.childName ? `<p><strong>Child's Name:</strong> ${orderData.childName}</p>` : ''}
          ${orderData.weeksInWomb ? `<p><strong>Weeks in Womb:</strong> ${orderData.weeksInWomb}</p>` : ''}
          ${orderData.specialRequests ? `<p><strong>Special Requests:</strong> ${orderData.specialRequests}</p>` : ''}
          ${orderData.shippingAddress ? `
            <h3>Shipping Address</h3>
            <p>${orderData.shippingAddress.fullName}<br/>
            ${orderData.shippingAddress.street}<br/>
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}<br/>
            ${orderData.shippingAddress.country}</p>
          ` : ''}
          ${ultrasoundImageUrl ? `<p><a href="${ultrasoundImageUrl}">Ultrasound Image</a></p>` : ''}
          ${referenceImageUrl ? `<p><a href="${referenceImageUrl}">Reference Image</a></p>` : ''}
        `,
      });
    } catch (emailError) {
      return NextResponse.json(
        { error: 'Order saved but email notification failed', details: emailError instanceof Error ? emailError.message : 'Unknown error' },
        { status: 201 }
      );
    }

    try {
      await resend.emails.send({
        from: 'noreply@portraits4life.art',
        to: orderData.email,
        subject: 'Order Confirmed - Portraits 4 Life',
        html: `
          <h2>Thank You for Your Order!</h2>
          <p>Hi ${orderData.name},</p>
          <p>We've received your order and will review your images shortly.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Product:</strong> ${orderData.product === 'canvas' ? `Canvas Print (${orderData.canvasSize})` : 'Digital JPEG'}</p>
          <p><strong>Expected Delivery:</strong> ${orderData.product === 'canvas' ? '1-2 weeks' : '1 week'}</p>
          <p>We'll contact you within 24 hours to confirm your images are suitable for processing.</p>
          <p>Best regards,<br/>Portraits 4 Life Team</p>
        `,
      });
    } catch (emailError) {
      // Customer email failed but order is saved
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: 'Order submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process order', details: message },
      { status: 500 }
    );
  }
}
