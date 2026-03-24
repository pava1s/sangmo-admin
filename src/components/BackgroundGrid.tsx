'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

export default function BackgroundGrid() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        function handleMouseMove({ clientX, clientY }: MouseEvent) {
            mouseX.set(clientX);
            mouseY.set(clientY);
        }

        // Also handle touch move for mobile glow
        function handleTouchMove(e: TouchEvent) {
            if (e.touches.length > 0) {
                mouseX.set(e.touches[0].clientX);
                mouseY.set(e.touches[0].clientY);
            }
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* 0. Base Background Layer - MOVED HERE */}
            <div className="absolute inset-0 bg-white dark:bg-slate-950 transition-colors duration-300" />

            {/* 1. Base Dot Pattern (Subtle) */}
            <div
                className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]"
                style={{
                    backgroundImage: `radial-gradient(#2FBF71 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* 2. Interactive Glow Layer */}
            <motion.div
                className="absolute inset-0 opacity-20 dark:opacity-20 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(47, 191, 113, 0.4),
              transparent 80%
            )
          `,
                }}
            />
        </div>
    );
}
