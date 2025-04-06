import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the protected routes
const vendorRoutes = ['/vendor'];
const customerRoutes = ['/customer'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes to pass through
  if (
    pathname === '/' || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }
  
  // Check for token
  const token = request.cookies.get('token')?.value;
  
  // If no token is present, redirect to auth page
  if (!token) {
    const url = new URL('/auth', request.url);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    const { payload } = await jwtVerify(token, secret);
    
    // Check role-based access
    const userRole = payload.role as string;
    
    // Redirect if vendor tries to access customer routes
    if (userRole === 'vendor' && 
        customerRoutes.some(route => pathname.startsWith(route))) {
      const url = new URL('/vendor/dashboard', request.url);
      return NextResponse.redirect(url);
    }
    
    // Redirect if customer tries to access vendor routes
    if (userRole === 'customer' && 
    
        vendorRoutes.some(route => pathname.startsWith(route))) {
      const url = new URL('/customer/dashboard', request.url);
      return NextResponse.redirect(url);
    }
    
    // Allow access to authorized routes
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to auth page
    const url = new URL('/auth', request.url);
    return NextResponse.redirect(url);
  }
}

// Configure middleware to only run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}; 