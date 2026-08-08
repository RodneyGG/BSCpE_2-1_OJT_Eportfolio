const isServer = typeof window === 'undefined';
export const API_BASE_URL = isServer 
  ? (process.env.INTERNAL_API_URL || 'http://backend:8000/api') 
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

// Fetch Google Sheet preview with custom sheet URL
export async function previewBulkImport(sheetUrl: string) {
  return fetchApi(
    `/admin/students/bulk-import/preview?url=${encodeURIComponent(sheetUrl.trim())}`
  );
}

// Commit the validated rows to create users
export async function commitBulkImport(sheetUrl: string, students: Array<any>) {
  return fetchApi("/admin/students/bulk-import/commit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: sheetUrl.trim(),
      students,
    }),
  });
}
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

  // Ensure safe URL concatenation
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  const response = await fetch(`${base}/${path}`, {
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
