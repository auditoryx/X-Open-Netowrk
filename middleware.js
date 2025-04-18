import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// List of public routes that don't require authentication
const publicRoutes = ['/', '/about', '/login', '/signup', '/apply'];

export async function middleware(request) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  
  // Check if the path is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Check for the JWT token in cookies
  const token = request.cookies.get('jwt')?.value;
  
  if (!token) {
    // Redirect to login page if no token is found
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  try {
    // Verify the token
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    
    // If verification is successful, continue
    return NextResponse.next();
  } catch (error) {
    // If verification fails, redirect to login
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/booking/:path*',
    '/profile/:path*',
    '/services/manage/:path*',
  ],
};
