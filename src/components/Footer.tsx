'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Server, Network } from 'lucide-react';
import { TravonexLogo } from './icons';

export default function Footer() {
    const pathname = usePathname();

    // Hide Footer on Dashboard pages
    if (pathname?.startsWith('/dashboard') || pathname === '/login') return null;

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-lg font-bold text-[#0B2F5B] dark:text-white">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <TravonexLogo className="w-16 h-16" />
                            </div>
                            Wanderlynx Labs
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                            Wanderlynx Labs builds shared infrastructure for modern travel platforms, including trust systems, payments, and operations.
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-[#0B2F5B] dark:text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link href="/about" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Platforms */}
                    <div>
                        <h4 className="font-semibold text-[#0B2F5B] dark:text-white mb-4">Platforms</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link href="/travonex" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Travonex
                                </Link>
                            </li>
                            <li>
                                <Link href="/trust" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Trust Engine
                                </Link>
                            </li>
                            <li>
                                <Link href="/network" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Ecosystem Overview
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-[#0B2F5B] dark:text-white mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li>
                                <Link href="/insights" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Articles
                                </Link>
                            </li>
                            <li>
                                <Link href="/insights" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Press
                                </Link>
                            </li>
                            <li>
                                <Link href="/insights" className="hover:text-[#2FBF71] dark:hover:text-[#2FBF71] transition-colors">
                                    Announcements
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} Wanderlynx Labs. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6 text-xs text-slate-400">
                        <Link href="/privacy" className="hover:text-[#0B2F5B] dark:hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-[#0B2F5B] dark:hover:text-white transition-colors">
                            Terms of Use
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
