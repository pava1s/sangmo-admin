'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, GripVertical, MessageSquare, DollarSign, Calendar, MoreHorizontal } from 'lucide-react';
import { Deal, DealStage } from '@/lib/types'; // We need to define this
import { formatCurrency } from '@/lib/utils'; // Make sure this exists
import Link from 'next/link';

// Stages Configuration
const STAGES: { id: DealStage; label: string; color: string }[] = [
    { id: 'lead', label: 'Lead', color: 'bg-slate-500' },
    { id: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
    { id: 'proposal', label: 'Proposal', color: 'bg-indigo-500' },
    { id: 'negotiation', label: 'Negotiation', color: 'bg-purple-500' },
    { id: 'won', label: 'Closed Won', color: 'bg-emerald-500' },
    { id: 'lost', label: 'Closed Lost', color: 'bg-red-500' },
];

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchDeals();
    }, []);

    async function fetchDeals() {
        setLoading(true);
        const { data, error } = await fetch('/api/deals').then(res => res.json());
        if (data) setDeals(data);
        setLoading(false);
    }

    const onDrop = async (dealId: string, newStage: DealStage) => {
        // Optimistic Update
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));

        // API Call
        await fetch(`/api/deals/${dealId}`, {
            method: 'PATCH',
            body: JSON.stringify({ stage: newStage })
        });
    };

    return (
        <div className="h-[calc(100vh-64px)] p-6 overflow-x-auto bg-slate-50 dark:bg-slate-900/50">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sales Pipeline</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage leads and track revenue.</p>
                </div>
                <button className="bg-[#0B2F5B] hover:bg-[#09254a] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Deal
                </button>
            </div>

            <div className="flex gap-6 h-full min-w-[1200px] pb-4">
                {STAGES.map(stage => (
                    <KanbanColumn
                        key={stage.id}
                        stage={stage}
                        deals={deals.filter(d => d.stage === stage.id)}
                        onDrop={onDrop}
                    />
                ))}
            </div>
        </div>
    );
}

function KanbanColumn({ stage, deals, onDrop }: { stage: any, deals: Deal[], onDrop: (id: string, stage: DealStage) => void }) {
    const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-slate-100', 'dark:bg-slate-800');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-slate-100', 'dark:bg-slate-800');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-slate-100', 'dark:bg-slate-800');
        const dealId = e.dataTransfer.getData('dealId');
        if (dealId) onDrop(dealId, stage.id);
    };

    return (
        <div
            className="flex-1 min-w-[280px] flex flex-col rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-full transition-colors duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-950 rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{stage.label}</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium">
                        {deals.length}
                    </span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                    {formatCurrency(totalValue)}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                ))}
                {deals.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 text-sm italic">
                        Empty
                    </div>
                )}
            </div>
        </div>
    );
}

function DealCard({ deal }: { deal: Deal }) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('dealId', deal.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-grab active:cursor-grabbing transition-all"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-800 dark:text-white line-clamp-2 leading-tight">
                    {deal.title}
                </h4>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="mb-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="truncate max-w-[150px]">{deal.customers?.full_name || 'No Customer'}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    <DollarSign className="w-3 h-3 text-slate-400" />
                    {deal.value?.toLocaleString()}
                </div>
                {deal.customers?.id && (
                    <Link href={`/dashboard/inbox?customer=${deal.customers.id}`} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
