import type { APIRoute } from 'astro';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@Services/firebase';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // Parse form data
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Attempt to sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token for session management
    const idToken = await user.getIdToken();

    // Create response with redirect
    const response = redirect('/dashboard', 302);
    
    // Set secure HTTP-only cookie with the token
    response.headers.set('Set-Cookie', 
      `auth-token=${idToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
    );

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed. Please try again.';
    
    // Handle specific Firebase errors
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
      }
    }

    // Return to login page with error
    return redirect(`/login?error=${encodeURIComponent(errorMessage)}`, 302);
  }
};

// Handle unsupported methods
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  });
};
