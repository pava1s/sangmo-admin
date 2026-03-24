const API_BASE_URL = 'https://d2x6unpvv3.execute-api.ap-south-2.amazonaws.com/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

/**
 * Specialized hooks for dashboard entities
 */
export const api = {
  getStats: () => apiFetch('/health'), // Placeholder for combined stats if implemented
  getContacts: () => apiFetch('/customers'),
  getMessages: (contactId?: string) => apiFetch(`/messages${contactId ? `?contactId=${contactId}` : ''}`),
  // Add more as routes are ported
};
