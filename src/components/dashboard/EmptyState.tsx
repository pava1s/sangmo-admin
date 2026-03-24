'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function DashboardEmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: DashboardEmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50 duration-500", className)}>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                <Icon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} size="lg" className="rounded-full font-medium">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
