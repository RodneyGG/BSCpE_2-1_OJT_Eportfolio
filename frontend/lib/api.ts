const isServer = typeof window === 'undefined';
export const API_BASE_URL = isServer 
  ? (process.env.INTERNAL_API_URL || 'http://backend:8000/api') 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api');

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Get token from localStorage if in browser
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set Content-Type only if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message || 'An error occurred',
      errors: data?.errors || {},
    };
  }

  return data;
}
