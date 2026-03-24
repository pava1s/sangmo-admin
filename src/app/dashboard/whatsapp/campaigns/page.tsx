'use client';

// ⚠️ CAMPAIGNS PAGE INVARIANT
// This page handles campaign lifecycle UI only.
// States, actions, confirmations are intentionally UI-only.
// DO NOT move logic to dashboard layout or shared components.
// Any backend wiring must preserve these UX guardrails.

// ⚠️ SCROLLING INVARIANT
// Scrolling is intentionally handled at the PAGE level.
// DO NOT move overflow / height logic to dashboard layout.
// Changing global layout will break Inbox & Chat.

import {
  PlusCircle,
  MoreHorizontal,
  Search,
  Send,
  FileText,
  Loader,
  Archive,
  Pause,
  Play,
  Edit,
  Copy,
  Calendar,
  X,
  BarChart,
  Lock,
} from 'lucide-react';
import { DashboardEmptyState } from '@/components/dashboard/EmptyState';
import * as React from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Campaign, Template } from '@/lib/aws/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getSession, UserSession, isSuperAdmin } from '@/lib/auth';
import { apiClient as api } from '@/lib/api-client';

// FIX: Added 'as const' to all variants to solve Badge TypeScript errors
const statusConfig = {
  Draft: { variant: 'outline' as const, icon: Edit, label: 'Draft', className: '' },
  Scheduled: { variant: 'secondary' as const, icon: Calendar, label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
  Sending: { variant: 'secondary' as const, icon: Loader, label: 'Sending', className: 'animate-spin' },
  Paused: { variant: 'secondary' as const, icon: Pause, label: 'Paused', className: 'bg-yellow-100 text-yellow-800' },
  Completed: { variant: 'default' as const, icon: Send, label: 'Completed', className: 'bg-green-100 text-green-800' },
  Failed: { variant: 'destructive' as const, icon: X, label: 'Failed', className: '' },
  Archived: { variant: 'secondary' as const, icon: Archive, label: 'Archived', className: '' },
};

type ConfirmationState = {
  action: 'Send' | 'Schedule' | 'Cancel' | 'Pause' | 'Resume' | 'Archive' | null;
  campaign: Campaign | null;
}

// Variable Mapping Types
type VariableMapping = Record<string, { type: 'field' | 'text'; value: string }>;
const CONTACT_FIELDS = [
  { value: 'full_name', label: 'Full Name' },
  { value: 'source_id', label: 'Phone Number' },
  { value: 'email', label: 'Email' },
  { value: 'custom_data', label: 'Custom Data (JSON)' },
];

function CreateCampaignDialog({
  open,
  onOpenChange,
  onCampaignCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated: () => void;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);

  // Tag State
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

  // Variable Mapping State
  const [detectedVariables, setDetectedVariables] = React.useState<string[]>([]);
  const [variableMapping, setVariableMapping] = React.useState<VariableMapping>({});

  React.useEffect(() => {
    async function initData() {
      if (open) {
        // Fetch Templates
        const templates = await api.getTemplates();
        setTemplates(templates);

        // Fetch Contacts to extract Tags
        const contacts = await api.getCustomers();
        const tags = new Set<string>();
        contacts.forEach((c: any) => {
          if (Array.isArray(c.tags)) c.tags.forEach((t: string) => tags.add(t));
        });
        setAvailableTags(Array.from(tags));
      }
    }
    initData();
  }, [open]);

  // Parse Variables when Template Changes
  React.useEffect(() => {
    if (selectedTemplate) {
      // Regex to find {{1}}, {{2}}, etc.
      const regex = /{{(\d+)}}/g;
      const matches = Array.from(selectedTemplate.content.matchAll(regex), (m: any) => m[1]);
      const uniqueVars = Array.from(new Set(matches)).sort((a, b) => parseInt(a) - parseInt(b));

      setDetectedVariables(uniqueVars);

      // Initialize default mapping (empty)
      const initialMap: VariableMapping = {};
      uniqueVars.forEach(v => {
        initialMap[v] = { type: 'text', value: '' };
      });
      setVariableMapping(initialMap);
    } else {
      setDetectedVariables([]);
      setVariableMapping({});
    }
  }, [selectedTemplate]);

  const handleCreate = async () => {
    if (!name || !selectedTemplate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a campaign name and select a template.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.createCampaign({
        name,
        templateName: selectedTemplate.name,
        templateContent: selectedTemplate.content,
        variables: variableMapping, // Send the mapping
        targetTags: selectedTags
      });

      onCampaignCreated();
      toast({
        title: 'Campaign Created',
        description: `Campaign "${name}" created successfully.`,
      });
      onOpenChange(false);
      setName('');
      setSelectedTemplate(null);
      setVariableMapping({});
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Creating Campaign',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapping = (varName: string, type: 'field' | 'text', value: string) => {
    setVariableMapping(prev => ({
      ...prev,
      [varName]: { type, value }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a broadcast. Map variables to personalize messages.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              placeholder="e.g., Summer Sale"
              suppressHydrationWarning={true}
            />
          </div>

          {/* Template Select */}
          <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Select
              onValueChange={(val) =>
                setSelectedTemplate(
                  templates.find((t) => t.name === val) || null
                )
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name} ({t.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                {selectedTemplate.content}
              </p>
            )}
          </div>

          {/* Variable Mapping Section */}
          {detectedVariables.length > 0 && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900">
              <Label className="text-indigo-600 dark:text-indigo-400">Variable Mapping</Label>
              {detectedVariables.map(v => (
                <div key={v} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                  <Badge variant="outline" className="w-12 justify-center">{`{{${v}}}`}</Badge>
                  <Select
                    value={variableMapping[v]?.type || 'text'}
                    onValueChange={(val: any) => updateMapping(v, val, '')}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Custom Text</SelectItem>
                      <SelectItem value="field">Contact Field</SelectItem>
                    </SelectContent>
                  </Select>

                  {variableMapping[v]?.type === 'field' ? (
                    <Select
                      value={variableMapping[v]?.value || ''}
                      onValueChange={(val) => updateMapping(v, 'field', val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_FIELDS.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="h-8 text-xs"
                      placeholder="Value..."
                      value={variableMapping[v]?.value || ''}
                      onChange={(e) => updateMapping(v, 'text', e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Audience Section */}
          <div className="space-y-2">
            <Label>Audience (Filter by Tags)</Label>
            <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              {availableTags.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-4 space-y-2">
                  <span className="text-xs text-muted-foreground">No tags found. Add tags to contacts to filter.</span>
                  <Link href="/dashboard/contacts" className="text-xs font-medium text-blue-600 hover:underline">
                    Manage Contacts / Upload CSV &rarr;
                  </Link>
                </div>
              ) : (
                availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer ${isSelected ? 'bg-indigo-600 hover:bg-indigo-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      onClick={() => {
                        setSelectedTags(prev =>
                          isSelected ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  )
                })
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {selectedTags.length === 0 ? "Sending to ALL contacts." : `Sending to contacts with ANY of: ${selectedTags.join(', ')}`}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            className="rounded-full"
            size="lg"
            disabled={!selectedTemplate || !name || isLoading}
          >
            {isLoading ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {isLoading ? 'Creating...' : 'Create & Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmationDialog({ state, onConfirm, onCancel }: { state: ConfirmationState; onConfirm: () => void; onCancel: () => void; }) {
  if (!state.action || !state.campaign) return null;

  const messages = {
    Send: `Send "${state.campaign.name}" to ~${state.campaign.audienceCount} contacts now?`,
    Schedule: `Schedule "${state.campaign.name}"?`,
    Cancel: `Cancel "${state.campaign.name}"?`,
    Pause: 'Pause sending? Some messages may still be in flight.',
    Resume: 'Resume sending where it left off?',
    Archive: 'Archive this campaign?',
  };

  const titles = {
    Send: 'Confirm Send',
    Schedule: 'Confirm Schedule',
    Cancel: 'Confirm Cancellation',
    Pause: 'Confirm Pause',
    Resume: 'Confirm Resume',
    Archive: 'Confirm Archive',
  };

  return (
    <AlertDialog open={!!state.action} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titles[state.action]}</AlertDialogTitle>
          <AlertDialogDescription>
            {messages[state.action]}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={state.action === 'Send' || state.action === 'Cancel' ? 'bg-destructive hover:bg-destructive/90' : ''}>
            {state.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const ActionMenuItem = ({ children, disabled, tooltip, onClick }: { children: React.ReactNode; disabled?: boolean; tooltip?: string; onClick?: () => void; }) => {
  const item = <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onClick?.() }} disabled={disabled}>{children}</DropdownMenuItem>
  if (disabled && tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild><div className="w-full">{item}</div></TooltipTrigger>
        <TooltipContent><p>{tooltip}</p></TooltipContent>
      </Tooltip>
    );
  }
  return item;
};


export default function CampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = React.useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isCreateOpen, setCreateOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [confirmationState, setConfirmationState] = React.useState<ConfirmationState>({ action: null, campaign: null });
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    async function loadUser() {
      const session = getSession();
      setCurrentUser(session);
    }
    loadUser();
  }, []);

  const fetchCampaigns = React.useCallback(async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  React.useEffect(() => {
    const results = campaigns.filter(campaign =>
      campaign.status !== 'Archived' && (
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.templateName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredCampaigns(results);
  }, [searchTerm, campaigns]);

  const handleCampaignCreated = () => {
    fetchCampaigns();
  }

  // FIX: Implemented Real Action Handling
  const handleConfirmAction = async () => {
    if (!confirmationState.action || !confirmationState.campaign) return;
    const { action, campaign } = confirmationState;

    // Optimistic UI Update (optional, but good for UX)
    // For now, we rely on the toast and auto-refresh

    try {
      await api.updateCampaign(campaign.id, { action: action.toLowerCase() });

      toast({ title: 'Success', description: `Campaign ${action} action processed.` });
      fetchCampaigns(); // Refresh list immediately
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Action Failed', description: error.message });
    } finally {
      setConfirmationState({ action: null, campaign: null });
    }
  };

  if (isLoading || !currentUser) {
    return <div className="flex justify-center items-center h-full"><Loader className="h-8 w-8 animate-spin" /></div>;
  }

  if (currentUser.role !== 'super_admin') {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:gap-8 md:p-10 text-center">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Access Restricted</h1>
        <p className="text-muted-foreground">Your role does not have permission to manage campaigns.</p>
        <Button asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
      </main>
    )
  }

  return (
    <TooltipProvider>
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-10 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Track and manage your messaging campaigns.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button size="lg" className="rounded-full" onClick={() => setCreateOpen(true)}>
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search campaigns..." className="pl-10 rounded-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} suppressHydrationWarning={true} />
          </div>
        </div>

        {filteredCampaigns.length === 0 && !isLoading ? (
          <div className="py-12">
            <DashboardEmptyState
              icon={Send}
              title="No campaigns found"
              description="Create your first broadcast campaign to engage your users."
              actionLabel="Create Campaign"
              onAction={() => setCreateOpen(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.Draft;
              const Icon = config.icon;
              const progress = campaign.audienceCount > 0 ? ((campaign.sent + campaign.failed) / campaign.audienceCount) * 100 : 0;

              const isDraft = campaign.status === 'Draft';
              const isSending = campaign.status === 'Sending';
              const isPaused = campaign.status === 'Paused';
              const isDone = campaign.status === 'Completed' || campaign.status === 'Failed';

              const canSendNow = isSuperAdmin(currentUser);

              return (
                <Card key={campaign.id} className="group relative transition-all hover:shadow-lg flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.templateName}</CardDescription>
                    </div>
                    <Badge variant={config.variant} className={`flex items-center gap-2 ${config.className}`}>
                      <Icon className={`h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
                      <span>{config.label}</span>
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center pt-2">
                      {/* Stats Display */}
                      <div><p className="text-2xl font-bold">{campaign.sent}</p><p className="text-sm text-muted-foreground">Sent</p></div>
                      <div><p className="text-2xl font-bold">{campaign.failed}</p><p className="text-sm text-muted-foreground">Failed</p></div>
                      <div><p className="text-2xl font-bold">{campaign.audienceCount}</p><p className="text-sm text-muted-foreground">Audience</p></div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start text-xs text-muted-foreground pt-2">
                    <p className="truncate">{campaign.statusMessage}</p>
                    <p>Created: {campaign.createdAt ? format(new Date(campaign.createdAt), "PP") : '-'}</p>
                  </CardFooter>

                  <div className="absolute top-4 right-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ActionMenuItem disabled={!isDraft}>
                          <div className="flex items-center w-full"><Edit className="mr-2 h-4 w-4" /> Edit Draft</div>
                        </ActionMenuItem>

                        {/* Send Now Button */}
                        <ActionMenuItem disabled={!isDraft || !canSendNow} onClick={() => setConfirmationState({ action: 'Send', campaign })}>
                          <div className="flex items-center w-full text-indigo-600 font-medium"><Send className="mr-2 h-4 w-4" /> Send Now</div>
                        </ActionMenuItem>

                        {/* Resume Button */}
                        {(isPaused || campaign.status === 'Failed') && (
                          <ActionMenuItem onClick={() => setConfirmationState({ action: 'Resume', campaign })}>
                            <div className="flex items-center w-full text-green-600 font-medium"><Play className="mr-2 h-4 w-4" /> Resume</div>
                          </ActionMenuItem>
                        )}

                        {/* Pause Button */}
                        {isSending && (
                          <ActionMenuItem onClick={() => setConfirmationState({ action: 'Pause', campaign })}>
                            <div className="flex items-center w-full text-amber-600 font-medium"><Pause className="mr-2 h-4 w-4" /> Pause</div>
                          </ActionMenuItem>
                        )}

                        <Link href="/dashboard/whatsapp/contacts" className="text-xs font-medium text-blue-600 hover:underline">
                          <DropdownMenuItem className="cursor-pointer">
                            <div className="flex items-center w-full"><Users className="mr-2 h-4 w-4" /> View Contacts</div>
                          </DropdownMenuItem>
                        </Link>

                        <DropdownMenuSeparator />
                        <ActionMenuItem disabled={!isDone}>
                          <Link href={`/dashboard/whatsapp/campaigns/${campaign.id}`} className="flex items-center"><BarChart className="mr-2 h-4 w-4" /> View Report</Link>
                        </ActionMenuItem>
                        <ActionMenuItem onClick={() => setConfirmationState({ action: 'Archive', campaign })}>
                          <div className="flex items-center w-full text-destructive"><Archive className="mr-2 h-4 w-4" /> Archive</div>
                        </ActionMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <CreateCampaignDialog open={isCreateOpen} onOpenChange={setCreateOpen} onCampaignCreated={handleCampaignCreated} />
        <ConfirmationDialog state={confirmationState} onConfirm={handleConfirmAction} onCancel={() => setConfirmationState({ action: null, campaign: null })} />
      </main>
    </TooltipProvider>
  )
}