'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CSSCube } from './ui/CSSCube';
import { Database, Shield, Cpu, Layers, Globe } from 'lucide-react';

export default function IsometricInfrastructure() {
    return (
        <div className="relative w-[500px] h-[500px] scale-75 md:scale-100">

            {/* Background Elements (Subtle Depth) */}
            <div className="absolute top-[25%] left-[5%] z-0">
                <CSSCube size={40} x="0" y="0" delay={0.1} color="white" noAnimation />
            </div>
            <div className="absolute top-[65%] left-[80%] z-0">
                <CSSCube size={30} x="0" y="0" delay={0.2} color="gray" noAnimation />
            </div>

            {/* Central Mainframe Cluster */}
            <div className="absolute top-[35%] left-[30%] z-20">
                <CSSCube size={120} x="0" y="0" delay={0} color="green" />

                {/* Floating Shield (Security Context) */}
                <motion.div
                    className="absolute -top-16 left-8 z-30 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800"
                    animate={{ y: [-5, -12, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Shield className="w-8 h-8 text-[#2FBF71]" />
                </motion.div>
            </div>

            {/* Connected Node (Right - Storage/Database) */}
            <div className="absolute top-[50%] left-[65%] z-15">
                <CSSCube size={80} x="0" y="0" delay={0.1} color="green" />
                {/* Floating Database Icon */}
                <motion.div
                    className="absolute -top-12 left-4 z-30 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800"
                    animate={{ y: [-3, -8, -3] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <Database className="w-6 h-6 text-[#2FBF71]" />
                </motion.div>
            </div>

            {/* Connected Node (Bottom Left - Network/API) */}
            <div className="absolute top-[60%] left-[10%] z-15">
                <CSSCube size={60} x="0" y="0" delay={0.2} color="green" />
                {/* Floating Globe Icon */}
                <motion.div
                    className="absolute -top-10 left-2 z-30 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800"
                    animate={{ y: [-2, -6, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <Globe className="w-5 h-5 text-[#2FBF71]" />
                </motion.div>
            </div>

            {/* Connection Lines (Animated Data Flow) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ transform: 'scale(1)' }}>
                {/* Line to Right Node */}
                <motion.path
                    d="M 280 250 L 380 300"
                    stroke="#2FBF71"
                    strokeWidth="3"
                    strokeOpacity="0.5"
                    strokeDasharray="8 8"
                    fill="none"
                    animate={{ strokeDashoffset: [0, -16] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                {/* Line to Bottom Left Node */}
                <motion.path
                    d="M 220 280 L 120 350"
                    stroke="#2FBF71"
                    strokeWidth="3"
                    strokeOpacity="0.5"
                    strokeDasharray="8 8"
                    fill="none"
                    animate={{ strokeDashoffset: [0, 16] }} // Reverse direction for visual variety
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </svg>

            {/* Glow / Ambient Light */}
            <div className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#2FBF71]/20 rounded-full blur-3xl -z-10" />

        </div>
    );
}
