'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Plus, Trash2, Zap, Headphones, DollarSign, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { apiClient as api } from '@/lib/api-client';

export default function AutomationsPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newKeywords, setNewKeywords] = useState('');
    const [newAction, setNewAction] = useState('assign_team');
    const [newTeam, setNewTeam] = useState('Sales');
    const [newReply, setNewReply] = useState(''); // Separated state

    const PRESETS = [
        { name: 'Sales Inquiry', keywords: 'price, cost, quote, demo, buy', team: 'Sales' },
        { name: 'Login Issues', keywords: 'login, password, reset, cant access', team: 'Support' },
        { name: 'Refund Request', keywords: 'refund, money back, cancel, charge', team: 'Support' },
        { name: 'Urgent Bug', keywords: 'crash, bug, broken, 500, emergency', team: 'Tech' },
    ];

    const applyPreset = (preset: any) => {
        setNewName(preset.name);
        setNewKeywords(preset.keywords);
        setNewTeam(preset.team);
        setNewAction('assign_team'); // Force assignment type
    };

    useEffect(() => {
        fetchRules();
    }, []);

    async function fetchRules() {
        setIsLoading(true);
        try {
            const data = await api.getAutomations();
            setRules(data || []);
        } catch (error) {
            console.error('Error fetching rules:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function toggleRule(id: string, currentStatus: boolean) {
        // Optimistic update
        setRules(rules.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
        // Placeholder for AWS update
        try {
            await api.updateAutomation(id, { is_active: !currentStatus });
        } catch (error) {
            console.error("Failed to toggle", error);
            fetchRules(); // Revert on error
        }
    }

    async function deleteRule(id: string) {
        if (!confirm("Are you sure you want to delete this rule?")) return;
        setRules(rules.filter(r => r.id !== id));
        // Placeholder for AWS delete
        try {
            await api.deleteAutomation(id);
        } catch (error) {
            console.error("Failed to delete", error);
            fetchRules(); // Revert on error
        }
    }

    async function createRule() {
        const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

        // Determine value based on action type
        const actionValue = newAction === 'assign_team' ? newTeam : newReply;

        const newRule = {
            id: Math.random().toString(36).substr(2, 9), // Temporary ID for optimistic update
            name: newName,
            keywords: keywordsArray,
            action_type: newAction,
            action_value: actionValue,
            match_type: 'contains',
            is_active: true
        };

        setRules([newRule, ...rules]);
        setIsCreateOpen(false);
        // Reset form
        setNewName('');
        setNewKeywords('');
        setNewReply(''); // Reset reply as well

        // Placeholder for AWS insert
        try {
            // @ts-ignore
            await api.createAutomation(newRule);
            fetchRules(); // Re-fetch to get actual ID and ensure consistency
        } catch (error) {
            console.error("Failed to create rule", error);
            fetchRules(); // Revert on error
        }
    }

    const getIcon = (team: string) => {
        if (team === 'Sales') return <DollarSign className="w-5 h-5 text-green-500" />;
        if (team === 'Support') return <Headphones className="w-5 h-5 text-blue-500" />;
        if (team === 'Tech') return <Activity className="w-5 h-5 text-purple-500" />;
        return <Zap className="w-5 h-5 text-slate-500" />;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bot className="w-8 h-8 text-indigo-600" />
                        Automation Rules
                    </h1>
                    <p className="text-slate-500">Manage how your bot routes conversations and replies.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4" /> Add Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Automation Rule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">

                            {/* Presets Grid */}
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500 uppercase tracking-wider font-bold">Quick Presets</Label>
                                <div className="flex flex-wrap gap-2">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p.name}
                                            onClick={() => applyPreset(p)}
                                            className="px-3 py-1 text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-transparent rounded-full transition-colors duration-200"
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input placeholder="e.g. Pricing Handler" value={newName} onChange={e => setNewName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Keywords (Comma separated)</Label>
                                <Input placeholder="price, cost, quote" value={newKeywords} onChange={e => setNewKeywords(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <Select value={newAction} onValueChange={setNewAction}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="assign_team">Assign Team</SelectItem>
                                            <SelectItem value="auto_reply">Auto Reply</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {newAction === 'assign_team' ? (
                                    <div className="space-y-2">
                                        <Label>Target Team</Label>
                                        <Select value={newTeam} onValueChange={setNewTeam}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sales">Sales</SelectItem>
                                                <SelectItem value="Support">Support</SelectItem>
                                                <SelectItem value="Tech">Tech</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Reply Message</Label>
                                        <Input
                                            placeholder="e.g. Our hours are 9-5..."
                                            value={newReply}
                                            onChange={e => setNewReply(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={createRule}>Create Rule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {rules.map(rule => (
                    <Card key={rule.id} className="flex items-center p-4 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full border">
                            {getIcon(rule.action_value)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{rule.name}</h3>
                                {!rule.is_active && <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-full font-bold uppercase tracking-wide">Inactive</span>}
                            </div>
                            <p className="text-sm text-slate-500">
                                If message contains <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">{rule.keywords.join(', ')}</span>
                                {' '}&rarr; Assign to <span className="font-medium text-slate-900 dark:text-slate-200">{rule.action_value}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Label htmlFor={`switch-${rule.id}`} className="text-xs text-slate-500">
                                    {rule.is_active ? 'On' : 'Off'}
                                </Label>
                                <Switch
                                    id={`switch-${rule.id}`}
                                    checked={rule.is_active}
                                    onCheckedChange={(checked) => toggleRule(rule.id, !checked)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="text-red-400 hover:text-red-500 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}

                {!isLoading && rules.length === 0 && (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-1">No rules yet</h3>
                        <p className="mb-6 max-w-sm mx-auto">Get started by creating your first rule or use our verified presets.</p>

                        <div className="flex justify-center gap-3">
                            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                                Create Manually
                            </Button>
                            <Button onClick={async () => {
                                setIsLoading(true);
                                const defaultRules = [
                                    { id: 'd1', name: 'Sales Handler', keywords: ['price', 'cost', 'quote'], action_type: 'assign_team', action_value: 'Sales', match_type: 'contains', is_active: true },
                                    { id: 'd2', name: 'Support Bot', keywords: ['help', 'issue', 'otp'], action_type: 'assign_team', action_value: 'Support', match_type: 'contains', is_active: true }
                                ];
                                setRules(defaultRules);
                                setIsLoading(false);
                            }}>
                                <Zap className="w-4 h-4 mr-2" />
                                Generate Defaults
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
