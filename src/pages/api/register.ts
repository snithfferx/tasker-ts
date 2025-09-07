import type { APIRoute } from 'astro';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@Services/firebase';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // Parse form data
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const name = formData.get('name')?.toString();

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Attempt to create user with Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: name
    });

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
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    // Handle specific Firebase errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email registration is not enabled.';
          break;
      }
    }

    // Return to register page with error
    return redirect(`/register?error=${encodeURIComponent(errorMessage)}`, 302);
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
