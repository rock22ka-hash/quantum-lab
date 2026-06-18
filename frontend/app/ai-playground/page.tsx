'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Wand2, CircuitBoard, Sparkles, Terminal,
    BookOpen, Layers, ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuantumBackdrop from '@/components/QuantumBackdrop';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { postAiPlayground, type GateOp, type PlaygroundResponse } from '@/lib/aiApi';
import GateListEditor from '@/components/GateListEditor';

const spring = { type: 'spring' as const, stiffness: 300, damping: 26 };

const EXAMPLE_PROMPTS = [
    'Create a Bell pair on two qubits',
    'Build a 3-qubit GHZ state',
    'Show single qubit superposition',
    'Make a quantum teleportation circuit',
    'Create a SWAP gate from CNOTs',
];

export default function AiPlaygroundPage() {
    const backendStatus = useBackendHealth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [result, setResult] = useState<PlaygroundResponse | null>(null);
    const [showExplanation, setShowExplanation] = useState(true);

    const generate = useCallback(async (customPrompt?: string) => {
        const p = customPrompt ?? prompt;
        if (!p.trim()) return;
        setErr(null);
        setLoading(true);
        if (customPrompt) setPrompt(customPrompt);
        try {
            const data = await postAiPlayground(p);
            setResult(data);
            setShowExplanation(true);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : 'Playground request failed');
        } finally {
            setLoading(false);
        }
    }, [prompt]);

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
                <div className="relative z-10 min-h-full pb-16">
                    <Header backendStatus={backendStatus} activeLabel="AI Playground" showShots={false} />

                    <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8 sm:py-10">
                        {/* Page Header */}
                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                            <div className="flex items-center gap-3 mb-5">
                                <Link href="/" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                                    style={{ color: 'rgba(34,197,94,0.7)' }}>
                                    <ChevronLeft size={13} /> Home
                                </Link>
                                <span style={{ color: 'rgba(34,197,94,0.3)' }}>·</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(34,197,94,0.7)' }}>
                                    AI Circuit Playground
                                </span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                                    <CircuitBoard size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>
                                        Quantum Circuit{' '}
                                        <span style={{
                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}>Playground</span>
                                    </h1>
                                    <p className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.55 }}>
                                        Describe a circuit in plain English → get gates, diagrams, and live Qiskit simulation
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Prompt Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...spring, delay: 0.05 }}
                            className="rounded-2xl p-5 sm:p-6"
                            style={{
                                background: 'var(--card)',
                                border: '1px solid var(--card-border)',
                                boxShadow: '0 4px 32px -8px rgba(34, 197, 94, 0.12)',
                            }}
                        >
                            {/* Example chips */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                {EXAMPLE_PROMPTS.map(p => (
                                    <button key={p} onClick={() => void generate(p)}
                                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                                        style={{
                                            borderColor: 'rgba(34,197,94,0.2)',
                                            color: '#22c55e',
                                            background: 'rgba(34,197,94,0.05)',
                                        }}>
                                        {p}
                                    </button>
                                ))}
                            </div>

                            {/* Prompt input */}
                            <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(34,197,94,0.7)' }}>
                                Describe your circuit
                            </label>
                            <div className="flex gap-3 items-end">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            void generate();
                                        }
                                    }}
                                    rows={2}
                                    placeholder="e.g. Create a Bell pair on two qubits, or build a 3-qubit GHZ state..."
                                    className="flex-1 resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition-all"
                                    style={{
                                        background: 'var(--background)',
                                        borderColor: prompt ? 'rgba(34,197,94,0.4)' : 'var(--card-border)',
                                        color: 'var(--foreground)',
                                        boxShadow: prompt ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => void generate()}
                                    disabled={loading || !prompt.trim()}
                                    className="flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 4px 20px -4px rgba(34,197,94,0.4)' }}
                                >
                                    {loading ? (
                                        <><Sparkles size={15} className="animate-pulse" /> Generating…</>
                                    ) : (
                                        <><Wand2 size={15} /> Generate</>
                                    )}
                                </button>
                            </div>

                            {err ? (
                                <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-500">
                                    <Info size={14} /> {err}
                                </p>
                            ) : null}
                        </motion.div>

                        {/* Results */}
                        <AnimatePresence>
                            {result ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={spring}
                                    className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
                                >
                                    {/* Left: Info Panel */}
                                    <div className="space-y-4">
                                        {/* Title + Explanation */}
                                        <div className="rounded-2xl p-5 sm:p-6"
                                            style={{
                                                background: 'var(--card)',
                                                border: '1px solid var(--card-border)',
                                                boxShadow: '0 4px 24px -8px rgba(124, 58, 237, 0.1)',
                                            }}>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 mb-2"
                                                        style={{ borderColor: 'rgba(219,39,119,0.2)', background: 'rgba(219,39,119,0.06)' }}>
                                                        <CircuitBoard size={10} style={{ color: '#db2777' }} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#db2777' }}>Circuit</span>
                                                    </div>
                                                    <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{result.title}</h2>
                                                </div>
                                                <button onClick={() => setShowExplanation(e => !e)}
                                                    className="flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 shrink-0"
                                                    style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)', opacity: 0.6 }}>
                                                    <BookOpen size={12} />
                                                    {showExplanation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {showExplanation && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                                                            {result.explanation}
                                                        </p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(124,58,237,0.7)' }}>
                                                            Gate Legend
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {result.legend.map((line, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground)', opacity: 0.65 }}>
                                                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#7c3aed' }} />
                                                                    {line}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* ASCII Circuit */}
                                        <div className="rounded-2xl overflow-hidden"
                                            style={{
                                                background: 'var(--card)',
                                                border: '1px solid var(--card-border)',
                                            }}>
                                            <div className="flex items-center gap-2 px-5 py-3"
                                                style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(13, 13, 38, 0.4)' }}>
                                                <Terminal size={13} style={{ color: '#22d3ee' }} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#22d3ee' }}>
                                                    ASCII Circuit
                                                </span>
                                                <div className="ml-auto flex gap-1.5">
                                                    {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                                                        <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <pre className="terminal-block overflow-x-auto p-5 text-xs leading-relaxed custom-scrollbar">
                                                {result.ascii_circuit}
                                            </pre>
                                        </div>

                                        {/* State summary */}
                                        <div className="flex items-start gap-3 rounded-xl border px-4 py-3"
                                            style={{ borderColor: 'rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.05)' }}>
                                            <Layers size={14} className="mt-0.5 shrink-0" style={{ color: '#06b6d4' }} />
                                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)', opacity: 0.75 }}>
                                                {result.state_summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Interactive Editor */}
                                    <div className="rounded-2xl p-5 sm:p-6"
                                        style={{
                                            background: 'var(--card)',
                                            border: '1px solid var(--card-border)',
                                            boxShadow: '0 4px 32px -8px rgba(34, 197, 94, 0.1)',
                                        }}>
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                                                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                                                <Wand2 size={14} className="text-white" />
                                            </div>
                                            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--foreground)' }}>
                                                Interactive Editor & Simulator
                                            </h3>
                                        </div>
                                        <GateListEditor
                                            key={result.title + result.gates.length}
                                            initialNQubits={result.n_qubits}
                                            initialGates={result.gates as GateOp[]}
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                /* Empty state */
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
                                    style={{
                                        background: 'var(--card)',
                                        border: '1px dashed var(--card-border)',
                                    }}
                                >
                                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl opacity-30"
                                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                                        <CircuitBoard size={32} className="text-white" />
                                    </div>
                                    <p className="text-base font-semibold" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
                                        Your circuit will appear here
                                    </p>
                                    <p className="mt-1 text-sm" style={{ color: 'var(--foreground)', opacity: 0.3 }}>
                                        Type a prompt or click one of the examples above
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
