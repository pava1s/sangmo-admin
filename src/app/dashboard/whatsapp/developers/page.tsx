'use client';

import * as React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Code, 
  Copy, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Activity, 
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UsageStats {
  summary: Record<string, {
    total: number;
    success: number;
    failed: number;
    estimatedCost: number;
    name: string;
  }>;
  dailyUsage: Record<string, number>;
  totalCount: number;
}

import { DashboardEmptyState } from '@/components/dashboard/EmptyState';
import { Key, AlertCircle } from 'lucide-react';

export default function DevelopersPage() {
  const [keys, setKeys] = React.useState<any[]>([]);
  const [usage, setUsage] = React.useState<UsageStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newKeyLabel, setNewKeyLabel] = React.useState('');
  const [newBusinessName, setNewBusinessName] = React.useState('');
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = React.useState<Record<string, boolean>>({});
  const [billingRecords, setBillingRecords] = React.useState<any[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [keysRes, usageRes, billingRes] = await Promise.all([
        fetch('/api/admin/api-keys'),
        fetch('/api/admin/api-usage?days=30'),
        fetch('/api/admin/billing')
      ]);

      if (!keysRes.ok || !usageRes.ok || !billingRes.ok) {
        throw new Error("One or more developer APIs failed to respond.");
      }

      const keysData = await keysRes.json();
      const usageData = await usageRes.json();
      const billingData = await billingRes.json();
      
      setKeys(Array.isArray(keysData) ? keysData : []);
      setUsage(usageData);
      setBillingRecords(Array.isArray(billingData) ? billingData : []);
    } catch (err: any) {
      console.error('Developer Insights Fetch failed:', err);
      setError(err.message || "Failed to sync developer metrics.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleCreateKey = async () => {
    if (!newKeyLabel) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel, business_name: newBusinessName })
      });
      const data = await res.json();
      if (data.key_value) {
        setGeneratedKey(data.key_value);
        fetchData();
        toast({ title: "API Key Created", description: "Make sure to copy it now, you won't see it again." });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to create key", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/api-keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchData();
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, title: string = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    toast({ title });
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this key? This action is permanent.")) return;
    try {
      await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' });
      fetchData();
      toast({ title: "Key Revoked" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to revoke key", variant: "destructive" });
    }
  };

  const handleUpdateBillingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/billing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
        toast({ title: "Status Updated", description: `Invoice marked as ${status}` });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update billing status", variant: "destructive" });
    }
  };

  const handleGenerateInvoices = async () => {
    const month = new Date().toISOString().substring(0, 7); // current month e.g. "2026-03"
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/billing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month })
      });
      if (res.ok) {
        fetchData();
        toast({ title: "Invoices Generated", description: `Updated records for ${month}` });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate invoices", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <DashboardEmptyState
          icon={AlertCircle}
          title="Developer Service Unavailable"
          description={error}
          actionLabel="Retry Connection"
          onAction={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Controls</h1>
          <p className="text-muted-foreground">Manage your external API access and monitor usage for billing.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#2FBF71] hover:bg-[#28A661] text-white gap-2">
              <Plus className="h-4 w-4" />
              Generate API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New API Key</DialogTitle>
              <DialogDescription>
                Provide a name for this key (e.g., "Booking System Prod").
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Input 
                placeholder="Key Label (e.g. Booking System)" 
                value={newKeyLabel} 
                onChange={(e) => setNewKeyLabel(e.target.value)} 
                disabled={!!generatedKey}
              />
              <Input 
                placeholder="Business Name" 
                value={newBusinessName} 
                onChange={(e) => setNewBusinessName(e.target.value)} 
                disabled={!!generatedKey}
              />
              {generatedKey && (
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-dashed border-[#2FBF71] relative">
                  <p className="text-xs font-mono break-all pr-8">{generatedKey}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 text-[#2FBF71]"
                    onClick={() => copyToClipboard(generatedKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <p className="text-[10px] text-[#2FBF71] mt-2 font-medium">⚠️ Copy this key now. It will not be shown again.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              {!generatedKey ? (
                <Button onClick={handleCreateKey} disabled={isCreating || !newKeyLabel}>
                  {isCreating && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Generate Key
                </Button>
              ) : (
                <Button onClick={() => { setGeneratedKey(null); setNewKeyLabel(''); setNewBusinessName(''); }}>Done</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Activity className="h-4 w-4" />
            Live Usage
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Code className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-6">
          <Card>
            <CardHeader shadow-sm>
              <CardTitle>Internal API Keys</CardTitle>
              <CardDescription>
                Keys used by external systems to send messages via Wanderlynx.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.label || 'Unnamed Key'}</TableCell>
                      <TableCell>{k.business_name || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground min-w-[300px]">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                            {revealedKeys[k.id] ? k.key_value : `${k.key_value?.substring(0, 12)}...`}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => toggleRevealKey(k.id)}
                            title={revealedKeys[k.id] ? "Hide Key" : "Reveal Key"}
                          >
                            {revealedKeys[k.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => copyToClipboard(k.key_value, "API Key copied")}
                            disabled={!k.key_value}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={k.is_active ? "default" : "secondary"} className={k.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 hover:bg-green-100" : ""}>
                          {k.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(k.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Switch
                            checked={k.is_active}
                            onCheckedChange={() => toggleKeyStatus(k.id, k.is_active)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteKey(k.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {keys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No API keys found. Generate one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-6 flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-3">
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total API Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usage?.totalCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usage && usage.totalCount > 0 ? Math.round((Object.values(usage.summary).reduce((acc, curr) => acc + curr.success, 0) / usage.totalCount) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-green-600">Healthy delivery</p>
                </CardContent>
             </Card>
             <Card className="border-[#2FBF71]/20 bg-[#2FBF71]/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#2FBF71]">Estimated Billing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{usage ? Object.values(usage.summary).reduce((acc, curr) => acc + curr.estimatedCost, 0).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-[#2FBF71]/70 mt-1">Utility: ₹0.20 | Marketing: ₹0.80</p>
                </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader shadow-sm>
              <CardTitle>Usage Breakdown by Key</CardTitle>
              <CardDescription>Detail level usage and costs attributed to each partner integration.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>API Key Name</TableHead>
                    <TableHead>Total Calls</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage && Object.entries(usage.summary).map(([id, stats]) => (
                    <TableRow key={id}>
                      <TableCell className="font-medium">{stats.name}</TableCell>
                      <TableCell>{stats.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {stats.success}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-red-600">
                          <XCircle className="h-3 w-3" />
                          {stats.failed}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#2FBF71]">
                        ₹{stats.estimatedCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 flex flex-col gap-6">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-dashed">
            <div>
               <h3 className="font-semibold text-sm">Monthly Settlement</h3>
               <p className="text-xs text-muted-foreground">Finalize the current month's usage to generate invoices.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleGenerateInvoices}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Generate Invoices
            </Button>
          </div>

          <Card>
            <CardHeader shadow-sm>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Monthly usage summaries and payment tracking for all partners.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.month_year}</TableCell>
                      <TableCell>{record.api_keys?.label || 'Unknown Partner'}</TableCell>
                      <TableCell>{record.success_messages} / {record.total_messages}</TableCell>
                      <TableCell className="font-bold">₹{record.total_cost?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === 'paid' ? 'default' : record.status === 'overdue' ? 'destructive' : 'secondary'}
                          className={record.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : ''}
                        >
                          {record.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {record.status !== 'paid' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#2FBF71] hover:text-[#2FBF71] hover:bg-[#2FBF71]/10 text-xs h-8"
                            onClick={() => handleUpdateBillingStatus(record.id, 'paid')}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground mr-2">Paid ✓</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {billingRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No invoices generated yet. Click "Generate Invoices" to start.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Integration Guide</CardTitle>
                <CardDescription>How to send WhatsApp template messages using your API keys.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Endpoint URL</h3>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border font-mono text-xs">
                    <span className="text-green-600 font-bold uppercase">POST</span>
                    <span className="select-all">https://admin.sangmo.in/api/v1/messages/send</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Authentication</h3>
                  <p className="text-xs text-muted-foreground">Include your API key in the request headers.</p>
                  <pre className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md border text-[10px] font-mono">
                    x-api-key: YOUR_API_KEY
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Example Request (cURL)</h3>
                  <pre className="p-4 bg-slate-950 text-slate-100 rounded-md overflow-x-auto text-[10px] leading-relaxed">
{`curl -X POST https://admin.sangmo.in/api/v1/messages/send \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "to": "919000000000",
    "templateName": "booking_confirmation",
    "variables": ["John Doe", "WLX-12345"]
  }'`}
                  </pre>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                   <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Rate Limiting</h4>
                   <p className="text-xs text-amber-700 dark:text-amber-500/80">
                      Standard keys are limited to 5 OTP templates per 24 hours per recipient. Standard messaging remains unlimited for approved businesses.
                   </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
