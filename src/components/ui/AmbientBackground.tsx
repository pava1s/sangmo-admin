'use client';

import React, { useEffect, useRef } from 'react';

const DOT_SIZE = 3;
const DOT_SPACING = 36;
const INTERACTION_RADIUS = 200;
const REPEL_FORCE = 0.7;
const IDLE_SPEED = 0.001;
const IDLE_AMPLITUDE = 1.5;

class Dot {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    phase: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
        this.phase = (x / window.innerWidth) * Math.PI * 2 + (y / window.innerHeight) * Math.PI * 2;
    }

    update(mouseX: number, mouseY: number, isHovering: boolean, time: number) {
        const idleX = Math.sin(time * IDLE_SPEED + this.phase) * IDLE_AMPLITUDE;
        const idleY = Math.cos(time * IDLE_SPEED + this.phase) * IDLE_AMPLITUDE;

        let targetX = this.baseX + idleX;
        let targetY = this.baseY + idleY;

        if (isHovering) {
            const dx = mouseX - this.baseX;
            const dy = mouseY - this.baseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < INTERACTION_RADIUS) {
                const force = Math.pow((INTERACTION_RADIUS - dist) / INTERACTION_RADIUS, 2);
                targetX -= (dx / dist) * force * INTERACTION_RADIUS * REPEL_FORCE;
                targetY -= (dy / dist) * force * INTERACTION_RADIUS * REPEL_FORCE;
            }
        }

        this.vx += (targetX - this.x) * 0.04;
        this.vy += (targetY - this.y) * 0.04;

        this.vx *= 0.75;
        this.vy *= 0.75;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D, mouseX: number, mouseY: number, isHovering: boolean, isDark: boolean) {
        let dist = Infinity;
        if (isHovering) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            dist = Math.sqrt(dx * dx + dy * dy);
        }

        let intensity = 0;
        if (isHovering && dist < INTERACTION_RADIUS) {
            intensity = Math.pow(1 - (dist / INTERACTION_RADIUS), 1.5);
        }

        const currentSize = DOT_SIZE + (intensity * 2);

        // Base color vs hover color
        // Base: moderately visible green. Hover: bright solid green
        const baseAlpha = isDark ? 0.3 : 0.4;
        const hoverMaxAlpha = 1.0;
        const currentAlpha = baseAlpha + (intensity * (hoverMaxAlpha - baseAlpha));

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(47, 191, 113, ${currentAlpha})`;

        if (intensity > 0.1) {
            ctx.shadowBlur = intensity * 10;
            ctx.shadowColor = `rgba(47, 191, 113, ${currentAlpha * 0.5})`;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

export default function AmbientBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let dots: Dot[] = [];
        let animationFrameId: number;
        let mouseX = -1000;
        let mouseY = -1000;
        let isHovering = false;
        let isDark = document.documentElement.classList.contains('dark');

        const initDots = () => {
            dots = [];
            const spacing = window.innerWidth < 768 ? DOT_SPACING * 1.5 : DOT_SPACING;

            const cols = Math.ceil(width / spacing) + 2;
            const rows = Math.ceil(height / spacing) + 2;

            const offsetX = (width - (cols * spacing)) / 2;
            const offsetY = (height - (rows * spacing)) / 2;

            for (let i = -1; i <= cols; i++) {
                for (let j = -1; j <= rows; j++) {
                    dots.push(new Dot(offsetX + i * spacing, offsetY + j * spacing));
                }
            }
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initDots();
        };

        resize();

        const observer = new MutationObserver(() => {
            isDark = document.documentElement.classList.contains('dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isHovering = true;
        };

        const handleMouseLeave = () => {
            isHovering = false;
        };

        const animate = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < dots.length; i++) {
                dots[i].update(mouseX, mouseY, isHovering, time);
                dots[i].draw(ctx, mouseX, mouseY, isHovering, isDark);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-white dark:bg-[#030712] transition-colors duration-500">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 dark:from-[#030712]/50 to-transparent pointer-events-none" />
        </div>
    );
}
