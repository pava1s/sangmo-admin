'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';

const plans = [
    {
        id: 'listing',
        name: 'Listing',
        price: '₹0',
        tagline: 'Get discovered on Travonex',
        cta: 'Get Started',
        ctaHref: '/contact',
        highlighted: false,
        badge: null,
        visibleFeatures: [
            'Listing on Travonex',
            'Basic dashboard',
            'Booking management',
        ],
        expandedFeatures: [
            'Create and manage trips',
            'View all your bookings',
            'Basic reporting',
            'Customer info (basic)',
        ],
        note: null,
    },
    {
        id: 'launch',
        name: 'Launch',
        price: '₹999',
        tagline: 'Go online with your own website',
        cta: 'Start Launching',
        ctaHref: '/contact',
        highlighted: false,
        badge: null,
        visibleFeatures: [
            'Your own website',
            'Booking system',
            'Accept payments',
            'Custom domain support',
        ],
        expandedFeatures: [
            'Website with your branding',
            'Trip & experience pages',
            'Booking checkout flow',
            'Payment integration (your gateway OR ours)',
            'Customer data tracking',
            'Mobile-responsive website',
            'Basic support',
        ],
        note: 'No setup cost. No development needed.',
    },
    {
        id: 'growth',
        name: 'Growth',
        price: '₹1,999',
        tagline: 'Best for growing travel businesses',
        cta: 'Start Growing',
        ctaHref: '/contact',
        highlighted: true,
        badge: 'Most Popular',
        visibleFeatures: [
            'Everything in Launch',
            'WhatsApp tools',
            'Priority listing on Travonex',
            'Better reach & visibility',
        ],
        expandedFeatures: [
            'WhatsApp booking confirmations (automatic)',
            'Chat support dashboard (internal tool)',
            'Basic WhatsApp marketing (broadcasts)',
            'Priority visibility on Travonex',
            'Enhanced analytics',
            'Faster support',
        ],
        note: 'Best for growing travel businesses.',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₹3,499',
        tagline: 'Full setup, done for you',
        cta: 'Get Started',
        ctaHref: '/contact',
        highlighted: false,
        badge: null,
        visibleFeatures: [
            'Everything in Growth',
            'SEO optimization',
            'Advanced integrations',
            'Full setup support',
        ],
        expandedFeatures: [
            'SEO optimization for your website',
            'Advanced analytics dashboard',
            'Full API access',
            'Custom integrations',
            'Dedicated support',
            'Complete setup assistance',
        ],
        note: null,
    },
];

function PlanCard({ plan }: { plan: typeof plans[0] }) {
    const [expanded, setExpanded] = useState(false);

    if (plan.highlighted) {
        return (
            <div className="relative flex flex-col bg-[#0B2F5B] text-white rounded-3xl border-2 border-[#2FBF71] shadow-2xl shadow-[#2FBF71]/15 lg:-translate-y-4 overflow-hidden">
                {/* Badge */}
                <div className="bg-[#2FBF71] text-white text-xs font-bold uppercase tracking-widest text-center py-2 px-4">
                    ⭐ {plan.badge}
                </div>

                <div className="p-8 flex flex-col flex-1">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                        <p className="text-blue-200/70 text-sm">{plan.tagline}</p>
                    </div>

                    <div className="text-4xl font-black mb-8">
                        {plan.price}<span className="text-lg font-medium text-blue-200/50">/mo</span>
                    </div>

                    {/* Visible features */}
                    <ul className="space-y-3 mb-4">
                        {plan.visibleFeatures.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-blue-100 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-[#2FBF71] shrink-0 mt-0.5" />
                                {f}
                            </li>
                        ))}
                    </ul>

                    {/* Expandable features */}
                    <AnimatePresence initial={false}>
                        {expanded && (
                            <motion.ul
                                key="expanded"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden space-y-3 mb-4"
                            >
                                {plan.expandedFeatures.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 text-blue-100/80 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-[#2FBF71]/70 shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>

                    {/* Toggle */}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1.5 text-[#2FBF71] text-sm font-semibold mb-6 hover:opacity-80 transition-opacity w-fit"
                        aria-expanded={expanded}
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                        {expanded ? 'See less' : 'View all features'}
                    </button>

                    {plan.note && (
                        <p className="text-blue-200/60 text-xs mb-6 italic">{plan.note}</p>
                    )}

                    <div className="mt-auto">
                        <Link
                            href={plan.ctaHref}
                            className="block w-full py-3.5 rounded-xl bg-[#2FBF71] hover:bg-[#25A05E] font-bold text-white text-center transition-all hover:scale-[1.02] active:scale-100"
                        >
                            {plan.cta}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col bg-white dark:bg-[#0A101C] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{plan.tagline}</p>
                </div>

                <div className="text-4xl font-black text-[#0B2F5B] dark:text-white mb-8">
                    {plan.price}<span className="text-lg font-medium text-slate-400 dark:text-slate-500">/mo</span>
                </div>

                {/* Visible features */}
                <ul className="space-y-3 mb-4">
                    {plan.visibleFeatures.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-[#2FBF71] shrink-0 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>

                {/* Expandable features */}
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.ul
                            key="expanded"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden space-y-3 mb-4"
                        >
                            {plan.expandedFeatures.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-[#2FBF71]/70 shrink-0 mt-0.5" />
                                    {f}
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>

                {/* Toggle */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 text-[#2FBF71] text-sm font-semibold mb-6 hover:opacity-80 transition-opacity w-fit"
                    aria-expanded={expanded}
                >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    {expanded ? 'See less' : 'View all features'}
                </button>

                {plan.note && (
                    <p className="text-slate-400 dark:text-slate-500 text-xs mb-6 italic">{plan.note}</p>
                )}

                <div className="mt-auto">
                    <Link
                        href={plan.ctaHref}
                        className="block w-full py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-center transition-colors"
                    >
                        {plan.cta}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export function PricingSection() {
    return (
        <section className="py-28 px-6 bg-slate-50 dark:bg-[#050A15] border-y border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-16">
                    <p className="text-[#2FBF71] font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">Simple, honest pricing.</h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400">No setup cost. No development charges. Start anytime.</p>
                </div>

                {/* Cards grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start mb-14">
                    {plans.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))}
                </div>

                {/* Trust strip */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-10 space-y-4">
                    <div className="flex flex-wrap gap-x-10 gap-y-3 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2FBF71]" />
                            No setup cost. No development charges.
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2FBF71]" />
                            Payments via platform settled in T+2 working days.
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#2FBF71]" />
                            Connect your own payment gateway in all paid plans.
                        </span>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        🔗 <strong className="text-slate-600 dark:text-slate-300">API access</strong> is available across all plans — higher plans unlock more advanced capabilities.
                    </p>
                </div>
            </div>
        </section>
    );
}
