'use client';
// ⚠️ SCROLLING INVARIANT
// Scrolling is intentionally handled at the PAGE level.

import * as React from 'react';
import {
  Search,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { DashboardEmptyState } from '@/components/dashboard/EmptyState';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast'; // Added for feedback

// ✅ Define Type locally to match the API response exactly
type Template = {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'APPROVED' | 'PENDING' | 'REJECTED';
  content: string;
  raw_data?: any;
};

const statusConfig = {
  Approved: {
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 ring-green-500/10',
  },
  APPROVED: {
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 shadow-sm ring-1 ring-green-900/5 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
  Pending: {
    variant: 'secondary',
    icon: Clock,
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  Rejected: {
    variant: 'destructive',
    icon: XCircle,
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
} as const;

function TemplatePreviewDialog({ template, open, onOpenChange }: { template: Template | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!template) return null;
  // @ts-ignore - Status config type safety
  const config = statusConfig[template.status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{template.name}</DialogTitle>
          <DialogDescription>
            Read-only preview of this message template.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline">{template.category}</Badge>
            <Badge variant={config.variant as any} className={`flex items-center gap-2 ${config.className}`}>
              <Icon className="h-4 w-4" />
              <span>{template.status}</span>
            </Badge>
          </div>
          <div className="p-4 bg-secondary/50 rounded-2xl border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-wider">Template Content</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{template.content}</p>
          </div>

          {template.raw_data && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">JSON Sample (Variables)</p>
              <div className="p-4 bg-slate-950 rounded-xl overflow-x-auto border border-slate-800">
                <pre className="text-[11px] font-mono text-emerald-400">
                  {JSON.stringify(template.raw_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = React.useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false); // Added for Sync State
  const [error, setError] = React.useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const { toast } = useToast(); // Added for notifications

  // Function defined separately so it can be called after sync
  async function fetchTemplates() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/whatsapp/templates');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates');
      }
      setTemplates(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  }

  // ✅ NEW: Sync Function logic
  const handleSyncWithMeta = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/whatsapp/templates/sync', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) {
        if (result.debug) {
          alert('BRUTE FORCE DEBUG: ' + JSON.stringify(result.debug, null, 2));
        }
        throw new Error(result.error || 'Sync failed');
      }

      toast({
        title: "Sync Successful",
        description: `Updated ${result.count} templates from WhatsApp Manager.`,
      });

      await fetchTemplates(); // Refresh the list automatically
    } catch (err: any) {
      console.error('SYNC UI ERROR:', err);
      setError(err.message || String(err));
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: err.message || "Could not connect to Meta API.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  React.useEffect(() => {
    const results = templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTemplates(results);
  }, [searchTerm, templates]);

  return (
    <TooltipProvider>
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-10 overflow-y-auto relative">
        {/* NUCLEAR DIAGNOSTIC ERROR OVERLAY */}
        {error && (
          <div className="bg-red-600 text-white p-6 border-b-4 border-red-900 z-[100] shadow-2xl shrink-0 -mt-6 -mx-6 mb-6 md:-mt-10 md:-mx-10 md:mb-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  CRITICAL META INTEGRATION ERROR
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Message Templates</h1>
            <p className="text-muted-foreground">
              Manage and sync templates from WhatsApp Business Manager.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* ✅ NEW: Sync Button added next to Create Template */}
            <Button
              variant="outline"
              size="lg"
              className="rounded-full gap-2"
              onClick={handleSyncWithMeta}
              disabled={isSyncing}
            >
              {isSyncing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              Sync with Meta
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button size="lg" className="rounded-full" disabled>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Template
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Templates are managed in WhatsApp Business Manager.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="rounded-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suppressHydrationWarning={true}
            />
          </div>
        </div>

        {isLoading
          ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="flex flex-col">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )
          : filteredTemplates.length === 0
            ? (
              <div className="col-span-full py-12">
                <DashboardEmptyState
                  icon={FileText}
                  title="No templates found"
                  description="Templates are created and approved in WhatsApp Business Manager. Sync with Meta to get started."
                  actionLabel="Sync with Meta"
                  onAction={handleSyncWithMeta}
                />
              </div>
            )
            : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => {
                  // @ts-ignore
                  const config = statusConfig[template.status] || statusConfig.Pending;
                  const Icon = config.icon;
                  return (
                    <Card
                      key={template.id}
                      className="group relative flex cursor-pointer flex-col hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="relative pb-2">
                        <div className="flex items-center gap-4 pr-24">
                          <div className="rounded-xl bg-secondary p-3">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold leading-tight">{template.name}</CardTitle>
                            <CardDescription className="uppercase text-[11px] font-bold tracking-wider mt-1">{template.category}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={config.variant as any}
                          className={`absolute top-6 right-6 flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${config.className} ring-black/5 dark:ring-white/10`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{template.status}</span>
                        </Badge>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="line-clamp-3 text-muted-foreground text-sm">
                          {template.content}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        <TemplatePreviewDialog template={selectedTemplate} open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)} />
      </main>
    </TooltipProvider>
  );
}