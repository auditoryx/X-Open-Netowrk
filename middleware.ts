import { NextRequest, NextResponse } from 'next/server'

/**
 * Route-level auth used to run here using Firebase Admin to verify session
 * cookies (see `src/middleware/profileCheck.ts.bak`). That approach isn't
 * compatible with Next.js Middleware's Edge runtime, so authentication and
 * role checks are now handled client-side via `withRoleProtection` and
 * `withAdminProtection` HOCs. This middleware therefore intentionally does
 * nothing and simply allows requests to proceed.
 */
export function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
