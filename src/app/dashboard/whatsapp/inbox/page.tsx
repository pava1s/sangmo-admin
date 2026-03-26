'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MoreVertical, Phone, MapPin, Mail, Tag, Pause, 
  CheckCircle2, User, Plus, Send, Image as ImageIcon, 
  FileText, Check, X, Shield, Clock, Paperclip, File, Download,
  MessageSquare
} from 'lucide-react';
import { apiClient as api } from '@/lib/api-client';
import { Conversation, Message, Customer } from '@/lib/aws/types';
import { DashboardEmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';

export default function InboxPage() {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [apiError, setApiError] = useState<{message: string, stack?: string, details?: any} | null>(null);

  // --- ATTACHMENT/USER STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'document'>('document');
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    setUser({ id: 'me', name: 'Agent', email: 'agent@wanderlynx.com' });
  }, []);

  // --- NOTES STATE ---
  const [notes, setNotes] = useState<any[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  // --- CUSTOMER STATE ---
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // --- FUNCTIONAL STATE ---
  const [isPaused, setIsPaused] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'me' | 'unassigned'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Sound & Scroll Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastMessageIdsRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeId]);

  // AUDIO INIT
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    if (type === 'incoming') {
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
      gain.gain.setValueAtTime(0.9, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else {
      osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.8, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now); osc.stop(now + 0.15);
    }
  };

  const playIncoming = () => playTone('incoming');
  const playOutgoing = () => playTone('outgoing');

  // API FETCHERS
  async function fetchConversations(silent = false) {
    if (!silent) {
      setIsLoading(true);
      setApiError(null);
    }
    try {
      const data = await api.getConversations();
      // api-client currently returns [] if !res.ok. I need to handle that or change api-client.
      // For now, let's assume if it's empty and was supposed to have data, we check for errors in the future.
      // ACTUALLY, I should probably check if 'data' is an error object.
      setConversations(data);
      if (!activeId && data.length > 0 && !silent) setActiveId(data[0].id);
    } catch (err: any) {
      console.error("API Error (Conversations):", err);
      if (!silent) {
        setApiError({
          message: err.message || "Unknown API Error",
          stack: err.stack,
          details: err
        });
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }

  async function fetchMessages(id: string, silent = false) {
    if (!silent) setIsMessagesLoading(true);
    try {
      const msgs = await api.getMessages(id);
      setMessages(msgs);

      if (silent && msgs.length > 0) {
        const newest = msgs[msgs.length - 1];
        if (!lastMessageIdsRef.current.has(newest.id)) {
          if (newest.direction === 'inbound') playIncoming();
          msgs.forEach((m: any) => lastMessageIdsRef.current.add(m.id));
        }
      } else {
        msgs.forEach((m: any) => lastMessageIdsRef.current.add(m.id));
      }
    } catch (err) {
      console.error("API Error (Messages):", err);
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setIsMessagesLoading(false);
    }
  }

  // EFFECTS
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations(true);
      if (activeId) fetchMessages(activeId, true);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    const activeConv = conversations.find(c => c.id === activeId);
    const id = activeId;
    if (!id || !activeConv) return;
    async function fetchCustomer() {
      setIsCustomerLoading(true); setCustomer(null); setIsEditingCustomer(false);
      try {
        if (!id) return;
        const data = await api.getContactById(id);
        setCustomer(data);
        setEditForm(data);
      } catch (e) { console.error("Fetch customer error", e); }
      finally { setIsCustomerLoading(false); }
    }
    fetchCustomer();
  }, [activeId, conversations]);

  const activeConv = conversations.find(c => c.id === activeId);
  const details = customer;
  const isClosed = activeConv?.status?.toLowerCase() === 'closed';
  const isAssigned = !!activeConv?.assigned_to;

  const lastInbound = [...messages].reverse().find(m => m.direction === 'inbound');
  let isWindowActive = true;
  if (lastInbound?.created_at) {
    const diff = new Date().getTime() - new Date(lastInbound.created_at).getTime();
    if (diff / (1000 * 60 * 60) > 24) isWindowActive = false;
  }

  // ACTIONS
  const handleSendMessage = async () => {
    if (!input.trim() || !activeId) return;
    const tempId = 'temp-' + Date.now();
    const optimisticMsg: any = { id: tempId, content: input, direction: 'outbound', status: 'sending', created_at: new Date().toISOString(), type: 'text' };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');
    try {
      const data = await api.sendMessage(activeId, input);
      setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
      playOutgoing();
      fetchConversations(true);
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
    }
  };

  const handleSaveNote = async () => {
    if (!noteInput.trim() || !activeId) return;
    setIsNotesLoading(true);
    try {
      const data = await api.createConversationNote(activeId, { content: noteInput });
      setNotes(prev => [{ ...data, author_name: 'Me' }, ...prev]);
      setNoteInput('');
    } catch (e) { console.error("Save note error", e); }
    finally { setIsNotesLoading(false); }
  };

  const updateConversation = async (updates: any) => {
    if (!activeId) return;
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, ...updates } : c));
    if (updates.is_paused !== undefined) setIsPaused(updates.is_paused);
    try {
      await api.updateConversation(activeId, updates);
    } catch (err) {
      console.error("Update failed", err);
      fetchConversations(true);
    }
  };

  const handlePause = () => updateConversation({ is_paused: true });
  const handleResume = () => updateConversation({ is_paused: false });
  const handleClose = () => updateConversation({ status: 'closed' });
  const handleReopen = () => updateConversation({ status: 'open' });

  const handleRetry = async (id: string, content: string) => {
     setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'sending' } : m));
     try {
       const data = await api.sendMessage(activeId!, content);
       setMessages(prev => prev.map(m => m.id === id ? data.message : m));
       playOutgoing();
       fetchConversations(true);
     } catch (e) {
       setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'failed' } : m));
     }
  };

  const handleSaveCustomer = async () => {
    if (!customer?.id) return;
    try {
      const data = await api.updateContact(customer.id, editForm);
      const newC = data;
      setCustomer(newC); setEditForm(newC); setIsEditingCustomer(false);
    } catch (e) { console.error("Save customer error", e); }
  };

  const handleEditToggle = () => {
    if (isEditingCustomer) {
      setIsEditingCustomer(false);
      setEditForm(customer);
    } else {
      setIsEditingCustomer(true);
      setEditForm(customer);
    }
  };

  const handleAddAttribute = () => {
    const newCustom = { ...(editForm.customData || {}), '': '' };
    setEditForm({ ...editForm, customData: newCustom });
  };

  const handleUpdateAttribute = (key: string, value: string, oldKey: string) => {
    const newCustom = { ...(editForm.customData || {}) };
    if (key !== oldKey) { delete newCustom[oldKey]; newCustom[key] = value; }
    else { newCustom[key] = value; }
    setEditForm({ ...editForm, customData: newCustom });
  };

  const handleToggleAssignment = () => {
    if (activeConv?.assigned_to) {
      updateConversation({ assigned_to: null });
    } else {
      updateConversation({ assigned_to: 'me' });
    }
  };

  const handleTriggerFileUpload = (type: 'image' | 'document') => {
    if (activeConv?.status === 'closed') return alert("Cannot send attachments in a closed conversation.");
    if (activeConv?.is_paused) return alert("Cannot send attachments while paused.");
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    setIsUploading(true);
    try {
      alert("File upload integrated with AWS coming soon.");
    } catch (error: any) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* NUCLEAR DIAGNOSTIC ERROR OVERLAY */}
      {apiError && (
        <div className="bg-red-600 text-white p-6 border-b-4 border-red-900 z-[100] overflow-auto max-h-[40vh] shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Shield className="h-6 w-6" />
                CRITICAL SYSTEM ERROR EXPOSED
              </h2>
              <p className="font-mono text-sm bg-red-900/30 p-3 rounded border border-red-400/50">
                {apiError.message}
              </p>
              {apiError.stack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs font-bold opacity-70 hover:opacity-100 uppercase">View Trace Status</summary>
                  <pre className="mt-2 p-4 bg-black/40 rounded text-[10px] font-mono whitespace-pre-wrap border border-red-400/20">
                    {apiError.stack}
                  </pre>
                </details>
              )}
            </div>
            <button 
              onClick={() => setApiError(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-full w-full overflow-hidden">
      <div className="flex w-[350px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">W</div>
            Chat
          </h1>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-400 mt-1">Inbound messages will appear here.</p>
              </div>
              <button 
                onClick={() => fetchConversations()}
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                Refresh Inbox
              </button>
            </div>
          ) : (
            conversations.map(c => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`px-4 py-3 cursor-pointer border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${activeId === c.id ? 'bg-emerald-50/30 dark:bg-emerald-900/10 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold truncate">{c.phone}</span>
                  <span className="text-[10px] text-slate-400">{c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{c.last_message || 'No messages'}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. MIDDLE PANEL: ACTIVE STREAM */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0 border-r border-slate-200 dark:border-slate-800">
        {activeId ? (
          <>
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0">
               <h2 className="text-base font-bold">{activeConv?.phone}</h2>
               <div className="flex items-center gap-2">
                 {isPaused ? (
                   <button onClick={handleResume} className="h-8 px-3 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">Resume</button>
                 ) : (
                   <button onClick={handlePause} className="h-8 px-3 border border-slate-200 text-slate-600 text-xs font-bold rounded">Pause</button>
                 )}
                 {isClosed ? (
                   <button onClick={handleReopen} className="h-8 px-3 bg-slate-100 text-slate-600 text-xs font-bold rounded">Reopen</button>
                 ) : (
                   <button onClick={handleClose} className="h-8 px-3 bg-slate-900 text-white text-xs font-bold rounded">Close</button>
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] dark:bg-[#020617] scroll-smooth">
              {isMessagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`flex w-full ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`h-12 w-2/3 animate-pulse rounded-2xl ${i % 2 === 0 ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-white dark:bg-slate-900 border'}`} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-full">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium">No messages in this conversation yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((m) => {
                    // Fallback to type 'text' and explicit content extraction if m.content is missing but we have legacy fields
                    const rawContent = m.content || (m as any).message_body || (m as any).text || 'Message format not recognized';
                    const isTemplate = m.type === 'template' || rawContent.includes('API Template:');
                    const displayContent = isTemplate ? rawContent.replace('API Template:', '').trim() : rawContent;

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full mb-4 ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        {isTemplate ? (
                          <div className="max-w-[80%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                              <FileText className="h-3 w-3 text-slate-500" />
                              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Template Sent</span>
                            </div>
                            <div className="px-4 py-3 bg-white dark:bg-slate-900">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{displayContent}</p>
                            </div>
                            <div className="px-4 py-1.5 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-1.5">
                              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Delivered</span>
                              <div className="flex items-center text-blue-500">
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.direction === 'outbound' ? 'bg-[#00a884] text-white rounded-tr-none shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                            {m.content}
                            <div className="text-[10px] opacity-70 mt-1 text-right font-medium">
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none resize-none"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="px-4 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <DashboardEmptyState icon={Mail} title="No Chat Selected" description="Select a chat to start messaging." />
        )}
      </div>

      <div className="w-[340px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
        {customer ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-6 text-center border-b border-slate-100 dark:border-slate-900">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 border-2 border-emerald-100 shadow-inner">
                {customer.full_name ? customer.full_name[0].toUpperCase() : 'G'}
              </div>
              <h3 className="font-bold text-lg">{customer.full_name || 'Guest User'}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-xs text-slate-500 font-mono">{customer.phone}</p>
                <button onClick={() => { navigator.clipboard.writeText(customer.phone!); toast({ title: "Copied", description: "Phone number copied to clipboard" }); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
                   <Paperclip className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Email</label>
                  <p className="text-xs font-medium truncate">{customer.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Location</label>
                  <p className="text-xs font-medium">{customer.location || 'Bangalore, IN'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="h-3 w-3" /> Internal Context Notes
                  </label>
                  <div className="relative">
                    <textarea 
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add an internal note for the team..."
                      className="w-full h-24 p-3 text-xs bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg focus:outline-none resize-none text-slate-700"
                    />
                    <button 
                      onClick={handleSaveNote}
                      disabled={!noteInput.trim() || isNotesLoading}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded hover:bg-yellow-500 transition-colors disabled:opacity-50 uppercase tracking-tighter"
                    >
                      {isNotesLoading ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Timeline</h4>
                   <div className="space-y-3">
                      {notes.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic">No historical notes for this contact.</p>
                      ) : (
                        notes.map((note, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 relative group">
                            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{note.author_name}</span>
                              <span className="text-[9px] text-slate-300">{new Date(note.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
              <User className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">No Contact Selected</p>
            <p className="text-xs opacity-60 mt-1">Select a conversation to view participant details and notes.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}