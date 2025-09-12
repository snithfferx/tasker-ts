import type { AstroCookies } from 'astro';

/**
 * Server-side authentication utilities for Astro
 * These functions run on the server and help verify authentication state
 */

interface AuthVerificationResult {
  isAuthenticated: boolean;
  userId?: string;
  error?: string;
}

/**
 * Verify if the user is authenticated on the server side
 * This is a simplified version that checks for token existence and basic validation
 */
export async function verifyAuthentication(cookies: AstroCookies): Promise<AuthVerificationResult> {
  try {
    const authToken = cookies.get('auth-token');
    
    if (!authToken) {
      return { isAuthenticated: false, error: 'No authentication token found' };
    }

    const tokenValue = authToken.value;
    
    if (!tokenValue || tokenValue.trim() === '') {
      return { isAuthenticated: false, error: 'Invalid token value' };
    }

    // Basic token format validation (Firebase JWT tokens have 3 parts separated by dots)
    const tokenParts = tokenValue.split('.');
    if (tokenParts.length !== 3) {
      return { isAuthenticated: false, error: 'Invalid token format' };
    }

    try {
      // Decode the payload (second part) to check expiration
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        // Clear the expired cookie
        cookies.delete('auth-token', { path: '/' });
        return { isAuthenticated: false, error: 'Token expired' };
      }

      // Check if token has required Firebase claims
      if (!payload.sub || !payload.aud) {
        return { isAuthenticated: false, error: 'Invalid token claims' };
      }

      return { 
        isAuthenticated: true, 
        userId: payload.sub 
      };

    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      return { isAuthenticated: false, error: 'Failed to decode token' };
    }

  } catch (error) {
    console.error('Authentication verification error:', error);
    return { isAuthenticated: false, error: 'Authentication verification failed' };
  }
}

/**
 * Check if user is authenticated (simplified check)
 * Returns just a boolean for cases where detailed error info isn't needed
 */
export async function isUserAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const result = await verifyAuthentication(cookies);
  return result.isAuthenticated;
}

/**
 * Get authenticated user ID from token
 * Returns null if user is not authenticated
 */
export async function getAuthenticatedUserId(cookies: AstroCookies): Promise<string | null> {
  const result = await verifyAuthentication(cookies);
  return result.isAuthenticated ? result.userId || null : null;
}

/**
 * Redirect unauthenticated users
 * This is a helper function that can be used in pages that require authentication
 */
export function createAuthRedirect(redirectTo: string = '/auth/login') {
  return new Response('', {
    status: 302,
    headers: {
      Location: redirectTo
    }
  });
}

/**
 * Clear authentication cookies
 * Used for logout or when invalid tokens are detected
 */
export function clearAuthCookies(cookies: AstroCookies): void {
  // Clear the cookie with appropriate settings
  // Note: When clearing cookies, we need to match the original cookie settings
  cookies.delete('auth-token', { 
    path: '/',
    httpOnly: true,
    // In development over HTTP, don't use secure flag
    secure: false, // Will be overridden by production settings if needed
    sameSite: 'lax'
  });
}
