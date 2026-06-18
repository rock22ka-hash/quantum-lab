'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Bot, CircuitBoard, ArrowRight, AlertCircle, Terminal, Zap, Binary } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuantumBackdrop from '@/components/QuantumBackdrop';
import { useBackendHealth } from '@/hooks/useBackendHealth';

const spring = { type: 'spring' as const, stiffness: 300, damping: 26 };

const tiles = [
    {
        href: '/ai-helper',
        title: 'Neural AI Tutor',
        subtitle: 'Llama 3.3 70B',
        body: 'Interface directly with an advanced AI trained on quantum mechanics. Ask questions, generate code, and decode the matrix.',
        icon: Bot,
        accentFrom: '#22c55e',
        accentTo: '#15803d',
        glowColor: 'rgba(34, 197, 94, 0.25)',
        chipColor: 'rgba(34, 197, 94, 0.1)',
        chipText: '#22c55e',
        stat: 'Online',
        statIcon: Zap,
    },
    {
        href: '/study',
        title: 'The Archives',
        subtitle: 'Curriculum',
        body: 'Access classified modules detailing the mechanics of qubits, entanglement, and advanced quantum algorithms. Knowledge is power.',
        icon: BookOpen,
        accentFrom: '#10b981',
        accentTo: '#047857',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        chipColor: 'rgba(16, 185, 129, 0.1)',
        chipText: '#10b981',
        stat: '5 Data Nodes',
        statIcon: Binary,
    },
    {
        href: '/ai-playground',
        title: 'Circuit Composer',
        subtitle: 'Live Simulation',
        body: 'Construct and simulate quantum circuits in real-time. Drag and drop gates onto the PCB and watch the statevector collapse.',
        icon: CircuitBoard,
        accentFrom: '#06b6d4',
        accentTo: '#0369a1',
        glowColor: 'rgba(6, 182, 212, 0.25)',
        chipColor: 'rgba(6, 182, 212, 0.1)',
        chipText: '#06b6d4',
        stat: 'Zero Latency',
        statIcon: Terminal,
    },
] as const;

export default function HomePage() {
    const backendStatus = useBackendHealth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onMouseEnter={() => setSidebarCollapsed(false)}
                onMouseLeave={() => setSidebarCollapsed(true)}
                backendStatus={backendStatus}
            />

            <main
                className="relative flex-1 overflow-y-auto transition-all duration-300"
                style={{ marginLeft: sidebarCollapsed ? '68px' : '240px' }}
            >
                <QuantumBackdrop />
                <div className="relative z-10 min-h-full">
                    <Header backendStatus={backendStatus} activeLabel="SYSTEM TERMINAL" />

                    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-20">
                        {backendStatus === 'offline' ? (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-10 flex items-center gap-3 rounded-2xl border px-5 py-4"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.06)',
                                    borderColor: 'rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                }}
                            >
                                <AlertCircle className="shrink-0" size={18} />
                                <p className="text-sm">
                                    CRITICAL ERROR: Mainframe offline. Reconnect `NEXT_PUBLIC_API_URL`.
                                </p>
                            </motion.div>
                        ) : null}

                        {/* Hero Section */}
                        <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="mb-16 relative">
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#22c55e]/30"
                                    style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                    <Terminal size={18} className="text-[#22c55e]" />
                                </motion.div>
                                <span className="text-xs font-mono font-bold uppercase tracking-[0.4em]" style={{ color: '#22c55e' }}>
                                    System Status: Online
                                </span>
                            </div>
                            
                            {mounted && (
                                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-tight mb-6"
                                    style={{ color: 'var(--foreground)' }}>
                                    <motion.span 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="block"
                                    >
                                        HACK THE
                                    </motion.span>
                                    <motion.span 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="block text-transparent bg-clip-text"
                                        style={{ backgroundImage: 'linear-gradient(to right, #4ade80, #16a34a)' }}
                                    >
                                        QUANTUM REALM.
                                    </motion.span>
                                </h1>
                            )}

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.6 }}
                                className="max-w-2xl text-lg font-mono leading-relaxed" 
                                style={{ color: 'rgba(var(--foreground), 0.6)', opacity: 0.7 }}
                            >
                                {`$> Accessing the Q-Matrix...`}
                                <br/>
                                {`$> Simulating qubits in real-time...`}
                                <br/>
                                {`$> You are now connected to the most advanced quantum learning terminal.`}
                            </motion.p>
                        </motion.header>

                        {/* Interactive Nodes */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {tiles.map((tile, i) => (
                                <motion.div
                                    key={tile.href}
                                    initial={{ opacity: 0, y: 28 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...spring, delay: 0.8 + (i * 0.1) }}
                                >
                                    <Link href={tile.href} className="group block h-full">
                                        <article
                                            className="relative flex h-full flex-col overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2"
                                            style={{
                                                background: 'var(--card)',
                                                border: '1px solid var(--card-border)',
                                                boxShadow: `0 8px 32px -12px ${tile.glowColor}`,
                                            }}
                                        >
                                            <div
                                                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-50"
                                                style={{ background: `radial-gradient(circle, ${tile.accentFrom}, transparent)` }}
                                            />

                                            <div
                                                className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg border border-white/10"
                                                style={{ background: `linear-gradient(135deg, ${tile.accentFrom} 0%, ${tile.accentTo} 100%)` }}
                                            >
                                                <tile.icon size={24} />
                                            </div>

                                            <div className="mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 w-fit border"
                                                style={{ background: tile.chipColor, borderColor: `${tile.chipText}40` }}>
                                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: tile.chipText }}>
                                                    {tile.subtitle}
                                                </span>
                                            </div>

                                            <h2 className="mb-3 text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                                                {tile.title}
                                            </h2>
                                            <p className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                                                {tile.body}
                                            </p>

                                            <div className="mt-8 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
                                                <div className="flex items-center gap-2">
                                                    <tile.statIcon size={14} style={{ color: tile.chipText }} />
                                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: tile.chipText, opacity: 0.8 }}>
                                                        {tile.stat}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5"
                                                    style={{ color: tile.chipText }}>
                                                    EXECUTE <ArrowRight size={14} />
                                                </span>
                                            </div>
                                        </article>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* System Specs */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="mt-16 flex flex-wrap items-center justify-center gap-8 rounded-2xl border px-8 py-5"
                            style={{
                                background: 'rgba(34, 197, 94, 0.03)',
                                borderColor: 'rgba(34, 197, 94, 0.15)',
                            }}
                        >
                            {[
                                { label: 'Qiskit Engine', color: '#22c55e' },
                                { label: 'Groq Llama 3.3', color: '#10b981' },
                                { label: 'Statevector Sim', color: '#06b6d4' },
                                { label: 'Encrypted Link', color: '#3b82f6' },
                            ].map((badge) => (
                                <div key={badge.label} className="flex items-center gap-2.5">
                                    <div className="relative flex h-2 w-2 items-center justify-center">
                                        <div className="absolute h-full w-full rounded-full animate-ping opacity-50" style={{ background: badge.color }} />
                                        <div className="relative h-1.5 w-1.5 rounded-full" style={{ background: badge.color }} />
                                    </div>
                                    <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                                        {badge.label}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
