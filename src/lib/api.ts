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
  getStats: () => apiFetch('/health'),
  getContacts: () => apiFetch('/customers'),
  getMessages: (contactId?: string) => apiFetch(`/messages${contactId ? `?contactId=${contactId}` : ''}`),
  // Automations
  getAutomations: () => Promise.resolve([]),
  createAutomation: (data: any) => Promise.resolve(data),
  updateAutomation: (id: string, data: any) => Promise.resolve(data),
  deleteAutomation: (id: string) => Promise.resolve({ success: true }),
  // Deals
  getDeals: () => Promise.resolve([]),
  updateDeal: (id: string, data: any) => Promise.resolve(data),
  // Inbox / Conversations
  getConversations: (params?: any) => Promise.resolve({ conversations: [] }),
  getConversationMessages: (id: string) => Promise.resolve({ messages: [] }),
  updateConversation: (id: string, data: any) => Promise.resolve(data),
  markAsRead: (id: string) => Promise.resolve({ success: true }),
  getConversationNotes: (id: string) => Promise.resolve({ notes: [] }),
  createConversationNote: (id: string, data: any) => Promise.resolve({ note: data }),
  // Contacts
  getContact: (id: string) => apiFetch(`/contacts/${id}`),
  updateContact: (id: string, data: any) => Promise.resolve(data),
  // Team
  getTeamMembers: () => Promise.resolve([]),
  inviteTeamMember: (data: any) => Promise.resolve(data),
  updateTeamMember: (id: string, data: any) => Promise.resolve(data),
  deleteTeamMember: (id: string) => Promise.resolve({ success: true }),
  // Settings
  getAnalytics: () => Promise.resolve({}),
  getTemplates: () => Promise.resolve([]),
  getRoleSettings: () => Promise.resolve([]),
  updateRoleSettings: (data: any) => Promise.resolve(data),
  getSystemSettings: () => Promise.resolve({ api_v1_enabled: true }),
  updateSystemSettings: (data: any) => Promise.resolve(data),
};
