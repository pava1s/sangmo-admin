'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, MessageSquare } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

import { createClient } from '@/utils/supabase/client';

export default function AnalyticsPage() {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    const supabase = createClient();

    React.useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        }

        loadData();

        // Realtime Subscription
        const channel = supabase
            .channel('analytics-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                loadData(); // Reload on new message
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                loadData(); // Reload on status change
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!data) return <div>Failed to load data.</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Analytics Dashboard</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalMessages}</div>
                        <p className="text-xs text-muted-foreground">Last 7 Days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.openConversations}</div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                {data.openConversations} Open
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                {data.closedConversations} Closed
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Volume Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Message Volume</CardTitle>
                        <CardDescription>Incoming vs Outgoing messages over the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.volume}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="incoming" stackId="1" stroke="#8884d8" fillOpacity={1} fill="url(#colorIn)" name="Incoming" />
                                    <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#82ca9d" fillOpacity={1} fill="url(#colorOut)" name="Outgoing" />
                                    <Legend />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Distribution Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Team Workload</CardTitle>
                        <CardDescription>Active conversations per department.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.teamDistribution} layout="vertical">
                                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Conversations" barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
