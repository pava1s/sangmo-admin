'use client';

import * as React from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  MapPin,
  Tag,
  Phone,
  User as UserIcon,
  CheckCircle2,
  Filter,
  Download,
  FileUp,
  X,
  Loader2,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiClient as api } from '@/lib/api-client';
import { Customer } from '@/lib/aws/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';

// --- TABLE CONFIGURATION ---
type SortDirection = 'asc' | 'desc';

interface ColumnConfig {
  id: keyof Customer | 'actions';
  label: string;
  width: number;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'full_name', label: 'Name', width: 250 },
  { id: 'source_id', label: 'Phone', width: 180 },
  { id: 'email', label: 'Email', width: 220 },
  { id: 'location', label: 'Location', width: 150 },
  { id: 'tags', label: 'Tags', width: 180 },
  { id: 'created_at', label: 'Created At', width: 150 },
  { id: 'actions', label: '', width: 50 },
];

import { DashboardEmptyState } from '@/components/dashboard/EmptyState';
import { Users, AlertCircle } from 'lucide-react';

export default function ContactsPage() {
  const [data, setData] = React.useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newContact, setNewContact] = React.useState<any>({ tags: '' });
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const fetchContacts = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await api.getContacts(searchTerm);
      setData(Array.isArray(json) ? json : []);
    } catch (e: any) {
      console.error("Fetch Error (Contacts):", e);
      setError(e.message || "Failed to load contacts");
      toast({ variant: 'destructive', title: 'Error', description: e.message });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast]);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...newContact,
        tags: newContact.tags ? newContact.tags.split(',').map((t: string) => t.trim()) : [],
      };
      await api.createContact(payload);
      toast({ title: 'Contact Created' });
      setIsAddOpen(false);
      setNewContact({ tags: '' });
      fetchContacts();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      // @ts-ignore
      await api.deleteCustomer(id);
      toast({ title: "Deleted" });
      fetchContacts();
    } catch (e) {
       toast({ variant: 'destructive', title: 'Error' });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-950 text-sm font-sans overflow-hidden">
      {/* NUCLEAR DIAGNOSTIC ERROR OVERLAY */}
      {error && (
        <div className="bg-red-600 text-white p-6 border-b-4 border-red-900 z-[100] overflow-auto max-h-[40vh] shadow-2xl shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                CRITICAL CRM DATA ERROR
              </h2>
              <p className="font-mono text-sm bg-red-900/30 p-3 rounded border border-red-400/50">
                {error}
              </p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-none h-14 border-b flex items-center justify-between px-4 bg-white dark:bg-slate-950 z-20">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">All Contacts</h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 w-64 text-xs"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-3 h-3 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <p className="text-slate-400 font-medium">Loading your contacts...</p>
          </div>
        ) : error ? (
          <div className="py-12">
            <DashboardEmptyState
              icon={AlertCircle}
              title="Failed to load contacts"
              description={error}
              actionLabel="Retry"
              onAction={fetchContacts}
            />
          </div>
        ) : data.length === 0 ? (
          <div className="py-12">
            <DashboardEmptyState
              icon={Users}
              title="No contacts found"
              description={searchTerm ? `No matches for "${searchTerm}"` : "Start building your customer base by adding your first contact."}
              actionLabel="Add Contact"
              onAction={() => setIsAddOpen(true)}
            />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
              <tr>
                {DEFAULT_COLUMNS.map(c => (
                  <th key={c.id} className="py-2 px-3 text-xs font-semibold text-slate-500 uppercase border-b" style={{ width: c.width }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(contact => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 group">
                  <td className="px-3 py-2 font-medium">{contact.full_name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{contact.source_id}</td>
                  <td className="px-3 py-2">{contact.email || '-'}</td>
                  <td className="px-3 py-2">{contact.location || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(contact.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Contact</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label>Phone <span className="text-red-500">*</span></Label>
              <Input placeholder="+1..." value={newContact.source_id || ''} onChange={e => setNewContact({ ...newContact, source_id: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input placeholder="John Doe" value={newContact.full_name || ''} onChange={e => setNewContact({ ...newContact, full_name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input placeholder="email@example.com" value={newContact.email || ''} onChange={e => setNewContact({ ...newContact, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Tags</Label>
              <Input placeholder="VIP, Lead" value={newContact.tags} onChange={e => setNewContact({ ...newContact, tags: e.target.value })} />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleAddSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Contact
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}