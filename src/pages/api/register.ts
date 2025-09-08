import type { APIRoute } from 'astro';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@Services/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const name = formData.get('name')?.toString();

    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const idToken = await user.getIdToken();

    cookies.set('auth-token', idToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 201, // 201 Created
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    let status = 500;

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          status = 409; // Conflict
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          status = 400;
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          status = 400;
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email registration is not enabled.';
          status = 500;
          break;
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};