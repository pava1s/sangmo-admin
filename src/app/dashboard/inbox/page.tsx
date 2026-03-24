'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sounds (Base64 for zero-dependency)
const SOUND_INCOMING = 'data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1iOAAcn5aaDaaaa8AAAA8////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////'; const SOUND_OUTGOING = 'data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG1iOAAcn5aaDaaaa8AAAA8////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';
import {
  Search,
  MoreVertical,
  Phone,
  MapPin,
  Mail,
  Tag,
  Plus,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Send,
  Pause,
  Filter,
  CheckCircle2,
  Clock,
  User,
  File,
  Download,
  FileText,
  ChevronDown // Re-added (single)
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { DashboardEmptyState } from '@/components/dashboard/EmptyState';
import { authFetch } from '@/utils/api-client';

// --- MOCK DATA ---

const MOCK_USERS = {
  me: { id: 'me', name: 'Agent', avatar: 'https://ui-avatars.com/api/?name=Agent&background=2FBF71&color=fff' },
  customer1: { id: 'c1', name: 'Mr. Rosemary Koss', avatar: 'https://i.pravatar.cc/150?u=1' },
  customer2: { id: 'c2', name: 'Cora Goyette', avatar: 'https://i.pravatar.cc/150?u=2' },
  customer3: { id: 'c3', name: 'Mrs. Darin O\'Keefe', avatar: 'https://i.pravatar.cc/150?u=3' },
  customer4: { id: 'c4', name: 'Irene Dicki', avatar: 'https://i.pravatar.cc/150?u=4' },
};

const MOCK_CONVERSATIONS = [
  {
    id: '1',
    user: MOCK_USERS.customer1,
    preview: 'Hi, I want to ask something...',
    time: '13:34',
    unread: 1,
    status: 'Open',
    platform: 'Whatsapp'
  },
  {
    id: '2',
    user: MOCK_USERS.customer2,
    preview: 'Hi, I want to ask something t...',
    time: '13:30',
    unread: 0,
    status: 'Open',
    platform: 'Whatsapp'
  },
  {
    id: '3',
    user: MOCK_USERS.customer3,
    preview: 'Hi, I want to ask something...',
    time: '12:45',
    unread: 3,
    status: 'Pending',
    platform: 'SMS'
  },
  {
    id: '4',
    user: MOCK_USERS.customer4,
    preview: 'Hi, I want to ask something...',
    time: '11:20',
    unread: 1,
    status: 'Open',
    platform: 'Instagram'
  },
];

const MOCK_MESSAGES = {
  '2': [
    { id: 'm1', sender: 'them', text: 'Thank you. Please enter the amount and date of the transaction (e.g., $100, December 21th).', time: '13.34' },
    { id: 'm2', sender: 'me', text: '$50, November 30th.', time: '13.34' },
    { id: 'm3', sender: 'them', text: 'Thank you! It seems there might be a delay in processing the transaction. What would you like to do next?', time: '13.34', actions: ['Retry Checking the Balance', 'Speak to a Representative'] },
    { id: 'm4', sender: 'me', text: 'Speak to a Representative', time: '13.34' },
    { id: 'sys1', sender: 'system', text: 'Chat got taken over by customer service', time: '' },
    { id: 'm5', sender: 'them', text: 'Hi, this is Alex from Customer Support. I see you\'re having an issue with your top-up. Could you confirm if the $50 transaction on November 30th is showing in your bank statement or pending?', time: '13.34' },
  ],
  '1': [
    { id: 'm1', sender: 'them', text: 'Hello, I have a question about my booking.', time: '10:00' },
  ]
};

const MOCK_CUSTOMER_DETAILS = {
  '2': {
    name: 'Cora Goyette',
    status: 'Online',
    channel: 'WhatsApp B2B',
    id: '2023113142356',
    phone: '+62 679 7622 9012',
    address: '5467 Richmond View Suite 511, Sunrise, Kentucky, 43546-6636',
    notes: [
      { id: 'n1', author: 'Justin Hickle', date: 'Feb 23, 18:43', text: 'Send Sarah an update by email by 4 PM tomorrow.' },
      { id: 'n2', author: 'Ellen Hirthe', date: 'Feb 23, 18:43', text: 'Promised to update her within 24 hours.' },
      { id: 'n3', author: 'Desiree Koepp', date: 'Feb 23, 18:43', text: 'Confirmed she has tried multiple cards and reinstalled the app.' },
    ]
  }
};

// --- COMPONENTS ---

export default function InboxPage() {
  const [activeId, setActiveId] = useState<string | null>(null); // Initial null, set after fetch
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]); // REAL MESSAGES
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // --- ATTACHMENT STATE ---
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'document'>('document');
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  // --- NOTES STATE ---
  const [notes, setNotes] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  // --- CUSTOMER STATE ---
  const [customer, setCustomer] = useState<any>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // --- FUNCTIONAL STATE ---
  const [isPaused, setIsPaused] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'me' | 'unassigned'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all'); // NEW STATUS FILTER
  const [selectedTeam, setSelectedTeam] = useState<string>('All'); // New Team Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  // Fetch User on Mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  // Sound Refs
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Poll Ref to track last message ID for sound trigger
  const lastMessageIdsRef = useRef<Set<string>>(new Set());

  // AUTO-SCROLL LOGIC
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll on new messages or activeId change
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeId]);

  // AUDIO INIT (Unlock AudioContext)
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      // Remove listeners once unlocked
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const playTone = (type: 'incoming' | 'outgoing') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Create Oscillator and Gain
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'incoming') {
      // "Ding-Dong" or High Bell
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
      gain.gain.setValueAtTime(0.9, now); // Volume High
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // "Pop" / Swoosh
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.8, now); // Volume High
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  };

  const playIncoming = () => playTone('incoming');
  const playOutgoing = () => playTone('outgoing');

  // Polling Logic (Auto-Sync)
  useEffect(() => {
    const interval = setInterval(() => {
      // Poll Conversations List (Silent)
      fetchConversations(true);

      // Poll Active Conversation Messages (Silent)
      if (activeId) {
        fetchMessages(activeId, true);
      }
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [filterMode, activeId, selectedTeam]); // Re-bind if filter or active ID changes


  const activeConv = conversations.find(c => c.id === activeId);

  // 1. FETCH REAL CONVERSATIONS
  // 1. FETCH REAL CONVERSATIONS
  async function fetchConversations(silent = false) {
    if (!silent) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMode === 'me') params.append('assigned_to', 'me');
      if (filterMode === 'unassigned') params.append('assigned_to', 'unassigned');
      if (selectedTeam !== 'All') params.append('assigned_team', selectedTeam);
      if (searchTerm) params.append('search', searchTerm);

      const url = `/api/conversations?${params.toString()}`;

      const res = await authFetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await res.json();
      const mapped = (data.conversations || []).map((c: any) => ({
        id: c.id,
        user: {
          name: c.name || c.phone,
          phone: c.phone,
          avatar: `https://ui-avatars.com/api/?name=${c.name || 'User'}&background=random`
        },
        preview: c.last_message || 'Start a conversation',
        time: c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '',
        unread: c.unread || 0,
        status: c.status || 'Open',
        is_paused: c.is_paused,
        assigned_to: c.assigned_to,
        assignee: c.assignee, // Map the joined profile data
        last_inbound_message_at: c.last_inbound_message_at,
        platform: c.platform || 'Whatsapp',
        customerId: c.customer_id // Ensure we have this for customer details
      }));

      setConversations(mapped);

      // Auto-select first if none active
      if (!activeId && mapped.length > 0 && !silent) {
        setActiveId(mapped[0].id);
      }
    } catch (err) {
      console.error("API Error (Conversations):", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  // Search Debounce Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterMode, selectedTeam]);

  // 2. FETCH REAL MESSAGES
  // 2. FETCH REAL MESSAGES
  // Moved out of useEffect to allow Polling
  async function fetchMessages(id: string, silent = false) {
    if (!silent) setIsMessagesLoading(true);
    try {
      const res = await authFetch(`/api/conversations/${id}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const msgs = data.messages || [];

      setMessages(msgs);

      // Sound Check Logic
      if (silent && msgs.length > 0) {
        const newest = msgs[msgs.length - 1];
        if (!lastMessageIdsRef.current.has(newest.id)) {
          // New message detected
          if (newest.direction === 'inbound') {
            playIncoming();
          }
          // Add to seen set
          msgs.forEach((m: any) => lastMessageIdsRef.current.add(m.id));
        }
      } else {
        // Initial load, mark seen
        msgs.forEach((m: any) => lastMessageIdsRef.current.add(m.id));
      }

    } catch (err) {
      console.error("API Error (Messages):", err);
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setIsMessagesLoading(false);
    }
  }

  React.useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId);

    // MARK AS READ LOGIC
    const markAsRead = async () => {
      // 1. Optimistic Update
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, unread: 0 } : c
      ));

      // 2. API Call
      try {
        await authFetch(`/api/conversations/${activeId}/read`, { method: 'POST' });
        // No need to refetch conversations immediately as we did optimistic update
        // but the poller will eventually sync it anyway.
      } catch (e) {
        console.error("Failed to mark as read", e);
      }
    };
    markAsRead();

  }, [activeId]);

  // 4. FETCH REAL NOTES
  React.useEffect(() => {
    if (!activeId) return;
    async function fetchNotes() {
      setIsNotesLoading(true);
      try {
        const res = await authFetch(`/api/conversations/${activeId}/notes`);
        if (res.ok) {
          const data = await res.json();
          setNotes(data.notes || []);
        }
      } catch (e) {
        console.error("Fetch notes error", e);
      } finally {
        setIsNotesLoading(false);
      }
    }
    fetchNotes();
  }, [activeId]);

  // 5. FETCH REAL CUSTOMER
  React.useEffect(() => {
    if (!activeId || !activeConv) return;
    async function fetchCustomer() {
      setIsCustomerLoading(true);
      setCustomer(null);
      setIsEditingCustomer(false); // Fix: Reset edit mode to prevent crash on non-existent customer
      try {
        // Fix: use customerId (camelCase) as mapped in fetchConversations
        if (activeConv.customerId) {
          const res = await authFetch(`/api/customers/${activeConv.customerId}`);
          if (res.ok) {
            const data = await res.json();
            setCustomer(data.customer);
            setEditForm(data.customer || {});
          }
        }
      } catch (e) {
        console.error("Fetch customer error", e);
      } finally {
        setIsCustomerLoading(false);
      }
    }
    fetchCustomer();
  }, [activeId, activeConv?.customerId]); // Depend on ID change





  // Sync Pause State with Active Conversation (When switching chats)
  React.useEffect(() => {
    if (activeConv) {
      setIsPaused(activeConv.is_paused || false);
    }
  }, [activeConv]);

  // Derived States
  const details = customer;


  const isClosed = activeConv?.status?.toLowerCase() === 'closed';
  // Derive isAssigned status
  // Since we don't know "Me" ID easily without context, we rely on the fact that if we filtered by 'me', it is me.
  // For the header button, we want to know if it's assigned to ANYONE or ME.
  // Ideally we need the current user ID. 
  // For Phase 4, let's assume if assigned_to is NOT NULL, it is assigned.
  const isAssigned = !!activeConv?.assigned_to;


  // 3. WHATSAPP 24H RULE (Real Logic)
  // We check the LAST INBOUND message from the fetched list
  const lastInbound = [...messages].reverse().find(m => m.direction === 'inbound');
  let isWindowActive = true;

  if (lastInbound && lastInbound.created_at) {
    // TRUST THE MESSAGES LIST FIRST (Most actual data)
    const diff = new Date().getTime() - new Date(lastInbound.created_at).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours > 24) isWindowActive = false;
  } else if (activeConv?.last_inbound_message_at) {
    // Fallback: If no loaded messages, use conversation metadata
    const diff = new Date().getTime() - new Date(activeConv.last_inbound_message_at).getTime();
    if ((diff / (1000 * 60 * 60)) > 24) isWindowActive = false;
  }


  // --- ACTIONS ---

  const handleSendMessage = async () => {
    if (!input.trim() || !activeId) return;

    const tempId = 'temp-' + Date.now();
    const optimisicMsg = {
      id: tempId,
      conversation_id: activeId,
      content: input,
      direction: 'outbound',
      sender_type: 'agent',
      status: 'sending',
      created_at: new Date().toISOString()
    };

    // Optimistic UI
    setMessages(prev => [...prev, optimisicMsg]);
    setInput('');

    try {
      const url = `/api/conversations/${activeId}/messages`;
      const res = await authFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: optimisicMsg.content, type: 'text' })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Msg Send Error status:", res.status, errText);
        let errMsg = 'Failed to send';
        try {
          const json = JSON.parse(errText);
          errMsg = json.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
        // Mark as failed instead of removing
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', error: errMsg } : m));
        return;
      }

      const data = await res.json();
      // Replace temp with real
      setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
      playOutgoing();
      fetchConversations(true); // Update snippet silently

    } catch (e: any) {
      console.error("Send failed", e);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed', error: e.message } : m));
    }
  };

  const handleSaveNote = async () => {
    if (!noteInput.trim() || !activeId) return;
    setIsNotesLoading(true); // Re-use loading state or add a specific one if prefered, but for now simple feedback

    try {
      const res = await authFetch(`/api/conversations/${activeId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteInput })
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(prev => [
          { ...data.note, author_name: 'Me' },
          ...prev
        ]);
        setNoteInput('');
      } else {
        console.error("Failed to save note:", data.error);
        alert(`Failed to save note: ${data.error}`);
      }
    } catch (e) {
      console.error("Save note error", e);
      alert("An error occurred while saving the note. Please try again.");
    } finally {
      setIsNotesLoading(false);
    }
  };

  const updateConversation = async (updates: any) => {
    if (!activeId) return;

    // Optimistic UI Update
    const prevConversations = [...conversations];
    const updatedConversations = conversations.map(c =>
      c.id === activeId ? { ...c, ...updates } : c
    );
    setConversations(updatedConversations);

    // Also update local paused state immediately for UI responsiveness
    if (updates.is_paused !== undefined) setIsPaused(updates.is_paused);

    try {
      const res = await authFetch(`/api/conversations/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Update failed status:", res.status, errText);
        let errMsg = 'Failed to update';
        try {
          const json = JSON.parse(errText);
          errMsg = json.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }
      // Optional: Sync with real server response if needed
    } catch (err) {
      console.error("Update failed", err);
      // Revert
      setConversations(prevConversations);
      if (updates.is_paused !== undefined) setIsPaused(!updates.is_paused);
      alert("Failed to update conversation state");
    }
  };

  const handlePause = () => updateConversation({ is_paused: true });
  const handleResume = () => updateConversation({ is_paused: false });

  const handleClose = () => updateConversation({ status: 'closed' });
  const handleReopen = () => updateConversation({ status: 'open' });

  const handleRetry = async (id: string, content: string) => {
    // 1. Set to sending
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'sending', error: undefined } : m));

    try {
      const res = await authFetch(`/api/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content, type: 'text' })
      });

      if (!res.ok) {
        const err = await res.json();
        // Mark as failed again
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'failed', error: err.error } : m));
        return;
      }

      const data = await res.json();
      // Success: Replace temp ID with real ID
      setMessages(prev => prev.map(m => m.id === id ? data.message : m));
      playOutgoing();
      fetchConversations(true);

    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'failed', error: e.message } : m));
    }
  };

  // CUSTOMER ACTIONS
  const handleEditToggle = () => {
    if (isEditingCustomer) {
      setIsEditingCustomer(false);
      setEditForm(customer); // Revert
    } else {
      setIsEditingCustomer(true);
      setEditForm(customer); // Init form
    }
  };

  const handleSaveCustomer = async () => {
    if (!customer?.id) return;

    try {
      const res = await authFetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const data = await res.json();
        // Ensure we handle both wrapped { customer: ... } and direct object if API varies
        // Our API returns { customer: ... } or just the object? based on route.ts it returns just `data` (the object).
        // WAIT: api/customers/[id] returns `NextResponse.json(data)`. So it is DIRECT object.
        // BUT fetchCustomer in useEffect expects `data.customer`.
        // Let's standardise or check.
        // Reviewing route.ts: `return NextResponse.json(data);` where data is from `.single()`.
        // So it returns `{ id: ..., full_name: ... }`.
        // BUT `fetchCustomer` (line 330) does `setCustomer(data.customer)`.
        // THIS IS THE BUG. The GET returns `{ customer: data }` (I added that).
        // The PATCH returns `data` (direct).
        // FIX: Update PATCH to return `{ customer: data }` to be consistent, OR update frontend to handle direct.
        // Safer to update Frontend to check both.

        const newCustomerRel = data.customer || data;
        setCustomer(newCustomerRel);
        setEditForm(newCustomerRel);
        setIsEditingCustomer(false);
      } else {
        alert('Failed to save customer');
      }
    } catch (e) {
      console.error("Save customer error", e);
    }
  };

  const handleAddAttribute = () => {
    const newCustom = { ...(editForm.custom_data || {}), '': '' };
    setEditForm({ ...editForm, custom_data: newCustom });
  };

  const handleUpdateAttribute = (key: string, value: string, oldKey: string) => {
    const newCustom = { ...(editForm.custom_data || {}) };
    if (key !== oldKey) {
      delete newCustom[oldKey];
      newCustom[key] = value;
    } else {
      newCustom[key] = value;
    }
    setEditForm({ ...editForm, custom_data: newCustom });
  };

  const handleAssignToMe = async () => {
    // If already assigned (to anyone), maybe this button unassigns? 
    // Or claims it? Let's assume CLAIM semantics (overwrite).
    // Or simple toggle: If assigned -> Unassign. If unassigned -> Assign to Me.
    // We need "Me" ID for assignment, but the API handles "assigned_to" in body.
    // Actually, we pass the user ID. But usually backend knows "Me".
    // Let's pass "me" as a magic string or let backend handle it?
    // The API expects 'assigned_to' UUID.
    // The `updateConversation` helper calls PATCH. 

    // STRATEGY: 
    // 1. Fetch "Me" ID? No, too slow.
    // 2. Let's make the API accept a special flag or just use the current session User ID on backend if we send a specific signal.
    // However, my `route.ts` (Phase 2) setup: `updates.assigned_to = assigned_to`.
    // I can't easily get my own ID here without a context.
    // FIX: I will modify the `updateConversation` to support the logic. 
    // Actually, I'll assume for now I can just send the assignment. 
    // Wait, I can't send "Me" ID if I don't have it.
    // I will use a clever hack: `updateConversation({ assigned_to: 'me' })` is NOT valid UUID.
    // I need to fetch my profile or have the API handle 'me'.
    // Let's update the API in the next step or assume I'll do it.
    // BUT I can't update API in this tool call.
    // Let's check `auth.ts`. `getCurrentUser()` returns ID.
    // I'll implementation a quick `fetchMe` or just handle it in the UI if possible.
    // BETTER: The API `PATCH` I wrote takes `assigned_to` from body.
    // NOTE: The previous API step used `getCurrentUser`.
    // I will update the API to handle the string "me" -> current user ID.
    // For now, let's assume `assign_to_me: true` property? No.

    // Plan: I'll handle the button click -> `updateConversation({ assigned_to: 'CLAIM_ME' })`.
    // And strictly update the API to handle 'CLAIM_ME'. 
    // For this step I'll write the frontend code to send the current user's ID if I have it? I don't.
    // I'll stick to: The "user" button will just log for now until I fix the API to handle "assign to me" logic or I fetch the user.

    // actually, let's use the 'me' mock user ID if we have to, or better:
    // I will make the PATCH endpoint handle a special case `assign_action: 'claim'`.
  };

  // Re-write of handleAssignToMe for tool:
  const handleToggleAssignment = () => {
    // Toggle logic
    if (activeConv?.assigned_to) {
      // Unassign
      updateConversation({ assigned_to: null });
    } else {
      // Assign to "me" (API must handle this or I need ID)
      // Since I can't get ID easily synchronously... 
      // I will use a special value that the API will interpret, OR
      // I'll just use the `user.id` from the `activeConv` if I was the one... wait.
      // Assign to "me" (The API will now interpret 'me' as the current user)
      updateConversation({ assigned_to: 'me' });
    }
  };

  // --- FILE ATTACHMENTS ---
  const handleTriggerFileUpload = (type: 'image' | 'document') => {
    // Enforcement Check
    if (activeConv?.status === 'Closed') return alert("Cannot send attachments in a closed conversation.");
    if (activeConv?.is_paused) return alert("Cannot send attachments while paused.");

    // 24h Window Check (Strict for media)
    let isWindowOpen = true;
    if (activeConv?.last_inbound_message_at) {
      const diff = new Date().getTime() - new Date(activeConv.last_inbound_message_at).getTime();
      if ((diff / (1000 * 60 * 60)) > 24) isWindowOpen = false;
    }
    if (!isWindowOpen) return alert("24-hour window expired. Attachments are not allowed.");

    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt'; // Basic document types
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;

    // VALIDATION
    const maxSize = uploadType === 'image' ? 5 * 1024 * 1024 : 16 * 1024 * 1024; // 5MB Img, 16MB Doc
    if (file.size > maxSize) {
      alert(`File too large. Max size is ${uploadType === 'image' ? '5MB' : '16MB'}.`);
      e.target.value = ''; // Reset
      return;
    }
    // Simple Type Check
    if (uploadType === 'image' && !file.type.startsWith('image/')) {
      alert("Invalid file type. Please select an image.");
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const fileName = `${activeId}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(fileName);

      // Send Message with Attachment
      // Reuse handleSendMessage logic or call API directly
      // We call API directly here for custom payload

      const tempId = 'temp-' + Date.now();
      const optimisicMsg = {
        id: tempId,
        conversation_id: activeId,
        content: uploadType === 'image' ? 'Image' : 'Attachment', // Fallback text
        direction: 'outbound',
        sender_type: 'agent',
        status: 'sending',
        created_at: new Date().toISOString(),
        attachment_url: publicUrl,
        attachment_type: uploadType,
        type: uploadType
      };

      setMessages(prev => [...prev, optimisicMsg]);

      const res = await authFetch(`/api/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: file.name, // Use filename as content/caption? Or empty? Logic says content required OR attachment.
          type: uploadType,
          attachment_url: publicUrl,
          attachment_type: uploadType
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        setMessages(prev => prev.filter(m => m.id !== tempId));
      } else {
        const resData = await res.json();
        setMessages(prev => prev.map(m => m.id === tempId ? resData.message : m));
        playOutgoing();
        fetchConversations(true);
      }

    } catch (error: any) {
      console.error("Upload failed", error);
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">


      {/* 1. LEFT PANEL: CHAT LIST */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">

        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">W</div>
            Chat
          </h1>
        </div>

        {/* Team Filter Tabs */}
        <div className="px-4 pt-3 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Sales', 'Support', 'Tech'].map(team => (
              <button
                key={team}
                onClick={() => { setSelectedTeam(team); setFilterMode('all'); }}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedTeam === team
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
              >
                {team === 'All' ? 'All' : `${team}`}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">K</span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${statusFilter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${statusFilter === 'open' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${statusFilter === 'closed' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Closed
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">Ownership</div>
          <button
            onClick={() => setFilterMode('all')}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg ${filterMode === 'all' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            Everyone
          </button>
          <button
            onClick={() => setFilterMode('me')}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg ${filterMode === 'me' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            Assigned to me
          </button>
          <button
            onClick={() => setFilterMode('unassigned')}
            className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg ${filterMode === 'unassigned' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' : 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            Unassigned
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase">Recent</div>
          {isLoading && <div className="p-4 text-center text-slate-400 text-xs">Loading...</div>}
          {conversations
            .filter(c => {
              // 1. Status Filter
              if (statusFilter !== 'all') {
                const s = c.status?.toLowerCase() || 'open';
                if (s !== statusFilter) return false;
              }

              // 2. Search Filter
              if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return c.user.name.toLowerCase().includes(term) || (c.user.phone?.includes(term));
              }
              return true;
            })
            .map(c => {
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`px-4 py-3 cursor-pointer border-l-4 border-b border-dashed border-emerald-100/50 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-start gap-3 transition-colors ${activeId === c.id ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-l-transparent'}`}
                >
                  <div className="relative">
                    <img src={c.user.avatar} alt="" className={`w-10 h-10 rounded-full object-cover border-2 ${c.status === 'open' ? 'border-emerald-500' : 'border-slate-300 grayscale'}`} />

                    {/* STATUS INDICATOR (Top Right) */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${c.status === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`} title={c.status === 'open' ? 'Open' : 'Closed'}>
                      {c.status !== 'open' && <span className="text-[8px] text-white font-bold">✕</span>}
                    </div>

                    {/* ASSIGNEE / PLATFORM (Bottom Right) */}
                    {c.assignee ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-indigo-500 flex items-center justify-center shadow-sm" title={`Assigned to ${c.assignee.full_name || 'Agent'}`}>
                        {c.assignee.avatar_url ? (
                          <img src={c.assignee.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold text-white uppercase leading-none">{c.assignee.full_name?.[0] || 'A'}</span>
                        )}
                      </div>
                    ) : (
                      c.platform === 'Whatsapp' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#25D366] rounded-full border-2 border-white dark:border-slate-900" title="WhatsApp"></div>
                    )}

                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={`text-sm font-semibold truncate ${activeId === c.id ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-900 dark:text-slate-100'}`}>{c.user.name}</h3>
                      {c.unread > 0 && <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center rounded-full ml-2 shadow-sm">{c.unread}</span>}
                    </div>
                    <p className={`text-sm truncate ${activeId === c.id ? 'text-emerald-700/80 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{c.preview}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* 2. MIDDLE PANEL: ACTIVE STREAM */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0 border-r border-slate-200 dark:border-slate-800">
        {activeId ? (
          <>
            {/* Headers */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={activeConv?.user.avatar} className="w-10 h-10 rounded-full" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">{activeConv?.user.name}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">● Online</p>
                    {isPaused && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold">PAUSED</span>}
                    {isClosed && <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">CLOSED</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isClosed && (
                  isPaused ? (
                    <button onClick={handleResume} className="h-9 px-4 flex items-center gap-2 bg-yellow-100 border border-yellow-200 rounded-lg text-sm font-bold text-yellow-800 hover:bg-yellow-200 transition-colors">
                      <Pause className="w-4 h-4 fill-current" /> Resume
                    </button>
                  ) : (
                    <button onClick={handlePause} className="h-9 px-4 flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  )
                )}

                {isClosed ? (
                  <button onClick={handleReopen} className="h-9 px-4 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
                    Reopen
                  </button>
                ) : (
                  <button onClick={handleClose} className="h-9 px-4 flex items-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200">
                    <CheckCircle2 className="w-4 h-4" /> Close
                  </button>
                )}

                <button
                  onClick={handleToggleAssignment}
                  className={`h-9 w-9 flex items-center justify-center border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 ${isAssigned ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                  title={isAssigned ? "Assigned (Click to Unassign)" : "Assign to Me"}
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area with CSS Pattern Background */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] dark:bg-[#020617] relative">
              {/* Subtle Dot Pattern */}
              <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

              <div className="relative z-10">
                {isMessagesLoading && messages.length === 0 && (
                  <div className="flex justify-center p-4"><span className="text-xs text-slate-400">Loading messages...</span></div>
                )}
                {messages.length === 0 && !isMessagesLoading && (
                  <div className="flex justify-center p-4"><span className="text-xs text-slate-400">No messages yet.</span></div>
                )}
                <AnimatePresence>
                  {messages.map((m, index) => {
                    // DATE SEPARATOR LOGIC
                    const showDateSeparator = (() => {
                      if (index === 0) return true;
                      const prevDate = new Date(messages[index - 1].created_at).toDateString();
                      const currDate = new Date(m.created_at).toDateString();
                      return prevDate !== currDate;
                    })();

                    const dateLabel = new Date(m.created_at).toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
                    const isToday = new Date(m.created_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }) === new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' });

                    // TEMPLATE DETECTION
                    const isTemplate = m.content?.startsWith('API Template:');

                    return (
                      <React.Fragment key={m.id}>
                        {/* Date Divider */}
                        {showDateSeparator && (
                          <div className="flex justify-center my-6 sticky top-0 z-20">
                            <span className="bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
                              {isToday ? 'Today' : dateLabel}
                            </span>
                          </div>
                        )}

                        {m.sender_type === 'system' ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-center my-6"
                          >
                            <div className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-200 dark:border-slate-800 shadow-sm">
                              <Tag className="w-3 h-3" /> {m.content}
                            </div>
                          </motion.div>
                        ) : isTemplate ? (
                          // TEMPLATE CARD RENDERER (Aligned Right as it's outbound)
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end my-4 px-4"
                          >
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl rounded-tr-none p-3 shadow-md max-w-xs w-full">
                              <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                  <FileText className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                  Template Sent
                                </span>
                                <span className="ml-auto text-[10px] text-slate-400">
                                  {m.created_at ? new Date(m.created_at.endsWith('Z') ? m.created_at : m.created_at + 'Z').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : ''}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">
                                {m.content.replace('API Template: ', '')}
                              </p>
                              <div className="mt-2 flex justify-end">
                                <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Delivered
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          // STANDARD MESSAGE BUBBLE
                          (() => {
                            const isOutbound = m.direction === 'outbound' || m.sender_type === 'agent';
                            // FIX: Ensure created_at is treated as UTC by appending Z if missing, then convert to IST
                            const timeVal = m.created_at ? (m.created_at.endsWith('Z') ? m.created_at : m.created_at + 'Z') : null;
                            const formattedTime = timeVal ? new Date(timeVal).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '';

                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex w-full mb-6 ${isOutbound ? 'justify-end' : 'justify-start'}`}
                              >
                                {/* AVATAR (Left only for Inbound) */}
                                {!isOutbound && (
                                  <div className="flex-shrink-0 mr-3 mt-1 relative">
                                    <img src={activeConv?.user.avatar} className="w-9 h-9 rounded-full shadow-md object-cover border border-white dark:border-slate-800" alt="User" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                  </div>
                                )}

                                {/* MESSAGE BUBBLE */}
                                <div className={`max-w-[75%] flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                                  <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm relative group transition-all duration-200 ${isOutbound
                                    ? 'bg-sky-500 text-white rounded-tr-none hover:bg-sky-600'
                                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800 hover:shadow-md'
                                    }`}>
                                    {m.content}
                                  </div>

                                  {/* ATTACHMENTS */}
                                  {m.attachment_url && (
                                    <div className={`mt-2 ${isOutbound ? 'text-right' : 'text-left'}`}>
                                      {m.attachment_type === 'image' ? (
                                        <img src={m.attachment_url} alt="Attachment" className="max-w-[200px] rounded-lg border border-slate-200 shadow-sm" />
                                      ) : (
                                        <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-200">
                                          <File className="w-4 h-4" />
                                          <span className="truncate max-w-[150px]">Download File</span>
                                          <Download className="w-3 h-3 opacity-50" />
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {/* METADATA */}
                                  <div className="flex items-center gap-1 mt-1 px-1">
                                    <span className="text-[10px] text-slate-400 font-medium mix-blend-multiply dark:mix-blend-screen">{formattedTime}</span>
                                    {isOutbound && (
                                      m.status === 'failed' ? (
                                        <button onClick={() => handleRetry(m.id, m.content)} className="ml-1 text-red-500 text-[10px] font-bold hover:underline flex items-center gap-1">
                                          ⚠ Retry
                                        </button>
                                      ) : (
                                        <span className="text-blue-500 text-[10px] ml-1">
                                          {m.status === 'read' ? '✓✓' : m.status === 'delivered' ? '✓✓' : (m.status === 'sending' ? '...' : '✓')}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - STATE CONTROLLED */}
            <div className="p-4 bg-white border-t border-slate-200">
              {isClosed ? (
                <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> This conversation is closed.
                </div>
              ) : isPaused ? (
                <div className="h-12 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center gap-2 text-yellow-700 text-sm font-medium animate-pulse">
                  <Pause className="w-4 h-4" /> Conversation is paused. Resume to reply.
                </div>
              ) : !isWindowActive ? (
                <div className="h-12 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between px-4 text-orange-800 text-sm font-medium">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 24-hour window expired.</div>
                  <button className="text-xs bg-white border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-100 font-bold shadow-sm">Select Template</button>
                </div>
              ) : (
                <div className="flex gap-2 items-end w-full">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white resize-none min-h-[48px] max-h-[120px]"
                    rows={1}
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleTriggerFileUpload('document')}
                      className="h-[48px] w-[48px] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all"
                      title="Attach File"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                      className={`h-[48px] px-6 bg-red-500 text-white text-sm font-bold rounded-xl shadow-sm shadow-red-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all`}
                    >
                      Send <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <DashboardEmptyState
            icon={Mail}
            title="No Conversation Selected"
            description="Choose a conversation from the list to view details and reply."
          />
        )}
      </div>

      {/* 3. RIGHT PANEL: CUSTOMER DETAILS (Fixed 300px) */}
      <div className="w-[300px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full overflow-hidden">

        {/* Profile */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
          {/* ... avatar ... */}
        </div>
        {
          details || isEditingCustomer ? (
            <>
              <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs relative group cursor-help">
                    {details?.full_name ? details.full_name.substring(0, 2).toUpperCase() : 'UR'}
                    {/* Agent Avatar Overlay */}
                    {activeConv?.assigned_to && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center overflow-hidden" title={`Assigned to Agent: ${activeConv.assigned_to}`}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${activeConv.assigned_to === 'CURRENT_USER' || activeConv.assigned_to === user?.id ? 'Me' : 'A'}&background=0D8ABC&color=fff&size=32`}
                          alt="Agent"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 truncate max-w-[150px]">{details?.full_name || 'Unknown User'}</h3>
                </div>
                <div className="flex gap-2">
                  {isEditingCustomer && (
                    <button
                      onClick={() => setIsEditingCustomer(false)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg text-red-600 border border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={isEditingCustomer ? handleSaveCustomer : handleEditToggle}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 ${isEditingCustomer ? 'bg-green-500 text-white hover:bg-green-600' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {isEditingCustomer ? 'Save' : 'Edit'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  {/* NAME - only editable if we want, but "full_name" is editable. */}
                  {isEditingCustomer && (
                    <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
                      <div className="flex justify-center mt-2"><User className="w-4 h-4 text-slate-400" /></div>
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Full Name</p>
                        <input
                          className="text-sm font-medium text-slate-900 border-b border-blue-500 focus:outline-none w-full"
                          value={editForm.full_name || ''}
                          onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
                    <div className="flex justify-center mt-0.5"><div className="w-4 h-4 text-slate-400"><Tag className="w-4 h-4" /></div></div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Channel</p>
                      <p className="text-sm font-medium text-slate-900">WhatsApp</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
                    <div className="flex justify-center mt-0.5"><Phone className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Phone Number</p>
                      <p className="text-sm font-medium text-slate-900 font-mono">
                        {details?.phone || details?.source_id || (activeConv?.user.name.match(/^\+?\d+$/) ? activeConv?.user.name : '-')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
                    <div className="flex justify-center mt-0.5"><Mail className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Email</p>
                      {isEditingCustomer ? (
                        <input
                          className="text-sm font-medium text-slate-900 border-b border-blue-500 focus:outline-none w-full"
                          value={editForm.email || ''}
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">{details?.email || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
                    <div className="flex justify-center mt-0.5"><MapPin className="w-4 h-4 text-slate-400" /></div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Location</p>
                      {isEditingCustomer ? (
                        <input
                          className="text-sm font-medium text-slate-900 border-b border-blue-500 focus:outline-none w-full"
                          value={editForm.location || ''}
                          onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">{details?.location || '-'}</p>
                      )}
                    </div>
                  </div>

                  {/* Custom Attributes */}
                  {isEditingCustomer ? (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <p className="text-xs font-bold text-slate-500">Custom Attributes</p>
                      {Object.entries(editForm.custom_data || {}).map(([key, val]: any, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            className="w-1/3 text-xs border border-slate-300 rounded px-1"
                            value={key}
                            placeholder="Key"
                            onChange={e => handleUpdateAttribute(e.target.value, val, key)}
                          />
                          <input
                            className="flex-1 text-xs border border-slate-300 rounded px-1"
                            value={val}
                            placeholder="Value"
                            onChange={e => handleUpdateAttribute(key, e.target.value, key)}
                          />
                        </div>
                      ))}
                      <button onClick={handleAddAttribute} className="flex items-center gap-2 text-xs font-medium text-blue-500 hover:text-blue-600 mt-2">
                        <Plus className="w-3 h-3" /> Add Attribute
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {editForm.custom_data && Object.keys(editForm.custom_data).length > 0 && <p className="text-xs font-bold text-slate-500">Custom Attributes</p>}
                      {Object.entries(details?.custom_data || {}).map(([key, val]: any) => (
                        <div key={key} className="grid grid-cols-[24px_1fr] gap-2 items-start">
                          <div className="flex justify-center mt-0.5"><Tag className="w-4 h-4 text-slate-400" /></div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5 capitalize">{key}</p>
                            <p className="text-sm font-medium text-slate-900">{val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isEditingCustomer && (
                    <button onClick={handleEditToggle} className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600 mt-2 pl-8">
                      <Plus className="w-3 h-3" /> Add new attribute
                    </button>
                  )}
                </div>



                {/* Notes */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] text-yellow-900 font-bold">!</div>
                    Internal Notes
                  </h4>

                  {/* Note Input */}
                  <div className="border border-slate-200 rounded-xl p-3 mb-6 bg-yellow-50/50">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Write an internal note..."
                      className="w-full bg-transparent text-sm focus:outline-none mb-2 placeholder:text-slate-500"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {/* Note actions */}
                      </div>
                      <button
                        onClick={handleSaveNote}
                        className="text-xs font-bold text-yellow-700 hover:text-yellow-800 uppercase tracking-wide disabled:opacity-50"
                        disabled={!noteInput.trim()}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Note List */}
                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-0 before:w-px before:bg-slate-200">
                    {isNotesLoading ? <div className="pl-10 text-xs text-slate-400">Loading notes...</div> :
                      notes.length === 0 ? <div className="pl-10 text-xs text-slate-400">No notes yet.</div> :
                        notes.map(note => (
                          <div key={note.id} className="relative pl-10">
                            <img src={`https://ui-avatars.com/api/?name=${note.author_name || 'U'}&background=random`} className="absolute left-0 top-0 w-7 h-7 rounded-full border-2 border-white bg-white z-10" />
                            <div>
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="text-sm font-bold text-slate-900">{note.author_name}</span>
                                <button className="text-slate-400 hover:text-slate-600" title="Edit (API Ready)"><MoreVertical className="w-3 h-3" /></button>
                              </div>
                              <p className="text-xs text-slate-400 mb-2">{new Date(note.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })}</p>
                              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {note.content} {note.is_edited && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
                              </p>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center">
              {activeId ? (
                <>
                  <User className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-semibold text-slate-500">Guest User</p>
                  <p className="text-xs max-w-[200px] mt-2 mb-4">No rich profile found.</p>

                  {activeConv?.user.name && (
                    <div className="w-full space-y-4">
                      <div className="bg-slate-50 border border-slate-100 rounded p-2 text-center w-full">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Phone / ID</p>
                        <p className="text-sm font-mono text-slate-700">{activeConv.user.name}</p>
                      </div>

                      {/* CTA BUBBLE */}
                      <div className="relative group cursor-pointer" onClick={() => {
                        const phoneVal = activeConv.user.name.match(/^\+?\d+$/) ? activeConv.user.name : '';
                        // PREVENT CRASH: Initialize 'details' (mapped to 'customer') so the UI doesn't throw when accessing details.phone
                        setCustomer({
                          id: '', // New
                          source_id: phoneVal,
                          full_name: '',
                          email: '',
                          location: '',
                          custom_data: {},
                          phone: phoneVal
                        } as any);

                        setEditForm({
                          phone: phoneVal,
                          full_name: '',
                          email: '',
                          location: '',
                          custom_data: {}
                        });
                        setIsEditingCustomer(true);
                      }}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <button
                          className="relative w-full bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Sync Contact</p>
                            <p className="text-[10px] text-slate-500">Create profile for this chat</p>
                          </div>

                          {/* Little Pulse Dot */}
                          <div className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Mail className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a conversation to see details</p>
                </>
              )}
            </div>
          )}
      </div>
    </div>
  );
}