'use client';

import * as React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShieldCheck, CreditCard, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
    return (
        <div className="flex-1 p-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <div className="space-y-2">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <DollarSign className="h-10 w-10 text-emerald-600" />
                        Billing & Settlement
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        Monitor your API usage, manage partner commissions, and handle monthly trekking settlements.
                    </p>
                </div>

                <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-white/10 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid md:grid-cols-2">
                            <div className="p-12 flex flex-col justify-center space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold w-fit">
                                    <ShieldCheck className="h-3 w-3" />
                                    Secure Payments
                                </div>
                                <h3 className="text-2xl font-bold">Financial Infrastructure</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    We are integrating automated payout cycles and usage-based billing reports. Soon you'll be able to view real-time balance and download tax-ready invoices.
                                </p>
                                <div className="pt-4">
                                    <Button className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 transition-transform gap-2">
                                        View Usage Limits <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-12 flex items-center justify-center relative">
                                <CreditCard className="h-32 w-32 text-white/20 absolute rotate-12" />
                                <div className="relative z-10 text-center text-white space-y-2">
                                    <div className="text-5xl font-black italic opacity-20 select-none">SYSTEM</div>
                                    <div className="text-5xl font-black italic opacity-20 select-none">SETTLING</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-white/5 space-y-3">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-bold">Real-time Usage</h4>
                        <p className="text-xs text-slate-400">Monitor message volume and API hits as they happen.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-white/5 space-y-3">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        <h4 className="font-bold">Partner Payouts</h4>
                        <p className="text-xs text-slate-400">Automated ledger for trekking partner commissions.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-white/5 space-y-3">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        <h4 className="font-bold">Smart Invoices</h4>
                        <p className="text-xs text-slate-400">PDF generation for all financial transactions.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
