import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse, type NextRequest } from 'next/server';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/order-schema';
import { ORDER_PATH_PATTERN } from '@/lib/signed-link';
import { createRequestCode, isRequestCode } from '@/lib/request-code';
import { logOrderFailure } from '@/lib/order-log';
import { clientKey } from '@/lib/client-key';
import { isRateLimited } from '@/lib/rate-limit';

// The browser uploads photos straight to private storage using a short-lived token.
// Photos never pass through the order endpoint, so the server request size limit does not apply.
// Each order needs one token per photo, so this allows several retries per visitor.
const UPLOAD_MAX_REQUESTS = 20;

export async function POST(request: NextRequest) {
  if (isRateLimited(`upload:${clientKey(request)}`, Date.now(), UPLOAD_MAX_REQUESTS)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  // The code comes from the browser (sent as clientPayload) so a failed upload matches the code shown.
  let requestCode = createRequestCode();
  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (isRequestCode(clientPayload)) requestCode = clientPayload;
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
  } catch (error) {
    // Logged on the server so a failed upload can be diagnosed; the browser gets a generic message.
    logOrderFailure(requestCode, 'upload', error);
    return NextResponse.json({ error: 'Upload not allowed' }, { status: 400 });
  }
}
