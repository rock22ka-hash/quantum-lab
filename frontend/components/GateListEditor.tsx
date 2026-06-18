'use client';

import { useCallback, useState } from 'react';
import type { GateOp } from '@/lib/aiApi';
import { postAiSimulate } from '@/lib/aiApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import BlochSphere from '@/components/BlochSphere';
import { Trash2, Play, Plus, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Gate color map
const GATE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
    H:  { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd', label: 'H' },
    X:  { bg: '#3b1a1a', border: '#ef4444', text: '#fca5a5', label: 'X' },
    Y:  { bg: '#2d1b47', border: '#a855f7', text: '#d8b4fe', label: 'Y' },
    Z:  { bg: '#1a2e1a', border: '#22c55e', text: '#86efac', label: 'Z' },
    RX: { bg: '#1e2d3d', border: '#06b6d4', text: '#67e8f9', label: 'Rₓ' },
    RY: { bg: '#1e2d3d', border: '#0ea5e9', text: '#7dd3fc', label: 'Rᵧ' },
    RZ: { bg: '#1e2d3d', border: '#8b5cf6', text: '#c4b5fd', label: 'R_z' },
    CX: { bg: '#1a2e1a', border: '#10b981', text: '#6ee7b7', label: 'CX' },
    CZ: { bg: '#1a1a2e', border: '#6366f1', text: '#a5b4fc', label: 'CZ' },
    I:  { bg: '#1a1a1a', border: '#52525b', text: '#a1a1aa', label: 'I' },
};

const PALETTE: { op: GateOp['op']; desc: string }[] = [
    { op: 'H',  desc: 'Hadamard' },
    { op: 'X',  desc: 'Pauli-X' },
    { op: 'Y',  desc: 'Pauli-Y' },
    { op: 'Z',  desc: 'Pauli-Z' },
    { op: 'RX', desc: 'Rot X' },
    { op: 'CX', desc: 'CNOT' },
    { op: 'CZ', desc: 'CZ' },
];

const WIRE_HEIGHT = 64; // px per qubit row
const GATE_W = 52;
const GATE_H = 36;
const LABEL_W = 40;
const COL_W = 68;

export default function GateListEditor({
    initialNQubits,
    initialGates,
}: {
    initialNQubits: number;
    initialGates: GateOp[];
}) {
    const [nQubits, setNQubits] = useState(initialNQubits);
    const [gates, setGates] = useState<GateOp[]>(() =>
        initialGates.map((g) => ({ ...g, targets: [...g.targets], params: g.params ? [...g.params] : [] }))
    );
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [probs, setProbs] = useState<Record<string, number> | null>(null);
    const [bloch, setBloch] = useState<{ theta: number; phi: number } | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [simLoading, setSimLoading] = useState(false);

    const runSim = useCallback(async () => {
        setErr(null);
        setSimLoading(true);
        try {
            const res = await postAiSimulate(nQubits, gates);
            setProbs(res.probabilities);
            setBloch(res.bloch);
            setSummary(res.state_summary);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : 'Simulation failed');
        } finally {
            setSimLoading(false);
        }
    }, [gates, nQubits]);

    const addGate = (op: GateOp['op']) => {
        if (op === 'CX' || op === 'CZ') {
            if (nQubits < 2) setNQubits(2);
            setGates((g) => [...g, { op, targets: [0, 1] }]);
        } else {
            setGates((g) => [...g, { op, targets: [0] }]);
        }
    };

    const removeAt = (i: number) => setGates((g) => g.filter((_, j) => j !== i));

    const onDragStart = (i: number) => setDragIdx(i);
    const onDragOver = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === i) return;
        setGates((g) => {
            const next = [...g];
            const [moved] = next.splice(dragIdx, 1);
            next.splice(i, 0, moved);
            return next;
        });
        setDragIdx(i);
    };
    const onDrop = () => setDragIdx(null);

    const chartData = probs
        ? Object.entries(probs)
              .map(([name, value]) => ({ name, value }))
              .filter((d) => d.value > 1e-6)
              .sort((a, b) => b.value - a.value)
              .slice(0, 16)
        : [];

    const totalW = LABEL_W + gates.length * COL_W + 40;
    const totalH = nQubits * WIRE_HEIGHT;

    return (
        <div className="space-y-5">
            {/* Top controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' }}>
                {/* Qubit count */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(167,139,250,0.7)' }}>Qubits</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                            <button key={n} onClick={() => {
                                setNQubits(n);
                                setGates((g) => g.filter((x) => x.targets.every((t) => t < n)));
                            }}
                                className="h-7 w-7 rounded-lg text-xs font-bold transition-all hover:scale-110"
                                style={{
                                    background: nQubits === n ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.05)',
                                    color: nQubits === n ? '#fff' : 'rgba(167,139,250,0.6)',
                                    border: `1px solid ${nQubits === n ? 'transparent' : 'rgba(34,197,94,0.2)'}`,
                                }}
                            >{n}</button>
                        ))}
                    </div>
                </div>

                {/* Run button */}
                <button onClick={() => void runSim()} disabled={simLoading || gates.length === 0}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 4px 16px -4px rgba(34,197,94,0.4)' }}>
                    {simLoading ? <Cpu size={13} className="animate-pulse" /> : <Play size={13} fill="currentColor" />}
                    {simLoading ? 'Simulating…' : 'Run Simulation'}
                </button>
            </div>

            {/* Gate palette */}
            <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(139,92,246,0.6)' }}>Gate Palette — click to add</p>
                <div className="flex flex-wrap gap-2">
                    {PALETTE.map((p) => {
                        const s = GATE_STYLES[p.op];
                        return (
                            <button key={p.op} onClick={() => addGate(p.op)}
                                className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105"
                                style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                                <Plus size={10} strokeWidth={3} />
                                <span className="font-mono">{s.label}</span>
                                <span className="opacity-60">{p.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Circuit board */}
            <div className="overflow-x-auto rounded-xl custom-scrollbar"
                style={{ background: '#051005', border: '1px solid rgba(34,197,94,0.25)', boxShadow: 'inset 0 0 20px rgba(34,197,94,0.05)' }}>
                <div style={{ minWidth: `${Math.max(totalW, 320)}px`, padding: '20px 16px' }}>
                    {/* SVG circuit */}
                    <svg
                        width="100%"
                        viewBox={`0 0 ${Math.max(totalW, 320)} ${Math.max(totalH, WIRE_HEIGHT)}`}
                        style={{ overflow: 'visible', display: 'block' }}
                    >
                        {/* Qubit rows */}
                        {Array.from({ length: nQubits }).map((_, qi) => {
                            const cy = qi * WIRE_HEIGHT + WIRE_HEIGHT / 2;
                            return (
                                <g key={qi}>
                                    {/* |0⟩ label */}
                                    <rect x={0} y={cy - 14} width={LABEL_W - 4} height={28} rx={6}
                                        fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth={1} />
                                    <text x={LABEL_W / 2 - 2} y={cy + 5} textAnchor="middle"
                                        fill="#4ade80" fontSize={12} fontWeight={700} fontFamily="monospace">
                                        |0⟩
                                    </text>
                                    {/* Wire */}
                                    <line
                                        x1={LABEL_W}
                                        y1={cy}
                                        x2={totalW - 20}
                                        y2={cy}
                                        stroke="rgba(34,197,94,0.4)"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 2"
                                    />
                                    {/* Qubit label q₀ */}
                                    <text x={-8} y={cy + 5} textAnchor="end"
                                        fill="rgba(34,197,94,0.5)" fontSize={9} fontFamily="monospace">
                                        q{qi}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Gates */}
                        {gates.map((g, gi) => {
                            const s = GATE_STYLES[g.op] ?? GATE_STYLES['I'];
                            const isMulti = g.targets.length > 1;
                            const x = LABEL_W + gi * COL_W + (COL_W - GATE_W) / 2;

                            if (isMulti && (g.op === 'CX' || g.op === 'CZ')) {
                                const ctrl = g.targets[0];
                                const tgt = g.targets[1];
                                const cy1 = ctrl * WIRE_HEIGHT + WIRE_HEIGHT / 2;
                                const cy2 = tgt * WIRE_HEIGHT + WIRE_HEIGHT / 2;
                                const midX = x + GATE_W / 2;

                                return (
                                    <g key={gi} style={{ cursor: 'grab' }}
                                        {...({ draggable: true } as any)} onDragStart={() => onDragStart(gi)}
                                        onDragOver={(e) => onDragOver(e, gi)} onDragEnd={onDrop}>
                                        {/* Vertical connector */}
                                        <line x1={midX} y1={cy1} x2={midX} y2={cy2}
                                            stroke={s.border} strokeWidth={2} />
                                        {/* Control dot */}
                                        <circle cx={midX} cy={cy1} r={6}
                                            fill={s.border} />
                                        {/* Target symbol */}
                                        {g.op === 'CX' ? (
                                            <g>
                                                <circle cx={midX} cy={cy2} r={14}
                                                    fill={s.bg} stroke={s.border} strokeWidth={1.5} />
                                                <text x={midX} y={cy2 + 5} textAnchor="middle"
                                                    fill={s.text} fontSize={16} fontWeight={800} fontFamily="monospace">⊕</text>
                                            </g>
                                        ) : (
                                            <g>
                                                <circle cx={midX} cy={cy2} r={14}
                                                    fill={s.bg} stroke={s.border} strokeWidth={1.5} />
                                                <text x={midX} y={cy2 + 4} textAnchor="middle"
                                                    fill={s.text} fontSize={11} fontWeight={700} fontFamily="monospace">CZ</text>
                                            </g>
                                        )}
                                        {/* Delete button */}
                                        <g onClick={() => removeAt(gi)} style={{ cursor: 'pointer' }}>
                                            <circle cx={x + GATE_W} cy={Math.min(cy1, cy2) - 8} r={8}
                                                fill="#ef4444" opacity={0.85} />
                                            <text x={x + GATE_W} y={Math.min(cy1, cy2) - 4} textAnchor="middle"
                                                fill="white" fontSize={10} fontWeight={900}>×</text>
                                        </g>
                                    </g>
                                );
                            }

                            const qi = g.targets[0] ?? 0;
                            const cy = qi * WIRE_HEIGHT + WIRE_HEIGHT / 2;

                            return (
                                <g key={gi} style={{ cursor: 'grab' }}
                                    {...({ draggable: true } as any)} onDragStart={() => onDragStart(gi)}
                                    onDragOver={(e) => onDragOver(e, gi)} onDragEnd={onDrop}>
                                    <rect x={x} y={cy - GATE_H / 2} width={GATE_W} height={GATE_H} rx={7}
                                        fill={s.bg} stroke={s.border} strokeWidth={1.5}
                                        style={{ filter: dragIdx === gi ? `drop-shadow(0 0 6px ${s.border})` : 'none' }} />
                                    <text x={x + GATE_W / 2} y={cy + 5} textAnchor="middle"
                                        fill={s.text} fontSize={12} fontWeight={800} fontFamily="monospace">
                                        {s.label}
                                    </text>
                                    {g.params && g.params.length > 0 && (
                                        <text x={x + GATE_W / 2} y={cy + GATE_H / 2 + 12} textAnchor="middle"
                                            fill="rgba(167,139,250,0.5)" fontSize={8} fontFamily="monospace">
                                            {g.params[0].toFixed(2)}
                                        </text>
                                    )}
                                    {/* Delete */}
                                    <g onClick={() => removeAt(gi)} style={{ cursor: 'pointer' }}>
                                        <circle cx={x + GATE_W} cy={cy - GATE_H / 2} r={7}
                                            fill="#ef4444" opacity={0.9} />
                                        <text x={x + GATE_W} y={cy - GATE_H / 2 + 4} textAnchor="middle"
                                            fill="white" fontSize={9} fontWeight={900}>×</text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* Empty state */}
                        {gates.length === 0 && (
                            <text x={LABEL_W + 60} y={WIRE_HEIGHT / 2 + 5} fill="rgba(139,92,246,0.3)"
                                fontSize={12} fontFamily="monospace">
                                ← add gates from palette above
                            </text>
                        )}
                    </svg>

                    {/* Gate list (drag hint) */}
                    {gates.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3" style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
                            <AnimatePresence>
                                {gates.map((g, i) => {
                                    const s = GATE_STYLES[g.op] ?? GATE_STYLES['I'];
                                    return (
                                        <motion.div key={`${i}-${g.op}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-mono font-bold cursor-grab"
                                            style={{ background: s.bg, borderColor: s.border, color: s.text }}
                                            draggable
                                            onDragStart={() => onDragStart(i)}
                                            onDragOver={(e) => onDragOver(e, i)}
                                            onDragEnd={onDrop}>
                                            {s.label}
                                            <span style={{ color: 'rgba(255,255,255,0.4)' }}>q{g.targets.join(',')}</span>
                                            <button onClick={() => removeAt(i)}
                                                className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
                                                <Trash2 size={9} />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {err ? <p className="text-sm text-rose-400">{err}</p> : null}

            {/* Results */}
            {probs && chartData.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`grid gap-4 ${nQubits === 1 && bloch ? 'xl:grid-cols-[1fr_200px]' : 'grid-cols-1'}`}
                >
                    <div className="rounded-xl p-4"
                        style={{ background: '#080808', border: '1px solid rgba(6,182,212,0.2)' }}>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#22d3ee' }}>
                            Measurement Probabilities
                        </p>
                        <div style={{ height: '180px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4ade80" />
                                            <stop offset="100%" stopColor="#16a34a" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(34,197,94,0.1)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#4ade80', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(34,197,94,0.08)' }}
                                        contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}
                                        formatter={(v: any) => [`${(Number(v) * 100).toFixed(1)}%`, 'Prob']}
                                    />
                                    <Bar dataKey="value" fill="url(#probGrad)" radius={[4, 4, 0, 0]} maxBarSize={44} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {nQubits === 1 && bloch && (
                        <div className="flex flex-col items-center rounded-xl p-4"
                            style={{ background: '#080808', border: '1px solid rgba(167,139,250,0.2)' }}>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                                Bloch State
                            </p>
                            <BlochSphere theta={bloch.theta} phi={bloch.phi} size={150} />
                        </div>
                    )}
                </motion.div>
            ) : null}

            {summary ? (
                <div className="rounded-lg border-l-2 px-4 py-2.5 text-sm font-medium"
                    style={{ borderColor: '#7c3aed', background: 'rgba(124,58,237,0.06)', color: 'rgba(167,139,250,0.8)' }}>
                    💡 {summary}
                </div>
            ) : null}
        </div>
    );
}
