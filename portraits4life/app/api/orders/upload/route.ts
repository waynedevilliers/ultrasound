import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse, type NextRequest } from 'next/server';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/order-schema';
import { ORDER_PATH_PATTERN } from '@/lib/signed-link';

// The browser uploads photos straight to private storage using a short-lived token.
// Photos never pass through the order endpoint, so the server request size limit does not apply.
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!ORDER_PATH_PATTERN.test(pathname)) {
          throw new Error('Invalid upload path');
        }
        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 15 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Upload not allowed' }, { status: 400 });
  }
}
