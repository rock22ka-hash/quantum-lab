'use client';

import { motion } from 'framer-motion';

interface SkeletonChartProps {
    variant?: 'bar' | 'area';
    barCount?: number;
}

export default function SkeletonChart({ variant = 'bar', barCount = 6 }: SkeletonChartProps) {
    if (variant === 'area') {
        return (
            <div className="relative h-[420px] w-full flex flex-col justify-end px-8 pb-12">
                <div className="absolute bottom-20 left-8 top-12 flex flex-col justify-between">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-2 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                    ))}
                </div>

                <div className="ml-12 flex flex-1 items-end space-x-1">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-400/40 to-cyan-100/30 dark:from-cyan-500/30 dark:to-cyan-900/20"
                            initial={{ height: '10%' }}
                            animate={{ height: `${Math.random() * 60 + 20}%` }}
                            transition={{ duration: 0.5, delay: i * 0.03, repeat: Infinity, repeatType: 'reverse' }}
                            style={{ maxWidth: '20px' }}
                        />
                    ))}
                </div>

                <div className="ml-12 mt-4 h-px bg-slate-200 dark:bg-cyan-500/20" />
            </div>
        );
    }

    return (
        <div className="relative h-[420px] w-full flex flex-col justify-end px-8 pb-12">
            <div className="absolute bottom-20 left-8 top-12 flex flex-col justify-between">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-2 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                ))}
            </div>

            <div className="ml-12 flex flex-1 items-end justify-center space-x-6">
                {[...Array(barCount)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-16 rounded-t-2xl bg-gradient-to-t from-cyan-500/50 to-indigo-400/30 dark:from-cyan-400/40 dark:to-indigo-600/20"
                        initial={{ height: '20%' }}
                        animate={{ height: `${Math.random() * 50 + 30}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity, repeatType: 'reverse' }}
                    />
                ))}
            </div>

            <div className="ml-12 mt-4 h-px bg-slate-200 dark:bg-cyan-500/20" />
        </div>
    );
}
