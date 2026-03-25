'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  Send, 
  ScrollText,
  Rocket,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    contacts: 5,
    messages: 302,
    campaigns: 0,
    templates: 9
  });
  const [feed, setFeed] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Simulated fetch of recent activity
    setFeed([
      { id: '1', type: 'send_message', to: '8073786033', status: 'success', time: '21:33:12' },
      { id: '2', type: 'send_message', to: '8050572359', status: 'success', time: '21:33:05' },
      { id: '3', type: 'template_sync', name: 'booking_confirmation', status: 'success', time: '19:45:00' },
    ]);
  }, []);

  const statCards = [
    { title: 'Total Contacts', value: stats.contacts, sub: 'Total contacts in CRM', icon: Users },
    { title: 'Messages Processed', value: stats.messages, sub: 'Sent & Received', icon: MessageSquare },
    { title: 'Active Campaigns', value: stats.campaigns, sub: 'Currently running', icon: Send },
    { title: 'Templates', value: stats.templates, sub: 'Synced from Meta', icon: ScrollText },
  ];

  const steps = [
    { 
      id: 1, 
      title: 'Import Contacts', 
      desc: 'Upload your customer list via CSV to start building your audience.',
      link: '/dashboard/whatsapp/contacts',
      linkText: 'Go to Contacts'
    },
    { 
      id: 2, 
      title: 'Sync Templates', 
      desc: 'Fetch your approved message templates from WhatsApp Manager.',
      link: '/dashboard/whatsapp/templates',
      linkText: 'Go to Templates'
    },
    { 
      id: 3, 
      title: 'Send Campaign', 
      desc: 'Create your first broadcast campaign to engage your users.',
      link: '/dashboard/whatsapp/campaigns',
      linkText: 'Draft Campaign'
    }
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
                  <h3 className="text-3xl font-bold tracking-tight">{card.value}</h3>
                </div>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-[#2FBF71] transition-colors">
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-slate-400">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Guide */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
              <Rocket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Quick Start Guide</h2>
          </div>
          <p className="text-slate-500 mb-8 max-w-2xl">Complete these steps to get your Wanderlynx environment ready for production.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.id} className="relative p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#2FBF71]/30 transition-colors group">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400">
                    {step.id}
                  </span>
                  <h3 className="font-bold">{step.title}</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 min-h-[40px]">
                  {step.desc}
                </p>
                <Link 
                  href={step.link}
                  className="inline-flex items-center text-sm font-bold text-[#2FBF71] hover:underline gap-1.5"
                >
                  {step.linkText}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Live Activity Feed</h2>
                <p className="text-sm text-slate-500">Real time system events and message logs.</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-[#2FBF71] font-bold">View All</Button>
          </div>

          <div className="space-y-6">
            {feed.map((item) => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-[#2FBF71]' : 'bg-amber-500'} shadow-[0_0_8px_rgba(47,191,113,0.5)]`} />
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">{item.type}</p>
                    <p className="text-xs text-slate-500">To: {item.to || item.name}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 group-hover:text-slate-600 transition-colors">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}