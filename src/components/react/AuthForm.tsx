import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@Services/firebase';

type AuthMode = 'login' | 'register';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

interface AuthFormProps {
  mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<AuthFormData>>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';
    const name = formData.get('name')?.toString() || '';

    const errors: Partial<AuthFormData> = {};
    if (!email) errors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) errors.email = 'Invalid email address';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (mode === 'register' && !name) errors.name = 'Name is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(e.currentTarget.action, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }

      // Ensure Firebase client auth state is also established to satisfy AuthGuard
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (clientAuthErr) {
        // If client auth fails for some reason, still proceed but log it for debugging
        console.warn('Client Firebase sign-in failed after API success:', clientAuthErr);
      }

      // On success, redirect to dashboard
      window.location.href = '/dashboard';

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const actionUrl = mode === 'login' ? '/api/login' : '/api/register';

  return (
    <>
      <form className="mt-8 space-y-6" method="POST" action={actionUrl} onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        
        <div className="rounded-md shadow-sm -space-y-px">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Full name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Email address"
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 mb-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Password"
            />
            {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          {mode === 'login' && (
            <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </form>
      <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
        {mode === 'login' ? (
          <p>Don't have an account? <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Register</a></p>
        ) : (
          <p>Already have an account? <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a></p>
        )}
      </div>
    </>
  );
}