'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  MessageSquare, 
  Mail, 
  Calendar, 
  Briefcase,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { getSession, isSuperAdmin } from '@/lib/auth';

export default function DashboardPage() {
  const session = getSession();
  const isAdmin = isSuperAdmin(session);

  const modules = [
    {
      id: 'whatsapp',
      title: 'WhatsApp CRM',
      description: 'Customer messaging, inbox, and campaign automation.',
      icon: MessageSquare,
      href: '/dashboard/whatsapp/inbox',
      restricted: !isAdmin,
      color: 'text-green-600',
      bg: 'bg-green-500/10'
    },
    {
      id: 'email',
      title: 'Email Center',
      description: 'Itineraries, confirmations, and traveler updates.',
      icon: Mail,
      href: '/dashboard/email',
      restricted: !isAdmin,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'bookings',
      title: 'Booking Manager',
      description: 'Logistics, traveler lists, and trek management.',
      icon: Calendar,
      href: '/dashboard/bookings',
      restricted: false,
      color: 'text-purple-600',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'partners',
      title: 'Partner Portal',
      description: 'Manage organizers, payouts, and assignments.',
      icon: Briefcase,
      href: '/dashboard/partners',
      restricted: !isAdmin,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10'
    }
  ];

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Service Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          {isAdmin ? 'Master Administrator Workspace — Overseeing all operations.' : 'Organizer Workspace — Manage your assigned treks.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {modules.map((mod) => (
          <Card 
            key={mod.id} 
            className={`group relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 transition-all hover:shadow-2xl hover:scale-[1.01] ${mod.restricted ? 'opacity-60 grayscale cursor-not-allowed shadow-none' : 'hover:border-primary/40'}`}
          >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
               <mod.icon className="h-24 w-24" />
            </div>
            
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className={`p-3 rounded-2xl ${mod.bg} ${mod.color} shadow-inner`}>
                <mod.icon className="h-8 w-8" />
              </div>
              {!mod.restricted ? (
                <Link href={mod.href}>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-full text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-2xl font-bold mb-2">{mod.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {mod.description}
                </CardDescription>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                {!mod.restricted ? (
                  <Link 
                    href={mod.href} 
                    className="inline-flex items-center text-sm font-semibold text-[#2FBF71] hover:text-[#28a361] transition-colors group/link"
                  >
                    Enter Module
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                ) : (
                  <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 w-fit px-3 py-1 rounded-full">
                     <Lock className="mr-2 h-3 w-3" />
                     Restricted
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}