import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

interface OrderData {
  name: string;
  email: string;
  product: 'digital' | 'canvas';
  canvasSize?: string;
  childName?: string;
  weeksInWomb?: string;
  specialRequests?: string;
  shippingAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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

    // Handle file uploads
    const ultrasoundFile = formData.get('ultrasoundImage') as File | null;
    const referenceFile = formData.get('referenceImage') as File | null;

    let ultrasoundImageUrl = '';
    let referenceImageUrl = '';

    if (ultrasoundFile && ultrasoundFile.size > 0 && ultrasoundFile instanceof File) {
      try {
        const buffer = await ultrasoundFile.arrayBuffer();
        const blob = new Blob([buffer], { type: ultrasoundFile.type });
        const ultrasoundBlob = await put(
          `orders/${Date.now()}-ultrasound-${ultrasoundFile.name}`,
          blob,
          { access: 'private' }
        );
        ultrasoundImageUrl = ultrasoundBlob.url;
      } catch (fileError) {
        const errorMsg = fileError instanceof Error ? fileError.message : 'Unknown error';
        console.error('Ultrasound file upload error:', errorMsg);
        if (errorMsg.includes('blob credentials') || errorMsg.includes('BLOB_READ_WRITE_TOKEN')) {
          console.warn('Blob storage not configured, proceeding without file upload');
          ultrasoundImageUrl = '';
        } else {
          throw new Error(`Failed to upload ultrasound image: ${errorMsg}`);
        }
      }
    }

    if (referenceFile && referenceFile.size > 0 && referenceFile instanceof File) {
      try {
        const buffer = await referenceFile.arrayBuffer();
        const blob = new Blob([buffer], { type: referenceFile.type });
        const referenceBlob = await put(
          `orders/${Date.now()}-reference-${referenceFile.name}`,
          blob,
          { access: 'public' }
        );
        referenceImageUrl = referenceBlob.url;
      } catch (fileError) {
        const errorMsg = fileError instanceof Error ? fileError.message : 'Unknown error';
        console.error('Reference file upload error:', errorMsg);
        if (errorMsg.includes('blob credentials') || errorMsg.includes('BLOB_READ_WRITE_TOKEN')) {
          console.warn('Blob storage not configured, proceeding without file upload');
          referenceImageUrl = '';
        } else {
          throw new Error(`Failed to upload reference image: ${errorMsg}`);
        }
      }
    }

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

    // Send admin email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'orders@portraits4life.art',
      to: 'portraits4life.art@gmail.com',
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

    // Send customer confirmation email
    await resend.emails.send({
      from: 'orders@portraits4life.art',
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

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: 'Order submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Order submission error:', { errorMessage, errorStack, error });
    return NextResponse.json(
      { error: 'Failed to process order', details: errorMessage },
      { status: 500 }
    );
  }
}
