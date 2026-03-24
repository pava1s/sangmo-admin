'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TravonexLogo } from './icons';
import clsx from 'clsx';

// Navigation Data
const navItems = [
    { name: 'Home', href: '/' },
    { name: 'For Businesses', href: '/for-businesses' },
    { name: 'About', href: '/about' },
    { name: 'Platforms', href: '/platforms' }, // Points to the new Platforms & Infrastructure overview
    { name: 'Insights', href: '/insights' },
    { name: 'Contact', href: '/contact' },
];

export default function Header() {
    const [activeTab, setActiveTab] = useState(navItems[0].name);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Hide Header on Dashboard pages
    if (pathname?.startsWith('/dashboard') || pathname === '/login') return null;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 h-[80px] flex items-center justify-between px-6 md:px-10 transition-all duration-300 border-b border-slate-200/50 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">

                {/* --- LOGO AREA --- */}
                <Link href="/" className="flex items-center gap-4 group outline-none relative z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-center relative"
                    >
                        <div className="absolute inset-0 bg-[#2FBF71]/0 group-hover:bg-[#2FBF71]/10 rounded-full blur-xl transition-all duration-700 scale-150 pointer-events-none" />
                        <TravonexLogo className="w-8 h-8 opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105 relative z-10" />
                    </motion.div>

                    <div className="flex flex-col justify-center mt-1">
                        <motion.span
                            initial={{ letterSpacing: "-0.05em", opacity: 0, filter: "blur(4px)", x: -10 }}
                            animate={{ letterSpacing: "-0.03em", opacity: 1, filter: "blur(0px)", x: 0 }}
                            transition={{ duration: 1.2, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[22px] md:text-2xl font-bold text-[#0B2F5B] dark:text-white leading-none flex items-center relative overflow-hidden pb-1 -mb-1"
                        >
                            <motion.span
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ repeat: Infinity, repeatType: "loop", duration: 3, ease: "linear", repeatDelay: 1 }}
                                className="absolute inset-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent skew-x-[-20deg] z-20 pointer-events-none mix-blend-overlay"
                            />
                            Wanderlynx
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: [0, 1, 0.8, 1], scale: [0.5, 1.2, 1] }}
                                transition={{ delay: 1.0, duration: 0.8, ease: "backOut" }}
                                className="text-[#2FBF71] ml-[1px] inline-block origin-bottom shrink-0"
                            >
                                .
                            </motion.span>
                        </motion.span>

                        <motion.span
                            initial={{ letterSpacing: "0.1em", opacity: 0, y: 5 }}
                            animate={{ letterSpacing: "0.3em", opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                            className="text-[10px] font-mono text-[#2FBF71] uppercase mt-1 leading-none origin-left font-bold"
                        >
                            Labs
                        </motion.span>
                    </div>
                </Link>

                {/* --- DESKTOP NAVIGATION (The Flowing Pill) --- */}
                <nav className="hidden md:flex items-center bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-full border border-slate-200/50 dark:border-white/5">
                    <ul className="flex items-center gap-1 relative">
                        {navItems.map((item) => (
                            <li key={item.name} className="relative z-10">
                                <Link
                                    href={item.href}
                                    onClick={() => setActiveTab(item.name)}
                                    className={clsx(
                                        "relative px-5 py-2 text-sm font-medium transition-colors duration-300 rounded-full outline-none inline-block",
                                        activeTab === item.name
                                            ? "text-slate-900 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {/* The Flowing Pill (Framer Motion) */}
                                    {activeTab === item.name && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            style={{ zIndex: -1 }}
                                        />
                                    )}
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* --- RIGHT ACTIONS --- */}
                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    {/* Login removed as it is internal/hidden */}
                    <Link
                        href="/contact"
                        className="group flex items-center gap-2 bg-[#0B2F5B] hover:bg-[#0a254a] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md"
                    >
                        Partner Inquiry
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* --- MOBILE MENU BUTTON --- */}
                <button
                    className="md:hidden p-2 text-slate-600 dark:text-slate-300"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* --- MOBILE MENU (Simple Dropdown) --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white dark:bg-slate-950 pt-24 px-6 md:hidden">
                    <div className="flex flex-col gap-6 text-xl font-medium text-slate-800 dark:text-slate-100">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            className="text-[#2FBF71]"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Partner Inquiry
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}