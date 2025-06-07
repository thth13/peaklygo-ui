import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;
  const userId = req.cookies.get('userId')?.value;

  if (token && userId) {
    return NextResponse.redirect(new URL(`/profile/${userId}`, req.url));
  }
}

export const config = {
  matcher: ['/', '/auth/login', '/auth/register'],
};
