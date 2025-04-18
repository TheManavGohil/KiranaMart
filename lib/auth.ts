import Router from 'next/router';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

// Verify JWT token (server-side)
export const verifyToken = (token: string): any => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Save token to both localStorage and cookies
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', token);
  // Set the cookie using js-cookie with explicit path
  Cookies.set('token', token, { 
    expires: 7, // 7 days
    path: '/',  // Make cookie available across the site
    sameSite: 'lax' // Recommended for cookies that enable authenticated functionality
  });
  
  // Double-check by also setting it directly (belt and suspenders approach)
  document.cookie = `token=${token}; path=/; max-age=${60*60*24*7}; sameSite=lax`; // 7 days
};

// Save user data to localStorage
export const setUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('user', JSON.stringify(user));
};

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('token');
};

// Get user data from localStorage
export const getUser = (): any => {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove token and user data (logout)
export const removeTokenAndUser = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  Cookies.remove('token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = getToken();
  return !!token;
};

// Get user role
export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const user = getUser();
  return user ? user.role : null;
};

// Logout function
export const logout = (): void => {
  removeTokenAndUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/auth';
  }
};

// Redirect based on authentication status
export const redirectIfAuthenticated = (role?: 'vendor' | 'customer'): void => {
  if (typeof window === 'undefined') return;
  
  const isAuth = isAuthenticated();
  const userRole = getUserRole();
  
  if (isAuth) {
    if (role && userRole !== role) {
      // If role is specified and user has a different role
      if (userRole === 'vendor') {
        window.location.href = '/vendor/dashboard';
      } else {
        window.location.href = '/customer/dashboard';
      }
    } else if (userRole === 'vendor') {
      window.location.href = '/vendor/dashboard';
    } else {
      window.location.href = '/customer/dashboard';
    }
  }
};

// Redirect if not authenticated
export const redirectIfNotAuthenticated = (): void => {
  if (typeof window === 'undefined') return;
  
  const isAuth = isAuthenticated();
  
  if (!isAuth) {
    window.location.href = '/auth';
  }
}; 