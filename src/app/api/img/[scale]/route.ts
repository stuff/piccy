import { NextResponse } from 'next/server';

// `/api/img/:data` with no scale segment: treat the single segment as the
// image payload and replay it through the default scale of 1.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ scale: string }> }
) {
  const { scale: data } = await params;

  return NextResponse.redirect(new URL(`/api/img/1/${data}`, request.url), 302);
}
