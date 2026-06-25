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
                                QUANTIX
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
                                <a 
                                    href="https://ada-lovelace.in/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-[11px] font-bold text-white transition-colors hover:text-purple-400"
                                >
                                    Ada Lovelace Software Private Limited
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    );
}
