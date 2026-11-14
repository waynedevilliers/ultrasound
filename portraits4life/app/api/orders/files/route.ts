import { get } from '@vercel/blob';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyFileLink } from '@/lib/signed-link';

// Serves one private order photo to a valid, unexpired signed link from the order email.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = {
    pathname: searchParams.get('p'),
    expires: searchParams.get('exp'),
    sig: searchParams.get('sig'),
  };
  if (!verifyFileLink(input, process.env.ORDER_LINK_SECRET)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const result = await get(input.pathname as string, { access: 'private' });
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return new Response(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
