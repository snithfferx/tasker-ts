import type { APIRoute } from 'astro';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@Services/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // console.log(userCredential);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    // Use secure cookies only in production/https. In local dev over http, disable secure so the cookie is set.
    const url = new URL(request.url);
    const isSecureContext = url.protocol === 'https:';

    cookies.set('auth-token', idToken, {
      path: '/',
      httpOnly: true,
      secure: isSecureContext,
      sameSite: 'lax',
      maxAge: 3600,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';
    let status = 500;

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid credentials.';
          status = 401;
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          status = 400;
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          status = 403;
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          status = 429;
          break;
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};