'use client';

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type CSSCubeProps = {
    size?: number;
    x?: string;
    y?: string;
    z?: number;
    delay?: number;
    className?: string;
    color?: 'green' | 'white' | 'gray';
    noAnimation?: boolean;
};

export const CSSCube = ({
    size = 60,
    x = '0',
    y = '0',
    z = 0,
    delay = 0,
    className,
    color = 'green',
    noAnimation = false
}: CSSCubeProps) => {

    const getFaceTransform = (face: string, size: number) => {
        const half = size / 2;
        switch (face) {
            case 'front': return `rotateY(0deg) translateZ(${half}px)`;
            case 'back': return `rotateY(180deg) translateZ(${half}px)`;
            case 'right': return `rotateY(90deg) translateZ(${half}px)`;
            case 'left': return `rotateY(-90deg) translateZ(${half}px)`;
            case 'top': return `rotateX(90deg) translateZ(${half}px)`;
            case 'bottom': return `rotateX(-90deg) translateZ(${half}px)`;
            default: return '';
        }
    };

    // Color schemes matching Brand Identity - MODERN VIBRANT
    const getColorScheme = (face: string) => {
        // 1. BRAND GREEN (The Core Infrastructure)
        if (color === 'green') {
            if (face === 'top') return 'bg-[#4AE38C]'; // Highlight
            if (face === 'front' || face === 'right') return 'bg-[#2FBF71]'; // Main Body
            if (face === 'back' || face === 'left') return 'bg-[#25A962]'; // Shadow
            return 'bg-[#25A962]';
        }

        // 2. BRAND TINTED WHITE (Subtle Infrastructure) - Replaces Slate/Blue with Emerald/Green Tint
        if (color === 'white') {
            if (face === 'top') return 'bg-[#ECFDF5] dark:bg-[#064E3B]'; // emerald-50 / emerald-900
            if (face === 'front' || face === 'right') return 'bg-[#D1FAE5] dark:bg-[#065F46]'; // emerald-100 / emerald-800
            if (face === 'back' || face === 'left') return 'bg-[#A7F3D0] dark:bg-[#047857]'; // emerald-200 / emerald-700
            return 'bg-[#D1FAE5]';
        }

        // 3. BRAND TINTED GRAY (Deep Infrastructure)
        if (face === 'top') return 'bg-[#6EE7B7] dark:bg-[#065f46]'; // emerald-300
        if (face === 'front' || face === 'right') return 'bg-[#34D399] dark:bg-[#047857]'; // emerald-400
        return 'bg-[#10B981] dark:bg-[#064e3b]'; // emerald-500
    };

    const WrapperComponent = noAnimation ? 'div' : motion.div;
    const wrapperProps = noAnimation ? {} : {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1.5, delay, ease: [0.6, 0.05, 0.01, 0.9] as any }
    };

    return (
        <WrapperComponent
            {...wrapperProps}
            className={clsx("absolute perspective-1000 z-0 pointer-events-none", className)}
            style={{ top: y, left: x, transform: `translateZ(${z}px)` }}
        >
            <div className={clsx("relative w-full h-full transform-style-3d", !noAnimation && "animate-float")}>
                <div
                    className={clsx("relative transform-style-3d", !noAnimation && "animate-spin-slow")}
                    style={{ width: size, height: size }}
                >
                    {/* Faces */}
                    {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
                        <div
                            key={face}
                            className={clsx(
                                "absolute transition-colors duration-500",
                                getColorScheme(face)
                            )}
                            style={{
                                width: size,
                                height: size,
                                transform: getFaceTransform(face, size),
                                boxShadow: face === 'top' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                            }}
                        />
                    ))}
                </div>
            </div>
        </WrapperComponent>
    );
};
