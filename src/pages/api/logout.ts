import type { APIRoute } from 'astro';
import { clearAuthCookies } from '@Utils/auth-server';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Clear authentication cookies using the utility function
  clearAuthCookies(cookies);
  
  // Log logout for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('User logged out via POST');
  }
  
  // Redirect to home page
  return redirect('/', 302);
};

// Handle GET requests for logout links
export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear authentication cookies using the utility function
  clearAuthCookies(cookies);
  
  // Log logout for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('User logged out via GET');
  }
  
  // Redirect to home page  
  return redirect('/', 302);
};
