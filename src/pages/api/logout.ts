import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ redirect }) => {
  // Create response with redirect to home page
  const response = redirect('/', 302);
  
  // Clear the auth cookie
  response.headers.set('Set-Cookie', 
    'auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  );

  return response;
};

// Handle GET requests for logout links
export const GET: APIRoute = async ({ redirect }) => {
  // Create response with redirect to home page
  const response = redirect('/', 302);
  
  // Clear the auth cookie
  response.headers.set('Set-Cookie', 
    'auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  );

  return response;
};
