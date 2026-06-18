'use client';

import { Moon, Sun, Zap, ChevronRight, FlaskConical, Lock, ChevronDown, Key } from 'lucide-react';
import type { BackendStatus, ExperimentConfig } from '@/types';
import { useTheme } from '@/components/ThemeProvider';
import { experiments } from '@/lib/constants';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
    backendStatus: BackendStatus;
    activeLabel: string;
    showShots?: boolean;
    shots?: number;
    onShotsChange?: (v: number) => void;
}

export default function Header({
    backendStatus,
    activeLabel,
    showShots = true,
    shots = 1024,
    onShotsChange = () => {},
}: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [experimentsOpen, setExperimentsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [apiKeyOpen, setApiKeyOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const apiKeyRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        setApiKey(localStorage.getItem('quantum_api_key') || '');

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setExperimentsOpen(false);
            }
            if (apiKeyRef.current && !apiKeyRef.current.contains(event.target as Node)) {
                setApiKeyOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const saveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('quantum_api_key', key);
    };

    const activeExpId = pathname?.startsWith('/experiment/') ? pathname.split('/experiment/')[1] : null;

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b px-5 sm:px-8 transition-colors duration-300"
            style={{
                background: isDark ? 'rgba(6, 6, 26, 0.85)' : 'rgba(245, 243, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderColor: isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(124, 58, 237, 0.1)',
                boxShadow: isDark
                    ? '0 1px 0 0 rgba(139, 92, 246, 0.08), 0 4px 24px -8px rgba(0,0,0,0.5)'
                    : '0 1px 0 0 rgba(124, 58, 237, 0.06), 0 4px 24px -8px rgba(124,58,237,0.06)',
            }}
        >
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${backendStatus === 'online' ? 'animate-ping bg-cyan-400' : 'bg-rose-500'}`} />
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${backendStatus === 'online' ? 'bg-cyan-400' : 'bg-rose-500'}`} />
                </span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500 sm:block">
                    {backendStatus}
                </span>
                <ChevronRight size={12} className="text-zinc-400 hidden sm:block shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest truncate"
                    style={{ color: isDark ? 'rgba(167, 139, 250, 0.9)' : 'rgba(109, 40, 217, 0.9)' }}>
                    {activeLabel}
                </span>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Experiments Dropdown */}
                <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                        onClick={() => setExperimentsOpen(!experimentsOpen)}
                        className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{
                            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
                            background: isDark ? 'rgba(13, 13, 38, 0.8)' : 'rgba(255,255,255,0.8)',
                            color: isDark ? '#a78bfa' : '#7c3aed',
                        }}
                    >
                        <FlaskConical size={14} />
                        Experiments
                        <ChevronDown size={14} className={`transition-transform ${experimentsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {experimentsOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-xl z-50"
                            style={{
                                borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
                                background: isDark ? '#0a0a16' : '#ffffff',
                            }}>
                            {experiments.map((exp: ExperimentConfig) => {
                                const isActive = activeExpId === exp.id;
                                const Icon = exp.status === 'WIP' ? Lock : FlaskConical;
                                return (
                                    <Link
                                        key={exp.id}
                                        href={`/experiment/${exp.id}`}
                                        onClick={() => setExperimentsOpen(false)}
                                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                                            isActive 
                                                ? (isDark ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-100 text-violet-700')
                                                : (isDark ? 'text-zinc-400 hover:bg-violet-900/20 hover:text-violet-300' : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-700')
                                        }`}
                                    >
                                        <Icon size={14} className={exp.status === 'WIP' ? 'opacity-50' : ''} />
                                        <span>{exp.name}</span>
                                        {exp.status === 'WIP' && (
                                            <span className="ml-auto text-[9px] uppercase tracking-widest opacity-50">WIP</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>


                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                    style={{
                        borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
                        background: isDark ? 'rgba(13, 13, 38, 0.8)' : 'rgba(255,255,255,0.8)',
                        color: isDark ? '#a78bfa' : '#7c3aed',
                    }}
                >
                    {isDark ? (
                        <Sun size={15} className="animate-spin-slow text-amber-400" />
                    ) : (
                        <Moon size={15} className="text-violet-600" />
                    )}
                    <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
                </button>

                {/* API Key Modal */}
                <div className="relative" ref={apiKeyRef}>
                    <button
                        onClick={() => setApiKeyOpen(!apiKeyOpen)}
                        aria-label="Set API Key"
                        className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                        style={{
                            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
                            background: apiKey ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)') : (isDark ? 'rgba(13, 13, 38, 0.8)' : 'rgba(255,255,255,0.8)'),
                            color: apiKey ? (isDark ? '#34d399' : '#059669') : (isDark ? '#a78bfa' : '#7c3aed'),
                        }}
                    >
                        <Key size={15} />
                    </button>
                    {apiKeyOpen && (
                        <div className="absolute right-0 mt-2 w-64 rounded-xl border p-4 shadow-xl z-50"
                            style={{
                                borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.15)',
                                background: isDark ? '#0a0a16' : '#ffffff',
                            }}>
                            <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                AI API Key (Groq or OpenAI)
                            </p>
                            <input 
                                type="password" 
                                placeholder="gsk_... or sk-..."
                                value={apiKey}
                                onChange={(e) => saveApiKey(e.target.value)}
                                className={`w-full rounded-md border p-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'}`}
                            />
                            <p className="mt-2 text-[10px] text-zinc-500">
                                Stored locally in your browser.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
