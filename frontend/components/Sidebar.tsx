'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Cpu,
    GraduationCap,
    House,
    MessageSquareDot,
    Code2,
    Wifi,
    WifiOff,
} from 'lucide-react';
import type { BackendStatus } from '@/types';

interface SidebarItemProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    active: boolean;
    collapsed: boolean;
    href: string;
}

const SidebarItem = ({ icon: Icon, label, active, collapsed, href }: SidebarItemProps) => (
    <Link href={href} className="block">
        <div
            className={`relative mb-0.5 flex w-full items-center rounded-xl px-2.5 py-2 transition-all duration-150 ${
                active ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
            }`}
            style={active ? {
                background: 'linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(37,99,235,0.7) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px -4px rgba(124,58,237,0.5)',
            } : undefined}
        >
            {!active && (
                <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-150"
                    style={{ background: 'rgba(139,92,246,0.07)' }} />
            )}
            <div className="relative flex min-w-[20px] items-center justify-center shrink-0">
                <Icon size={16} />
            </div>
            <AnimatePresence>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: 'auto', marginLeft: 9 }}
                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                        transition={{ duration: 0.18 }}
                        className="relative overflow-hidden whitespace-nowrap text-left text-[13px] font-medium tracking-tight"
                        style={{ fontFamily: 'var(--font-sans)' }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    </Link>
);

interface SidebarProps {
    collapsed: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    backendStatus: BackendStatus;
}

export default function Sidebar({ collapsed, onMouseEnter, onMouseLeave, backendStatus }: SidebarProps) {
    const pathname = usePathname();

    const isHome = pathname === '/';
    const isStudy = pathname?.startsWith('/study') || false;
    const isAiHelper = pathname === '/ai-helper';
    const isAiPlayground = pathname === '/ai-playground';

    return (
        <motion.aside
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            animate={{ width: collapsed ? 64 : 232 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="fixed left-0 top-0 z-50 flex h-screen flex-col"
            style={{
                background: '#050505',
                borderRight: '1px solid rgba(139,92,246,0.1)',
                boxShadow: '2px 0 24px -4px rgba(0,0,0,0.6)',
            }}
        >
            {/* Logo */}
            <div className="flex h-14 items-center overflow-hidden px-3.5 shrink-0"
                style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)' }}>
                    <Cpu size={16} className="text-white" />
                    <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-black" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.18 }}
                            className="ml-3 overflow-hidden whitespace-nowrap"
                        >
                            <span className="text-sm font-bold tracking-tight text-white">
                                Q-<span style={{ color: '#22c55e' }}>Matrix</span>
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav */}
            <div className="custom-scrollbar flex-1 overflow-y-auto px-2 py-3 space-y-4">
                {/* Main */}
                <div className="space-y-0.5">
                    <SidebarItem icon={House} label="Home" active={isHome} collapsed={collapsed} href="/" />
                </div>

                {/* Learn section */}
                <div className="space-y-0.5">
                    {!collapsed && (
                        <p className="mb-1.5 px-2.5 text-[9px] font-semibold uppercase tracking-[0.32em]"
                            style={{ color: 'rgba(139,92,246,0.45)', fontFamily: 'monospace' }}>
                            ── Learn
                        </p>
                    )}
                    <SidebarItem icon={MessageSquareDot} label="AI Helper" active={isAiHelper} collapsed={collapsed} href="/ai-helper" />
                    <SidebarItem icon={GraduationCap} label="Study" active={isStudy} collapsed={collapsed} href="/study" />
                    <SidebarItem icon={Code2} label="AI Playground" active={isAiPlayground} collapsed={collapsed} href="/ai-playground" />
                </div>


            </div>

            {/* Status */}
            <div className="px-2 pb-2" style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}>


                {/* Profile */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="rounded-xl border px-3 py-2.5 mt-1"
                                style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.15)' }}>
                                <p className="text-[9px] font-mono uppercase tracking-widest mb-1.5"
                                    style={{ color: 'rgba(139,92,246,0.5)' }}>{"// built by"}</p>
                                <p className="text-[12px] font-bold text-white mb-1.5">Sudip Saud</p>
                                <div className="flex gap-2">
                                    <a href="https://github.com/SudipSaud" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold transition-all hover:scale-105"
                                        style={{ borderColor: 'rgba(139,92,246,0.25)', color: 'rgba(167,139,250,0.8)', background: 'rgba(139,92,246,0.08)' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                                        GitHub
                                    </a>
                                    <a href="https://www.linkedin.com/in/sudip-saud-7b5625247/" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold transition-all hover:scale-105"
                                        style={{ borderColor: 'rgba(6,182,212,0.25)', color: 'rgba(34,211,238,0.8)', background: 'rgba(6,182,212,0.06)' }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    );
}
