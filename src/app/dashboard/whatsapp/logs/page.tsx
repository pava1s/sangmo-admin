'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// import type { LogEntry } from '@/lib/logger';
type LogEntry = any;
import {
  CheckCircle,
  XCircle,
  SkipForward,
  AlertTriangle,
  Lock,
  Zap,
  BarChart3,
  RefreshCcw,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Copy,
  DollarSign,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { getCurrentUser, User } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient as api } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart, Area
} from 'recharts';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

const statusConfig = {
  SUCCESS: {
    variant: 'default',
    icon: CheckCircle,
    label: 'Success',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800',
  },
  FAILURE: {
    variant: 'destructive',
    icon: AlertTriangle,
    label: 'Failure',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
  },
  SKIPPED: {
    variant: 'secondary',
    icon: SkipForward,
    label: 'Skipped',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  },
} as const;

const RATES = {
  marketing: 0.80, // 80 paise
  utility: 0.20,   // 20 paise
  authentication: 0.20,
  service: 0.20
};

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  // Filtering & Search
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  // Usage Stats
  const [apiStats, setApiStats] = React.useState({ total: 0, last24h: 0 });

  // Detail View State
  const [selectedLog, setSelectedLog] = React.useState<LogEntry | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('7'); // Days default

  const loadPageData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (['Super Admin', 'Admin', 'Administrator', 'Internal Staff', 'Tech'].includes(user?.role || '')) {
        const data = await api.getLogs();
        setLogs(Array.isArray(data) ? data : []);

        // Fetch Stats
        // const statsRes = await authFetch('/api/stats/usage');
        // if (statsRes.ok) {
        //   const stats = await statsRes.json();
        //   setApiStats(stats);
        // }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // --- FILTERING LOGIC ---
  const filteredLogs = React.useMemo(() => {
    return logs.filter(log => {
      const matchesSearch =
        log.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.event?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(log.status);
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  // --- ANALYTICS AGGREGATION ---
  const analyticsData = React.useMemo(() => {
    const dailyActivity: Record<string, { date: string; success: number; failure: number }> = {};
    const templateUsage: Record<string, number> = {};
    const userUsage: Record<string, number> = {}; // Track usage per phone number
    let totalCost = 0;

    const days = parseInt(timeRange);
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0); // Include full day range

    // Initialize last N days with Local ISO keys (YYYY-MM-DD)
    // Fix: Use local time instead of UTC to avoid 'yesterday' issues in IST
    const toLocalKey = (d: Date) => d.toLocaleDateString('en-CA');

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoKey = toLocalKey(d);
      dailyActivity[isoKey] = { date: isoKey, success: 0, failure: 0 };
    }

    if (Array.isArray(logs)) {
      logs.forEach(log => {
        const logDate = new Date(log.timestamp);

        // Filter by date range
        if (logDate < startDate) return;

        // 1. Activity Chart
        try {
          const dateKey = logDate.toLocaleDateString('en-CA'); // Use Local Time
          if (dailyActivity[dateKey]) {
            if (log.status === 'SUCCESS') dailyActivity[dateKey].success++;
            if (log.status === 'FAILURE') dailyActivity[dateKey].failure++;
          }
        } catch (e) {
          // invalid timestamp, skip
        }

        // 2. Billing & Template Stats
        // FIX: Check for both direct event name and wrapped event in details (from logMessageEvent adapter)
        const isTemplateEvent =
          log.event === 'API Template Sent' ||
          (log.event === 'send_message' && log.details?.event === 'API Template Sent');

        if (isTemplateEvent && log.status === 'SUCCESS') {
          // Robust extraction: Handle various nested structures
          const tmpl =
            log.details?.templateName ||
            log.details?.template ||
            log.details?.details?.templateName || // Nested from logMessageEvent
            'unknown';

          templateUsage[tmpl] = (templateUsage[tmpl] || 0) + 1;

          // Track User Usage (High Frequency Detection)
          if (log.recipient) {
            userUsage[log.recipient] = (userUsage[log.recipient] || 0) + 1;
          }

          let rate = RATES.utility;
          if (tmpl.includes('auth') || tmpl.includes('otp')) rate = RATES.authentication;
          else if (tmpl.includes('promo') || tmpl.includes('sale') || tmpl.includes('offer')) rate = RATES.marketing;

          totalCost += rate;
        }
      });
    }

    return {
      chart: Object.values(dailyActivity).sort((a, b) => a.date.localeCompare(b.date)),
      templates: Object.entries(templateUsage).sort((a, b) => b[1] - a[1]),
      topUsers: Object.entries(userUsage).sort((a, b) => b[1] - a[1]).slice(0, 10),
      totalCost
    };
  }, [logs, timeRange]);

  // --- EXPORT TO CSV ---
  const handleExport = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Actor', 'Event', 'Recipient', 'Status', 'Details'];
    const rows = filteredLogs.map(log => [
      log.id, log.timestamp, log.actor_id, log.event, log.recipient || '', log.status,
      JSON.stringify(log.details || {}).replace(/"/g, '""')
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDetail = (log: LogEntry) => { setSelectedLog(log); setDetailOpen(true); };
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast({ title: "Copied!", description: "JSON payload copied." }); };

  // --- RENDERING ---
  if (isLoading) return <div className="flex h-screen items-center justify-center"><RefreshCcw className="h-8 w-8 animate-spin text-primary" /></div>;

  const allowedRoles = ['Super Admin', 'Admin', 'Administrator', 'Internal Staff', 'Tech'];
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Access Restricted</h1>
        <Button asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
      </main>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-950/50 space-y-6 p-8 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Logs</h1>
          <p className="text-muted-foreground dark:text-slate-400">Monitor system activity, debug issues, and audit access.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadPageData} disabled={isLoading} className="bg-white dark:bg-slate-900">
            <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={handleExport} className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="live">Live Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Billing</TabsTrigger>
        </TabsList>

        {/* --- TAB: LIVE LOGS --- */}
        <TabsContent value="live" className="space-y-4">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search logs..." className="pl-9 bg-slate-50 dark:bg-slate-800 border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-white dark:bg-slate-900 border-dashed">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked={statusFilter.includes('SUCCESS')} onCheckedChange={(c) => c ? setStatusFilter([...statusFilter, 'SUCCESS']) : setStatusFilter(statusFilter.filter(s => s !== 'SUCCESS'))}>Success</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={statusFilter.includes('FAILURE')} onCheckedChange={(c) => c ? setStatusFilter([...statusFilter, 'FAILURE']) : setStatusFilter(statusFilter.filter(s => s !== 'FAILURE'))}>Failure</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <div className="flex-1 overflow-auto bg-white dark:bg-slate-950">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[120px]">Actor</TableHead>
                    <TableHead className="w-[150px]">Event</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-[120px] text-right">Status</TableHead>
                    <TableHead className="w-[80px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No logs found.</TableCell></TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 group border-b border-slate-50 dark:border-slate-800">
                        <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[10px] text-slate-500 bg-slate-50">{String(log.actor_id || 'system').slice(0, 6)}</Badge>
                        </TableCell>
                        <TableCell><span className="font-medium text-sm text-slate-700 dark:text-slate-300">{log.event}</span></TableCell>
                        <TableCell className="max-w-[400px]"><div className="truncate text-xs text-slate-500 font-mono">{JSON.stringify(log.details)}</div></TableCell>
                        <TableCell className="text-right">
                          <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${statusConfig[log.status as keyof typeof statusConfig]?.className || 'bg-slate-100'}`}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100" onClick={() => openDetail(log)}>
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* --- TAB: ANALYTICS & BILLING --- */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1 shadow-sm border-blue-100 bg-blue-50/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Period Spend (Est)</CardTitle>
                <CardDescription>Based on {analyticsData.templates.reduce((a, b) => a + b[1], 0)} msgs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-900 flex items-baseline">
                  ₹{analyticsData.totalCost.toFixed(2)}
                  <span className="text-sm text-muted-foreground font-normal ml-2">INR</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  ~{(analyticsData.templates.reduce((a, b) => a + b[1], 0) / parseInt(timeRange)).toFixed(0)} msgs/day avg
                </p>
              </CardContent>
            </Card>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Total Requests</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{apiStats.total.toLocaleString()}</div></CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Error Rate</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-red-600">
                  {logs.length > 0 ? ((logs.filter(l => l.status === 'FAILURE').length / logs.length) * 100).toFixed(1) : 0}%
                </div></CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* ACTIVITY CHART */}
            {/* ACTIVITY CHART */}
            <Card className="shadow-sm md:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Traffic Volume</CardTitle>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Today</SelectItem>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="60">Last 2 Months</SelectItem>
                    <SelectItem value="90">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.chart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => { try { return format(new Date(v), 'EEE'); } catch (e) { return v; } }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} />
                      <Legend />
                      <Bar dataKey="success" name="Success" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="failure" name="Failure" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* TOP TEMPLATES */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">Top Templates</CardTitle>
                <CardDescription>Most used message templates by volume.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Est. Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.templates.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No template usage found.</TableCell></TableRow>
                    ) : (
                      analyticsData.templates.slice(0, 10).map(([name, count]) => (
                        <TableRow key={name}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell className="text-right">{count}</TableCell>
                          <TableCell className="text-right text-slate-600">
                            ₹{(count * (name.includes('auth') || name.includes('otp') ? RATES.authentication : RATES.utility)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* TOP USERS (BOT DETECTION) */}
            <Card className="shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-base text-red-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> High Frequency Users</CardTitle>
                <CardDescription>Top phone numbers consuming API (Potential Bots).</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead className="text-right">Requests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.topUsers.length === 0 ? (
                      <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data found.</TableCell></TableRow>
                    ) : (
                      analyticsData.topUsers.map(([phone, count]) => (
                        <TableRow key={phone}>
                          <TableCell className="font-mono text-xs">{phone}</TableCell>
                          <TableCell className="text-right font-bold">{count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- DETAIL DIALOG (Shared) --- */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Log Details <Badge variant="outline">{selectedLog?.id}</Badge></DialogTitle>
            <DialogDescription>{selectedLog && new Date(selectedLog.timestamp).toLocaleString()}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="flex-1 overflow-auto space-y-4">
              <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 font-mono text-xs overflow-auto max-h-[400px]">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(JSON.stringify(selectedLog.details, null, 2))}>
                <Copy className="w-4 h-4 mr-2" /> Copy JSON
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}