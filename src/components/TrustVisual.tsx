'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Lock, FileCheck } from 'lucide-react';

export default function TrustVisual() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">

            {/* Radar / Pulse Effect Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute border border-[#2FBF71]/30 rounded-full"
                        style={{ width: i * 150, height: i * 150 }}
                        animate={{
                            opacity: [0, 0.5, 0],
                            scale: [0.8, 1.2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Central Shield Card */}
            <motion.div
                className="relative z-20 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-[#2FBF71] blur-2xl opacity-20" />
                    <Shield className="w-24 h-24 text-[#2FBF71] relative z-10" strokeWidth={1.5} />
                    <motion.div
                        className="absolute inset-0 border-2 border-[#2FBF71] rounded-full"
                        animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
                <div className="text-center">
                    <div className="text-white font-bold text-xl">Verified Entity</div>
                    <div className="text-[#2FBF71] text-sm font-mono mt-1">ID: WL-8842-X</div>
                </div>
            </motion.div>

            {/* Floating Orbiting Badges - FIXED RADIUS & ROTATION */}
            <OrbitingBadge
                icon={<Lock className="w-5 h-5 text-blue-200" />}
                label="Escrow"
                angle={0}
                radius={240}
                delay={0}
            />
            <OrbitingBadge
                icon={<FileCheck className="w-5 h-5 text-green-200" />}
                label="KYB Passed"
                angle={120}
                radius={240}
                delay={1}
            />
            <OrbitingBadge
                icon={<CheckCircle2 className="w-5 h-5 text-purple-200" />}
                label="Dispute Free"
                angle={240}
                radius={240}
                delay={2}
            />

        </div>
    );
}

function OrbitingBadge({ icon, label, angle, radius, delay }: { icon: any, label: string, angle: number, radius: number, delay: number }) {
    return (
        <motion.div
            className="absolute z-10 flex items-center justify-center"
            initial={{ rotate: angle }}
            animate={{ rotate: angle + 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ width: radius * 2, height: radius * 2 }}
        >
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl"
                initial={{ rotate: -angle }}
                animate={{ rotate: -angle - 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
                {icon}
                <span className="text-xs font-bold text-white whitespace-nowrap">{label}</span>
            </motion.div>
        </motion.div>
    );
}
