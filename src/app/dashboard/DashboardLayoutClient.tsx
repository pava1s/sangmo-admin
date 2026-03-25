'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  ScrollText,
  Send,
  Settings,
  LogOut,
  History,
  Menu,
  Loader2,
  Bot,
  BarChart,
  DollarSign,
  Code,
  Mail,
  Calendar,
  Briefcase,
  UserPlus,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { getSession, isSuperAdmin } from '@/lib/auth';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TravonexLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from '@/components/ThemeToggle';

// ✅ FIX: Define the type to allow 'badge' to be optional
type MenuItem = {
  href: string;
  label: string;
  icon: any;
  roles: string[];
  badge?: string | number;
};

const menuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'organizer'] },
  { href: '/dashboard/whatsapp/inbox', label: 'Inbox', icon: MessageSquare, roles: ['super_admin', 'organizer'] },
  { href: '/dashboard/whatsapp/contacts', label: 'Contacts', icon: Users, roles: ['super_admin', 'organizer'] },
  { href: '/dashboard/whatsapp/campaigns', label: 'Campaigns', icon: Send, roles: ['super_admin', 'organizer'] },
  { href: '/dashboard/whatsapp/automations', label: 'Automations', icon: Bot, roles: ['super_admin', 'organizer'] },
  { href: '/dashboard/whatsapp/analytics', label: 'Analytics', icon: BarChart, roles: ['super_admin', 'organizer'] },
  { href: '/dashboard/whatsapp/billing', label: 'Billing', icon: DollarSign, roles: ['super_admin', 'organizer'] },
];

const adminMenuItems: MenuItem[] = [
  { href: '/dashboard/whatsapp/developers', label: 'Developers', icon: Code, roles: ['super_admin'] },
  { href: '/dashboard/whatsapp/logs', label: 'Logs', icon: History, roles: ['super_admin'] },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
];

const workspaceModules = [
  { 
    href: '/dashboard/whatsapp/inbox', 
    label: 'WhatsApp CRM', 
    desc: 'Customer messaging, inbox, and campaign automation.', 
    icon: MessageSquare, 
    color: 'bg-green-500' 
  },
  { 
    href: '/dashboard/email', 
    label: 'Email Center', 
    desc: 'Itineraries, confirmations, and traveler updates.', 
    icon: Mail, 
    color: 'bg-blue-500' 
  },
  { 
    href: '/dashboard/bookings', 
    label: 'Booking Manager', 
    desc: 'Logistics, traveler lists, and trek management.', 
    icon: Calendar, 
    color: 'bg-purple-500' 
  },
  { 
    href: '/dashboard/partners', 
    label: 'Partner Portal', 
    desc: 'Manage organizers, payouts, and assignments.', 
    icon: Briefcase, 
    color: 'bg-orange-500' 
  },
];

const whatsappSubItems = [
  { href: '/dashboard/whatsapp/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/dashboard/whatsapp/campaigns', label: 'Campaigns', icon: Send },
  { href: '/dashboard/whatsapp/automations', label: 'Automations', icon: Bot },
  { href: '/dashboard/whatsapp/templates', label: 'Templates', icon: ScrollText },
  { href: '/dashboard/whatsapp/contacts', label: 'Contacts', icon: Users },
  { href: '/dashboard/whatsapp/analytics', label: 'Analytics', icon: BarChart },
  { href: '/dashboard/whatsapp/developers', label: 'Developers', icon: Code },
  { href: '/dashboard/whatsapp/logs', label: 'Logs', icon: History },
];

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [status, setStatus] = React.useState<'online' | 'offline'>('online');

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const session = getSession();
        setUser({
          id: session.role === 'super_admin' ? 'admin-1' : 'org-1',
          name: session.role === 'super_admin' ? 'Sangmo Master' : 'Partner Organizer',
          email: session.email,
          role: session.role,
          avatar: ''
        });
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const toggleStatus = async () => {
    const newStatus = status === 'online' ? 'offline' : 'online';
    setStatus(newStatus);
    // Placeholder for AWS status update
  };

  const handleLogout = async () => {
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-lg font-semibold text-muted-foreground">
            Loading Platform...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Simple role-based access for the isolated admin dashboard
  const accessibleMenuItems = menuItems.filter(item => {
    return item.roles.includes(user.role);
  });

  const accessibleAdminItems = adminMenuItems.filter(item => {
    return item.roles.includes(user.role);
  });

  const isInbox = pathname === '/dashboard/whatsapp/inbox';

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full min-w-0 overflow-hidden">

        <Sidebar
          collapsible="none"
          className="!w-[72px] shrink-0 m-6 h-[calc(100vh-48px)] rounded-[24px] border border-white/20 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] ring-1 ring-white/30 dark:ring-white/5 z-50 flex flex-col items-center py-6 gap-8 transition-all duration-300 ease-out"
        >
          <SidebarHeader className="p-0 flex justify-center w-full mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2FBF71]/10 text-[#2FBF71] hover:bg-[#2FBF71]/20 transition-transform active:scale-95 cursor-pointer shadow-sm relative group" title="Wanderlynx">
              <div className="absolute inset-0 bg-[#2FBF71]/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <TravonexLogo className="size-6 relative z-10" />
            </div>
          </SidebarHeader>

          <SidebarContent className="flex flex-col items-center w-full gap-2 px-0 no-scrollbar justify-center">
            <SidebarMenu className="flex flex-col items-center gap-4 w-full px-2">
              {accessibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.href} className="w-full flex justify-center">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
                    tooltip={item.label}
                    className="h-10 w-10 justify-center rounded-[12px] p-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 data-[active=true]:bg-[#2FBF71]/10 data-[active=true]:text-[#2FBF71] data-[active=true]:scale-105 relative group ring-0 hover:ring-1 hover:ring-slate-200 dark:hover:ring-slate-700 data-[active=true]:ring-1 data-[active=true]:ring-[#2FBF71]/20"
                  >
                    <Link href={item.href} className="flex h-full w-full items-center justify-center relative">
                      {/* Minimal Left Indicator Dot */}
                      {(pathname === item.href || pathname?.startsWith(item.href + '/')) && (
                        <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#2FBF71] rounded-full shadow-[0_0_8px_rgba(47,191,113,0.6)] animate-in fade-in zoom-in duration-300" />
                      )}
                      <item.icon className="h-5 w-5 relative z-10" strokeWidth={2} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {accessibleAdminItems.length > 0 && (
              <SidebarGroup className="mt-auto w-full flex flex-col items-center p-0 gap-2">
                <div className="h-px w-8 bg-slate-200/50 dark:bg-slate-700/50 my-2" />
                <SidebarMenu className="flex flex-col items-center gap-4 w-full px-2">
                  {accessibleAdminItems.map((item) => (
                    <SidebarMenuItem key={item.href} className="w-full flex justify-center">
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                        className="h-10 w-10 justify-center rounded-[12px] p-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 data-[active=true]:bg-[#2FBF71]/10 data-[active=true]:text-[#2FBF71] data-[active=true]:scale-105 relative group ring-0 hover:ring-1 hover:ring-slate-200 dark:hover:ring-slate-700 data-[active=true]:ring-1 data-[active=true]:ring-[#2FBF71]/20"
                      >
                        <Link href={item.href} className="flex h-full w-full items-center justify-center relative">
                          {/* Minimal Left Indicator Dot */}
                          {pathname === item.href && (
                            <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-[#2FBF71] rounded-full shadow-[0_0_8px_rgba(47,191,113,0.6)] animate-in fade-in zoom-in duration-300" />
                          )}
                          <item.icon className="h-5 w-5 relative z-10" strokeWidth={2} />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="p-0 w-full flex flex-col items-center justify-center pb-6 border-t border-slate-200/20 dark:border-white/5 pt-4 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer group flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
                  <Avatar className="h-9 w-9 border border-white/50 dark:border-white/20 shadow-sm ring-1 ring-transparent group-hover:ring-slate-200 dark:group-hover:ring-slate-700 transition-all">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-[#0B2F5B] text-white text-xs font-bold">{user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl border-slate-100 dark:border-slate-800 shadow-xl dark:bg-slate-950"
                side="right"
                align="end"
                sideOffset={16}
              >
                <div className="px-3 py-2 text-sm bg-slate-50/50 dark:bg-slate-900/50 dark:text-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                    <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`} title={status} />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{user.role}</div>

                  <div
                    onClick={(e) => { e.preventDefault(); toggleStatus(); }}
                    className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-800 border dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-xs font-medium flex items-center gap-1.5">
                      {status === 'online' ? (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      )}
                      Active Status
                    </span>
                    <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ease-in-out ${status === 'online' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                      <div className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${status === 'online' ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
                <DropdownMenuItem asChild>
                  <div className="w-full cursor-pointer">
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={handleLogout} className="m-1 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-lg font-medium">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN CONTENT */}
        <SidebarInset className="flex text-clip overflow-hidden">
          {/* Header & Sub-Navigation Container */}
          <div className="flex flex-col w-full sticky top-0 z-20">
            {/* Main Header (Hidden on Inbox for immersive view) */}
            {!isInbox && (
              <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 transition-all">
                <div className="flex items-center gap-4 px-4 font-geist">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/dashboard" className="text-slate-500 hover:text-[#2FBF71] transition-colors">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      {pathname !== '/dashboard' && (
                        <>
                          <BreadcrumbSeparator className="hidden md:block" />
                          <BreadcrumbItem>
                            <BreadcrumbPage className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                              {pathname?.split('/').pop()?.replace('-', ' ')}
                            </BreadcrumbPage>
                          </BreadcrumbItem>
                        </>
                      )}
                    </BreadcrumbList>
                  </Breadcrumb>

                  <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 gap-2 bg-[#2FBF71]/5 hover:bg-[#2FBF71]/10 text-[#2FBF71] border border-[#2FBF71]/20 rounded-lg px-4 transition-all hover:scale-105 active:scale-95">
                            <LayoutGrid className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Switch Workspace</span>
                            <ChevronDown className="w-3 h-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[320px] p-3 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-3xl bg-white/90 dark:bg-slate-950/90">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">Core Modules</div>
                          {workspaceModules.map((module) => (
                            <div key={module.href} className="group relative rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all p-2 mb-2 last:mb-0 border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                              <div className="flex gap-4">
                                <div className={`mt-1 h-10 w-10 shrink-0 rounded-xl ${module.color} bg-opacity-10 flex items-center justify-center text-white`}>
                                  <div className={`h-8 w-8 rounded-lg ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <module.icon className="w-4 h-4" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">{module.label}</div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
                                    {module.desc}
                                  </div>
                                  <Link 
                                    href={module.href} 
                                    className="inline-flex items-center text-[10px] font-bold text-[#2FBF71] hover:underline gap-1 group/btn"
                                  >
                                    Enter Module
                                    <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                </div>
              </header>
            )}

            {/* Glassmorphism Sub-Header for WhatsApp (Visible on all WhatsApp routes) */}
            {pathname?.includes('/whatsapp') && (
              <div className="flex h-12 items-center px-8 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/20 dark:border-white/5 overflow-x-auto no-scrollbar gap-2 shadow-sm">
                {whatsappSubItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={`flex items-center gap-2 px-4 h-8 rounded-full transition-all text-xs font-medium whitespace-nowrap ${
                        isActive 
                          ? 'bg-[#2FBF71] text-white shadow-[0_4px_12px_rgba(47,191,113,0.3)] scale-105' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-[#2FBF71]'
                      }`}
                    >
                      <item.icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className={isInbox ? "flex-1 h-screen overflow-hidden bg-white dark:bg-slate-950" : "flex-1 p-4 md:p-6 overflow-auto"}>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}