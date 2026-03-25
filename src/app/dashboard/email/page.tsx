'use client';

import * as React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailCenterPage() {
    return (
        <div className="flex-1 p-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                <div className="space-y-2">
                    <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <Mail className="h-10 w-10 text-blue-600" />
                        Email Center
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl">
                        Seamlessly integrate transactional emails and marketing broadcasts with your WhatsApp CRM.
                    </p>
                </div>

                <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-200/50 dark:ring-white/10 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid md:grid-cols-2">
                            <div className="p-12 flex flex-col justify-center space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold w-fit">
                                    <Sparkles className="h-3 w-3" />
                                    Phase 2 Development
                                </div>
                                <h3 className="text-2xl font-bold">Omni-Channel Mastery</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    Our engineers are currently wiring the AWS SES integration to allow cross-platform campaigns. 
                                    Soon, you'll be able to follow up on WhatsApp messages via professional email threads automatically.
                                </p>
                                <div className="pt-4">
                                    <Button className="rounded-full px-6 bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-105 transition-transform gap-2">
                                        Join Waitlist <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 flex items-center justify-center relative">
                                <Mail className="h-32 w-32 text-white/20 absolute rotate-12" />
                                <div className="relative z-10 text-center text-white space-y-2">
                                    <div className="text-5xl font-black italic opacity-20 select-none">COMING</div>
                                    <div className="text-5xl font-black italic opacity-20 select-none">SOON</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Template Engine', 'Open/Click Tracking', 'List Segmentation'].map((feature) => (
                        <div key={feature} className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-white/5 space-y-2 group hover:bg-white dark:hover:bg-slate-900 transition-colors">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{feature}</h4>
                            <div className="h-1 w-8 bg-blue-500 rounded-full group-hover:w-full transition-all duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
