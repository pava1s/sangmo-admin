'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Users,
  MessageSquare,
  Send,
  ScrollText,
  Loader,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    contacts: 0,
    messages: 0,
    templates: 0,
    activeCampaigns: 0,
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // 1. Get Contact Count from AWS Customers API
        const customers = await api.getContacts();
        
        // 2. Mocking other stats for now as we port the backend
        // In a real scenario, these would also come from specialized AWS endpoints
        setStats({
          contacts: Array.isArray(customers) ? customers.length : 0,
          messages: 302, // From our migration summary
          templates: 12,
          activeCampaigns: 0,
          recentActivity: [
            { id: '1', event: 'System Migration', status: 'SUCCESS', timestamp: new Date().toISOString() },
            { id: '2', event: 'AWS Infrastructure Live', status: 'SUCCESS', timestamp: new Date().toISOString() },
            { id: '3', event: 'DynamoDB Sync Complete', status: 'SUCCESS', timestamp: new Date().toISOString() },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats from AWS", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center p-10"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* CONTACTS CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.contacts}</div>
            <p className="text-sm text-muted-foreground">Total contacts in CRM</p>
          </CardContent>
        </Card>

        {/* MESSAGES CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Processed</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.messages}</div>
            <p className="text-sm text-muted-foreground">Sent & Received</p>
          </CardContent>
        </Card>

        {/* CAMPAIGNS CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-sm text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        {/* TEMPLATES CARD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <ScrollText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.templates}</div>
            <p className="text-sm text-muted-foreground">Synced from Meta</p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS / ONBOARDING STATE */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Start Widget */}
        <Card className="col-span-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-bold">🚀</span>
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Complete these steps to get your Wanderlynx environment ready for production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Step 1 */}
              <div className="flex flex-col gap-2 p-4 rounded-xl border bg-white dark:bg-slate-950/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">1</div>
                  Import Contacts
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                  Upload your customer list via CSV to start building your audience.
                </p>
                <div className="pl-8 mt-2">
                  <Link href="/dashboard/contacts" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
                    Go to Contacts &rarr;
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-2 p-4 rounded-xl border bg-white dark:bg-slate-950/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">2</div>
                  Sync Templates
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                  Fetch your approved message templates from WhatsApp Manager.
                </p>
                <div className="pl-8 mt-2">
                  <Link href="/dashboard/templates" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
                    Go to Templates &rarr;
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-2 p-4 rounded-xl border bg-white dark:bg-slate-950/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">3</div>
                  Send Campaign
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-8">
                  Create your first broadcast campaign to engage your users.
                </p>
                <div className="pl-8 mt-2">
                  <Link href="/dashboard/campaigns" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center">
                    Draft Campaign &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* RECENT ACTIVITY FEED */}
        <Card className="col-span-full border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-sm font-bold">📡</span>
              Live Activity Feed
            </CardTitle>
            <CardDescription>
              Real-time system events and message logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">No recent activity found.</div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={`mt-1 h-2 w-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : log.status === 'FAILURE' ? 'bg-red-500' : 'bg-slate-300'}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                        {log.event}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span className="font-mono">{log.recipient ? `To: ${log.recipient}` : `Actor: ${log.actor_id}`}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main >
  );
}