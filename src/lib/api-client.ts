import { Conversation, Message, Customer, Profile, Campaign } from './aws/types';

const API_BASE = '/api/v1/whatsapp';

export const apiClient = {
  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.conversations || [];
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  },

  async sendMessage(conversationId: string, content: string, type: string = 'text'): Promise<any> {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async updateConversation(id: string, updates: any): Promise<any> {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update conversation');
    return res.json();
  },

  async createConversationNote(id: string, data: { content: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/conversations/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create note');
    return res.json();
  },

  // Customers (CRM)
  async getCustomers(search: string = ''): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers?search=${encodeURIComponent(search)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const res = await fetch(`${API_BASE}/customers/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.customer || data;
  },

  // Automations
  async getAutomations(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/automations`);
    if (!res.ok) return [];
    return res.json();
  },

  async createAutomation(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/automations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create automation');
    return res.json();
  },

  async updateAutomation(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/automations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update automation');
    return res.json();
  },

  async deleteAutomation(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/automations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete automation');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) return { api_v1_enabled: true };
    return res.json();
  },

  async updateSettings(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Team
  async getTeamMembers(): Promise<Profile[]> {
    const res = await fetch(`${API_BASE}/team`);
    if (!res.ok) return [];
    return res.json();
  },

  async createTeamMember(data: any): Promise<Profile> {
      const res = await fetch(`${API_BASE}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create team member');
      return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) return null;
    return res.json();
  },

  // Campaigns
  async getCampaigns(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) return [];
    return res.json();
  },

  async createCampaign(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  },

  async updateCampaign(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update campaign');
    return res.json();
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`);
    if (!res.ok) return null;
    return res.json();
  },

  // Templates
  async getTemplates(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) return [];
    return res.json();
  },

  // Logs
  async getLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) return [];
    return res.json();
  },

  // Deals (Added for completeness)
  async getDeals(): Promise<any[]> {
    // Current deals UI doesn't have a backend route yet, return empty or implement
    return [];
  },

  async updateDeal(id: string, data: any): Promise<any> {
    return { success: true };
  }
};
