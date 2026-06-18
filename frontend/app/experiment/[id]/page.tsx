'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Zap, Activity, ChevronLeft, Sparkles, BarChart3,
    Image as ImageIcon, AlertCircle, Rocket, Flame,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, Cell,
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import SkeletonChart from '@/components/SkeletonChart';
import QuantumBackdrop from '@/components/QuantumBackdrop';
import { experiments } from '@/lib/constants';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useExperiment } from '@/hooks/useExperiment';
import { useTheme } from '@/components/ThemeProvider';

const AREA_CHART_IDS = new Set(['vqe-h2', 'vqc', 'vqe-sweep', 'barren-plateaus']);

const AREA_COLORS: Record<string, string> = {
    'vqe-h2': '#22c55e',
    'vqc': '#f97316',
    'vqe-sweep': '#14b8a6',
    'barren-plateaus': '#e879f9',
};

const pageEnter = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
    },
};

export default function ExperimentPage() {
    const params = useParams();
    const id = params.id as string;
    const { theme } = useTheme();
    const backendStatus = useBackendHealth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [shots, setShots] = useState(1024);
    const [noiseEnabled, setNoiseEnabled] = useState(false);
    const { result, loading, errorMsg, progress, liveChart, run, reset } = useExperiment();

    const exp = experiments.find((e) => e.id === id);

    useEffect(() => { reset(); }, [id, reset]);

    const chartTooltipStyle = useMemo(
        () =>
            theme === 'dark'
                ? {
                    backgroundColor: '#0a1d37',
                    border: '1px solid rgba(34, 211, 238, 0.25)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)',
                }
                : {
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#0a1d37',
                    boxShadow: '0 10px 30px -6px rgb(0 0 0 / 0.12)',
                },
        [theme],
    );

    const gridStroke = theme === 'dark' ? '#1e3a4f' : '#e2e8f0';
    const axisStroke = theme === 'dark' ? '#94a3b8' : '#64748b';
    const dotStroke = theme === 'dark' ? '#0a1d37' : '#ffffff';

    if (!exp) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: 'var(--background)' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <h1 className="mb-4 text-4xl font-black text-[#0a1d37] dark:text-white">Experiment Not Found</h1>
                    <Link href="/" className="font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">Back to home</Link>
                </motion.div>
            </div>
        );
    }

    const loadingText = id === 'vqe-sweep' ? 'Computing Energy Surface...'
        : id === 'barren-plateaus' ? 'Sampling Gradients...'
            : id === 'vqe-h2' ? 'Training...'
                : id === 'vqc' ? 'Training Classifier...'
                    : 'Simulating...';

    const areaColor = AREA_COLORS[id] || '#06b6d4';

    return (
        <div className="flex h-screen overflow-hidden font-sans transition-colors duration-300" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onMouseEnter={() => setSidebarCollapsed(false)}
                onMouseLeave={() => setSidebarCollapsed(true)}
                backendStatus={backendStatus}
            />

            <main
                className="relative flex-1 overflow-y-auto transition-all duration-300"
                style={{ marginLeft: sidebarCollapsed ? '64px' : '232px' }}
            >
                <QuantumBackdrop />
                <div className="relative z-10 min-h-full">
                    <Header
                        backendStatus={backendStatus}
                        activeLabel="experiment"
                        shots={shots}
                        onShotsChange={setShots}
                    />

                    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={pageEnter}
                            className="space-y-10"
                        >
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-4">
                                    <Link href="/" className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-emerald-700 dark:text-zinc-500 dark:hover:text-emerald-400">
                                        <ChevronLeft size={14} /> Back to home
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <h2 className="text-4xl font-black tracking-tighter text-[#0a1d37] dark:text-white sm:text-5xl">{exp.name}</h2>
                                        {result?.noise && (
                                            <span className="flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-900 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200">
                                                <Flame size={12} className="motion-safe:animate-pulse" /> Noisy
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {exp.status !== 'WIP' && (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setNoiseEnabled(!noiseEnabled)}
                                            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 font-black text-[10px] uppercase tracking-widest transition-all sm:px-5 ${noiseEnabled
                                                ? 'border-amber-400/50 bg-amber-500/15 text-amber-900 shadow-[0_0_20px_-4px_rgba(245,158,11,0.4)] dark:text-amber-200'
                                                : 'border-slate-200 bg-white/90 text-slate-600 dark:border-cyan-500/25 dark:bg-[#0a1d37]/80 dark:text-cyan-200/80'
                                                }`}
                                        >
                                            {noiseEnabled ? <Flame size={14} className="motion-safe:animate-pulse" /> : <Zap size={14} className="text-cyan-500" />}
                                            <span className="hidden sm:inline">{noiseEnabled ? 'Noise on' : 'Ideal'}</span>
                                            <span className={`relative ml-1 h-4 w-8 rounded-full ${noiseEnabled ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${noiseEnabled ? 'left-4' : 'left-0.5'}`} />
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => run(exp.id, shots, noiseEnabled)}
                                            disabled={loading || backendStatus === 'offline'}
                                            className={`flex shrink-0 items-center space-x-3 rounded-2xl px-8 py-4 font-black uppercase tracking-widest shadow-lg transition-all sm:space-x-4 sm:px-10 ${backendStatus === 'offline' ? 'cursor-not-allowed bg-slate-300 text-slate-500 dark:bg-slate-700' : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-cyan-500/25 hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-400/40 motion-safe:active:scale-[0.98] dark:shadow-[0_0_32px_-6px_rgba(34,211,238,0.35)]'}`}
                                        >
                                            {loading ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
                                            <span className="text-xs sm:text-sm">{loading ? loadingText : (backendStatus === 'offline' ? 'Offline' : 'Run Protocol')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6 rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-900 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-100">
                                    <AlertCircle size={32} className="shrink-0 text-rose-600 dark:text-rose-400" />
                                    <div>
                                        <h4 className="mb-2 text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">Execution Error</h4>
                                        <p className="text-lg font-medium">{errorMsg}</p>
                                        <p className="mt-4 text-xs opacity-80">Check the backend logs for trace details.</p>
                                    </div>
                                </motion.div>
                            )}

                            {exp.status === 'WIP' ? (
                                <div className="relative space-y-8 overflow-hidden rounded-[3rem] border border-slate-200 bg-white/95 p-24 text-center shadow-lg dark:border-cyan-500/15 dark:bg-[#0a1d37]/90 sm:p-32">
                                    <Rocket size={100} className="mx-auto motion-safe:animate-pulse text-orange-500" />
                                    <h3 className="text-4xl font-black text-[#0a1d37] dark:text-white">Coming Soon</h3>
                                    <p className="mx-auto max-w-lg text-xl text-slate-600 dark:text-slate-400">This experiment is under active development.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-12">
                                    <div className="space-y-10 lg:col-span-3">
                                        {result?.theory && (
                                            <div className={`flex gap-8 rounded-[2.5rem] border p-10 shadow-md backdrop-blur-sm sm:p-12 ${result.noise ? 'border-amber-300/60 bg-amber-50/90 dark:border-amber-400/25 dark:bg-amber-500/10' : 'border-cyan-200/80 bg-gradient-to-br from-cyan-50/90 to-indigo-50/80 dark:border-cyan-500/20 dark:from-cyan-950/40 dark:to-indigo-950/30'}`}>
                                                <Sparkles className={`h-9 w-9 shrink-0 ${result.noise ? 'text-amber-600 dark:text-amber-400' : 'text-cyan-600 dark:text-cyan-400'}`} size={36} />
                                                <div>
                                                    <h4 className={`mb-4 text-xs font-black uppercase tracking-[0.4em] ${result.noise ? 'text-amber-800 dark:text-amber-300' : 'text-cyan-800 dark:text-cyan-300'}`}>Quantum Knowledge Base</h4>
                                                    <p className="text-lg font-medium italic leading-relaxed text-slate-800 dark:text-slate-200 sm:text-xl">&ldquo;{result.theory}&rdquo;</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative rounded-[2.5rem] border border-slate-200/90 bg-white/95 p-10 shadow-xl backdrop-blur-md dark:border-cyan-500/15 dark:bg-[#0a1d37]/85 sm:p-12">
                                            {loading && (
                                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-6 rounded-[2.5rem] bg-white/80 backdrop-blur-md dark:bg-[#080808]/75">
                                                    {progress != null ? (
                                                        <>
                                                            <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                                                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
                                                            </div>
                                                            <p className="text-xs font-black uppercase tracking-[0.5em] text-cyan-700 dark:text-cyan-300">
                                                                Epoch {Math.round(progress * (Math.floor(Math.min(shots / 20, 100)) || 15))}/{Math.floor(Math.min(shots / 20, 100)) || 15}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-20 w-20 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                                                            <p className="text-xs font-black uppercase tracking-[0.5em] motion-safe:animate-pulse text-slate-600 dark:text-cyan-200/70">{loadingText}</p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <h3 className="mb-10 flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-slate-500 dark:text-cyan-500/60">
                                                <BarChart3 size={20} className="text-cyan-600 dark:text-cyan-400" />
                                                {id === 'vqe-sweep' ? 'Potential Energy Surface' : id === 'barren-plateaus' ? 'Gradient Variance vs Depth' : 'Statistical Amplitude Distribution'}
                                            </h3>
                                            <div className="min-h-[400px] w-full">
                                                {(result?.chartData || liveChart.length > 0) ? (
                                                    <ResponsiveContainer width="100%" height={420}>
                                                        {AREA_CHART_IDS.has(id) ? (
                                                            <AreaChart data={result?.chartData || liveChart}>
                                                                <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={areaColor} stopOpacity={0.3} /><stop offset="95%" stopColor={areaColor} stopOpacity={0} /></linearGradient></defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                                                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} axisLine={false} tickLine={false} />
                                                                <YAxis stroke={axisStroke} fontSize={11} axisLine={false} tickLine={false} />
                                                                <Tooltip contentStyle={chartTooltipStyle} />
                                                                <Area type="monotone" dataKey="value" stroke={areaColor} strokeWidth={3} fill="url(#colorVal)" dot={{ r: 5, fill: areaColor, strokeWidth: 2, stroke: dotStroke }} />
                                                            </AreaChart>
                                                        ) : (
                                                            <BarChart data={result?.chartData || []}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                                                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} hide={id === 'qrng-8bit'} axisLine={false} tickLine={false} />
                                                                <YAxis stroke={axisStroke} fontSize={11} axisLine={false} tickLine={false} />
                                                                <Tooltip contentStyle={chartTooltipStyle} />
                                                                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={id === 'qrng-8bit' ? 2 : 120}>
                                                                    {(result?.chartData || []).map((_, i) => <Cell key={`c-${i}`} fill={i % 2 === 0 ? '#06b6d4' : '#6366f1'} />)}
                                                                </Bar>
                                                            </BarChart>
                                                        )}
                                                    </ResponsiveContainer>
                                                ) : (
                                                    <SkeletonChart variant={AREA_CHART_IDS.has(id) ? 'area' : 'bar'} barCount={id === 'qrng-8bit' ? 16 : 6} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-[2.5rem] border border-slate-200/90 bg-white/95 p-8 shadow-lg backdrop-blur-sm dark:border-cyan-500/15 dark:bg-[#0a1d37]/85 sm:p-10">
                                            <h3 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.4em] text-slate-500 dark:text-cyan-500/60">
                                                <ImageIcon size={18} className="text-cyan-600 dark:text-cyan-400" /> Circuit
                                            </h3>
                                            {result?.circuit ? (
                                                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-[#061225] shadow-inner dark:border-cyan-500/25">
                                                    <pre
                                                        className="m-0 select-all whitespace-pre p-6 font-mono leading-snug tracking-wide text-cyan-100 sm:p-8"
                                                        style={{ fontSize: 'clamp(0.8rem, 1.35vw, 1.125rem)', minWidth: 'min(100%, 42rem)' }}
                                                    >
                                                        {result.circuit}
                                                    </pre>
                                                </div>
                                            ) : (
                                                <div className="flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center dark:border-cyan-500/20 dark:bg-[#061225]/50">
                                                    <Sparkles size={36} className="mb-4 text-slate-400 dark:text-cyan-500/40" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cyan-500/50">Run the experiment to view the circuit</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="rounded-[2rem] border border-slate-200/90 bg-white/95 p-8 shadow-lg backdrop-blur-sm dark:border-cyan-500/15 dark:bg-[#0a1d37]/90 sm:p-10">
                                            <h3 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-400">System Status</h3>
                                            <div className="space-y-6">
                                                {[{ l: 'Simulator', v: 'Aer 0.17' }, { l: 'Architecture', v: 'Statevector' }, { l: 'Compiler', v: 'Level 3' }].map(i => (
                                                    <div key={i.l} className="flex flex-col gap-2 border-b border-slate-100 pb-5 last:border-0 dark:border-cyan-500/10">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-cyan-500/50">{i.l}</span>
                                                        <span className="text-xs font-black text-[#0a1d37] dark:text-white">{i.v}</span>
                                                    </div>
                                                ))}
                                                {result?.finalEnergy && <div className="pt-4"><p className="mb-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Ground State Potential</p><p className="text-4xl font-black tracking-tighter text-[#0a1d37] dark:text-white">{result.finalEnergy.toFixed(5)} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ha</span></p></div>}
                                                {result?.finalAccuracy != null && <div className="pt-4"><p className="mb-2 text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Classification Accuracy</p><p className="text-4xl font-black tracking-tighter text-[#0a1d37] dark:text-white">{(result.finalAccuracy * 100).toFixed(1)}<span className="text-xs font-bold text-slate-500 dark:text-slate-400">%</span></p></div>}
                                                {result?.equilibriumDistance != null && (
                                                    <div className="space-y-4 pt-4">
                                                        <div><p className="mb-2 text-[9px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">Equilibrium Distance</p><p className="text-3xl font-black tracking-tighter text-[#0a1d37] dark:text-white">{result.equilibriumDistance.toFixed(1)} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Å</span></p></div>
                                                        <div><p className="mb-2 text-[9px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">Min Energy</p><p className="text-2xl font-black tracking-tighter text-[#0a1d37] dark:text-white">{result.equilibriumEnergy?.toFixed(5)} <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ha</span></p></div>
                                                    </div>
                                                )}
                                                {result?.noise && (
                                                    <div className="pt-4">
                                                        <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-400/30 dark:bg-amber-500/10">
                                                            <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-300">Noise Model</p>
                                                            <p className="text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">Depolarizing: 1% (1q) / 2% (2q)</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
