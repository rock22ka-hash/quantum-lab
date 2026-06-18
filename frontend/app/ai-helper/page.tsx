'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Send, Bot, Sparkles, User, BarChart2,
    Maximize2, Minimize2, Atom, Copy, Check,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuantumBackdrop from '@/components/QuantumBackdrop';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { postAiChat, type ChatMessage } from '@/lib/aiApi';

const spring = { type: 'spring' as const, stiffness: 320, damping: 28 };

const SUGGESTIONS = [
    'Explain quantum entanglement',
    'How does VQE work?',
    'Show me a Bell state circuit',
    'What are barren plateaus?',
    'Visualize qubit superposition',
];

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/10" title="Copy">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
    );
}

function TypingIndicator() {
    return (
        <div className="flex items-end gap-3 msg-ai">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}>
                <Atom size={16} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5"
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 2px 12px -4px rgba(34, 197, 94, 0.15)',
                }}>
                <span className="typing-dot h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
                <span className="typing-dot h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
                <span className="typing-dot h-2 w-2 rounded-full" style={{ background: '#22c55e' }} />
            </div>
        </div>
    );
}

export default function AiHelperPage() {
    const backendStatus = useBackendHealth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content:
                '👋 Hi! I\'m your **Q-Matrix AI** tutor powered by Llama 3.3 70B.\n\nI can help you with:\n- **Quantum circuits** and gate operations\n- **VQE** and variational algorithms\n- **Quantum ML** concepts (kernels, barren plateaus)\n- **Bloch sphere** state visualization\n- Reading measurement histograms\n\nAsk me anything, or pick a suggestion below!',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const msgRefs = useRef<(HTMLDivElement | null)[]>([]);
    const prevMsgCount = useRef(0);

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        const added = messages.length > prevMsgCount.current;
        prevMsgCount.current = messages.length;

        if (!added) return;

        if (lastMsg?.role === 'assistant' && !loading) {
            // Scroll to the BEGINNING of the new AI message
            const lastRef = msgRefs.current[messages.length - 1];
            if (lastRef) {
                lastRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // For user messages or while loading → scroll to bottom to show indicator
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages, loading]);

    const send = useCallback(async (text?: string) => {
        const t = (text ?? input).trim();
        if (!t || loading) return;
        setErr(null);
        setInput('');
        const nextMsgs: ChatMessage[] = [...messages, { role: 'user', content: t }];
        setMessages(nextMsgs);
        setLoading(true);
        try {
            const res = await postAiChat(nextMsgs.map(m => ({ role: m.role, content: m.content })));
            setMessages([
                ...nextMsgs,
                {
                    role: 'assistant',
                    content: res.reply,
                    chart: res.chart?.labels && res.chart.values ? { labels: res.chart.labels, values: res.chart.values.map(Number) } : null,
                    bloch: res.bloch && typeof res.bloch.theta === 'number' ? { theta: res.bloch.theta, phi: res.bloch.phi ?? 0 } : null,
                },
            ]);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Request failed';
            setErr(msg);
            setMessages([...nextMsgs, { role: 'assistant', content: `⚠️ Could not reach the AI API (${msg}). Check your NEXT_PUBLIC_API_URL and backend CORS settings.` }]);
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages]);

    const chatContent = (
        <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--card-border)' }}>
                <div className="flex items-center gap-3">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}>
                        <Atom size={18} className="text-white animate-spin-slow" />
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)] bg-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Q-Matrix AI</p>
                        <p className="text-[10px] font-medium" style={{ color: '#22c55e', opacity: 0.8 }}>Llama 3.3 70B • Quantum Expert</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ borderColor: 'rgba(124,58,237,0.2)', color: '#7c3aed', background: 'rgba(124,58,237,0.06)' }}>
                        <Sparkles size={10} className="animate-pulse" /> AI Powered
                    </div>
                    <button onClick={() => setExpanded(e => !e)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl transition-all hover:scale-110"
                        style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}
                        title={expanded ? 'Minimize' : 'Expand'}>
                        {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5 space-y-5">
                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            ref={(el) => { msgRefs.current[i] = el; }}
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={spring}
                            className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            {m.role === 'user' ? (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm"
                                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}>
                                    <User size={15} />
                                </div>
                            ) : (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}>
                                    <Bot size={15} className="text-white" />
                                </div>
                            )}

                            {/* Bubble */}
                            <div className={`group max-w-[82%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                                <div
                                    className={`relative rounded-2xl px-5 py-4 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                                    style={m.role === 'user' ? {
                                        background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                                        color: '#fff',
                                        boxShadow: '0 4px 20px -4px rgba(34, 197, 94, 0.4)',
                                    } : {
                                        background: 'linear-gradient(to right, rgba(34,197,94,0.05), var(--card))',
                                        border: '1px solid var(--card-border)',
                                        borderLeft: '4px solid #22c55e',
                                        color: 'var(--foreground)',
                                        boxShadow: '0 8px 32px -4px rgba(34, 197, 94, 0.15)',
                                    }}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="absolute right-2 top-2 flex items-center gap-1">
                                            <CopyButton text={m.content} />
                                        </div>
                                    )}
                                    {m.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none dark:prose-invert pr-6"
                                            style={{ '--tw-prose-body': 'var(--foreground)', '--tw-prose-headings': 'var(--foreground)' } as React.CSSProperties}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{m.content}</p>
                                    )}
                                </div>


                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && <TypingIndicator />}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
                <div className="px-5 pb-3 flex gap-2 flex-wrap">
                    {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => void send(s)}
                            className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 hover:shadow-md"
                            style={{
                                borderColor: 'rgba(34,197,94,0.2)',
                                color: '#22c55e',
                                background: 'rgba(34,197,94,0.05)',
                            }}>
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Bar */}
            <div className="shrink-0 px-4 pb-4 pt-3"
                style={{ borderTop: '1px solid var(--card-border)', background: 'var(--card)' }}>
                {err ? (
                    <p className="mb-2 px-1 text-xs font-medium text-rose-500">{err}</p>
                ) : null}
                <div className="flex items-end gap-3">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                void send();
                            }
                        }}
                        rows={1}
                        placeholder="Ask about quantum computing... (Enter to send, Shift+Enter for new line)"
                        className="flex-1 resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition-all"
                        style={{
                            background: 'var(--background)',
                            borderColor: input ? 'rgba(34,197,94,0.4)' : 'var(--card-border)',
                            color: 'var(--foreground)',
                            minHeight: '46px',
                            maxHeight: '140px',
                            boxShadow: input ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => void send()}
                        disabled={loading || !input.trim()}
                        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)' }}
                        aria-label="Send"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="mt-2 text-center text-[9px] font-medium uppercase tracking-widest" style={{ color: 'var(--foreground)', opacity: 0.3 }}>
                    Q-Matrix AI • Llama 3.3 70B on Groq
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onMouseEnter={() => setSidebarCollapsed(false)}
                onMouseLeave={() => setSidebarCollapsed(true)}
                backendStatus={backendStatus}
            />

            <main
                className="relative flex-1 overflow-hidden transition-all duration-300"
                style={{ marginLeft: sidebarCollapsed ? '68px' : '240px' }}
            >
                <QuantumBackdrop />
                <div className="relative z-10 flex flex-col h-full">
                    <Header backendStatus={backendStatus} activeLabel="AI Helper" showShots={false} />

                    <div className="flex-1 overflow-hidden px-4 py-5 sm:px-8 sm:py-6">
                        <div className="mx-auto h-full max-w-4xl flex flex-col gap-5">
                            {/* Page title */}
                            {!expanded && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="flex items-center gap-4 shrink-0">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:opacity-80"
                                        style={{ color: 'rgba(124,58,237,0.6)' }}
                                    >
                                        <ChevronLeft size={13} /> Home
                                    </Link>
                                    <span style={{ color: 'rgba(124,58,237,0.3)' }}>·</span>
                                    <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                                        AI Learning Assistant
                                    </h1>
                                </motion.div>
                            )}

                            {/* Chat window */}
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ ...spring, delay: 0.05 }}
                                className="flex-1 overflow-hidden rounded-2xl"
                                style={{
                                    background: 'var(--card)',
                                    border: '1px solid var(--card-border)',
                                    boxShadow: '0 8px 40px -12px rgba(124, 58, 237, 0.18)',
                                    minHeight: 0,
                                }}
                            >
                                {chatContent}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
