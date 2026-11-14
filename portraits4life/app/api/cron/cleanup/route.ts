import { del, list } from '@vercel/blob';
import { NextResponse, type NextRequest } from 'next/server';

// Daily retention: deletes order photos uploaded more than 30 days ago.
// Vercel Cron sends the CRON_SECRET as a bearer token.
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cutoff = Date.now() - RETENTION_MS;
  const expired: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: 'orders/', limit: 1000, cursor });
    for (const blob of page.blobs) {
      if (new Date(blob.uploadedAt).getTime() < cutoff) expired.push(blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (expired.length > 0) await del(expired);
  return NextResponse.json({ deleted: expired.length });
}
