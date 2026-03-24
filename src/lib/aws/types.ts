export interface Conversation {
  id: string;
  pk: string;
  sk: string;
  phone: string;
  name?: string;
  last_message?: string;
  last_message_at: string;
  last_inbound_message_at?: string;
  unread: number;
  status: 'open' | 'closed';
  is_paused: boolean;
  assigned_to?: string;
  platform: 'Whatsapp' | 'Email';
  customerId?: string;
}

export interface Message {
  id: string;
  pk: string;
  sk: string;
  content: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  created_at: string;
  sender_type: 'agent' | 'user' | 'system';
  attachment_url?: string;
  attachment_type?: string;
  metadata?: any;
}

export interface Customer {
  id: string;
  source_id: string;
  full_name: string;
  email?: string;
  location?: string;
  phone?: string;
  tags: string[];
  custom_data: Record<string, any>;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  is_edited?: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'agent' | 'tech_support';
  department?: string;
  avatar_url?: string;
  permissions?: Record<string, boolean>;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  language: string;
  content: string;
  status: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateName: string;
  templateContent: string;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Paused' | 'Completed' | 'Failed' | 'Archived';
  audienceCount: number;
  sent: number;
  failed: number;
  statusMessage?: string;
  createdAt: string;
}


