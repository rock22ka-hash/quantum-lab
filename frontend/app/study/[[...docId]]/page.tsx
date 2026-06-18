'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, ChevronLeft, Clock, ArrowUp, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { markdownComponents, extractHeadings } from '@/components/MarkdownRenderer';
import { docFiles } from '@/lib/constants';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuantumBackdrop from '@/components/QuantumBackdrop';
import { useBackendHealth } from '@/hooks/useBackendHealth';

function TableOfContents({ headings, activeId }: { headings: { id: string; text: string; level: number }[]; activeId: string }) {
    return (
        <nav className="sticky top-32 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-green-500/50 mb-6 flex items-center gap-2">
                <Hash size={12} /> On This Page
            </p>
            {headings.map(h => (
                <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-sm py-1.5 transition-all border-l-2 ${activeId === h.id
                        ? 'border-green-600 font-bold text-green-800 dark:border-green-400 dark:text-green-200'
                        : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:text-green-100/55 dark:hover:border-green-500/30 dark:hover:text-green-50'
                        }`}
                    style={{ paddingLeft: `${(h.level - 1) * 16 + 16}px` }}
                >
                    {h.text}
                </a>
            ))}
        </nav>
    );
}

function ProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const main = document.querySelector('main');
            if (!main) return;
            const scrollTop = main.scrollTop;
            const scrollHeight = main.scrollHeight - main.clientHeight;
            setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
        };

        const main = document.querySelector('main');
        main?.addEventListener('scroll', handleScroll);
        return () => main?.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
            <motion.div
                className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 shadow-[0_0_20px_rgba(34,197,94,0.35)] dark:shadow-[0_0_24px_rgba(34,197,94,0.25)]"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
            />
        </div>
    );
}

interface StudyPageProps {
    params: Promise<{ docId?: string[] }>;
}

export default function StudyPage({ params }: StudyPageProps) {
    const [docId, setDocId] = useState<string | null>(null);
    const backendStatus = useBackendHealth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [shots, setShots] = useState(1024);
    const [docContent, setDocContent] = useState('');
    const [activeHeadingId, setActiveHeadingId] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setDocId(resolvedParams?.docId?.[0] || null);
        };
        getParams();
    }, [params]);

    useEffect(() => {
        if (docId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDocContent('');
            fetch(`/docs/${docId}`)
                .then(res => res.text())
                .then(text => setDocContent(text))
                .catch(() => setDocContent('# Failed to load\n\nCould not load this document.'));
        }
    }, [docId]);

    useEffect(() => {
        if (!docId || !docContent) return;

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveHeadingId(entry.target.id);
                    }
                }
            },
            { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
        );

        const timer = setTimeout(() => {
            const headingEls = contentRef.current?.querySelectorAll('h1[id], h2[id], h3[id]');
            headingEls?.forEach(el => observer.observe(el));
        }, 300);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [docId, docContent]);

    const scrollToTop = useCallback(() => {
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const currentDocIndex = docFiles.findIndex((d) => d.id === docId);
    const prevDoc = currentDocIndex > 0 ? docFiles[currentDocIndex - 1] : null;
    const nextDoc = currentDocIndex < docFiles.length - 1 ? docFiles[currentDocIndex + 1] : null;

    const headings = docContent ? extractHeadings(docContent) : [];

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
                    activeLabel="study"
                    shots={shots}
                    onShotsChange={setShots}
                />

                <div className="p-8 sm:p-12 max-w-7xl mx-auto">
                    <motion.div key="study" initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ type: 'spring' as const, stiffness: 280, damping: 24 }} className="space-y-12">
                        {docId ? (
                            <>
                                <ProgressBar />

                                <div className="mb-12 space-y-6">
                                    <Link href="/study" className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-green-700 dark:text-green-500/60 dark:hover:text-green-300">
                                        <ChevronLeft size={16} /> Back to Modules
                                    </Link>
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-2xl border border-green-200/80 bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-green-700 dark:border-green-500/25 dark:from-green-950/50 dark:to-emerald-950/40 dark:text-green-300">
                                            <BookOpen size={24} />
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-black tracking-tight text-[#051005] dark:text-white">
                                                {docFiles.find((d) => d.id === docId)?.title || 'Document'}
                                            </h1>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                    <Clock size={10} /> {docFiles.find((d) => d.id === docId)?.time || '–'}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-green-700 dark:text-green-400">
                                                    {docFiles.find((d) => d.id === docId)?.level || '–'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-12">
                                    <div className="lg:col-span-3">
                                        <div ref={contentRef} className="prose prose-lg max-w-none prose-slate dark:prose-invert">
                                            {docContent ? (
                                                <ReactMarkdown
                                                    components={markdownComponents}
                                                    remarkPlugins={[remarkMath, remarkGfm]}
                                                    rehypePlugins={[rehypeKatex]}
                                                >
                                                    {docContent}
                                                </ReactMarkdown>
                                            ) : (
                                                <div className="space-y-4 animate-pulse">
                                                    <div className="h-8 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                                                    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                                                    <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                                                    <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-20 flex items-center justify-between border-t border-slate-200 pt-10 dark:border-green-500/15">
                                            {prevDoc ? (
                                                <Link href={`/study/${prevDoc.id}`} className="group flex items-center gap-3 text-left">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 transition-colors group-hover:border-green-300 group-hover:bg-green-50 dark:border-green-500/20 dark:bg-[#051005] dark:group-hover:border-green-400/40 dark:group-hover:bg-green-500/10">
                                                        <ChevronLeft size={20} className="text-slate-500 group-hover:text-green-700 dark:text-green-400/70 dark:group-hover:text-green-300" />
                                                    </div>
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-green-500/50">Previous</p>
                                                        <p className="text-sm font-bold text-[#051005] transition-colors group-hover:text-green-700 dark:text-white dark:group-hover:text-green-300">{prevDoc.title}</p>
                                                    </div>
                                                </Link>
                                            ) : <div />}

                                            <button type="button" onClick={scrollToTop} className="group rounded-2xl border border-slate-200 bg-slate-100 p-4 transition-colors hover:border-green-300 hover:bg-green-50 dark:border-green-500/20 dark:bg-[#051005] dark:hover:border-green-400/40 dark:hover:bg-green-500/10">
                                                <ArrowUp size={20} className="text-slate-500 group-hover:text-green-700 dark:text-green-400/70 dark:group-hover:text-green-300" />
                                            </button>

                                            {nextDoc ? (
                                                <Link href={`/study/${nextDoc.id}`} className="group flex items-center gap-3 text-right">
                                                    <div>
                                                        <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-green-500/50">Next</p>
                                                        <p className="text-sm font-bold text-[#051005] transition-colors group-hover:text-green-700 dark:text-white dark:group-hover:text-green-300">{nextDoc.title}</p>
                                                    </div>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 transition-colors group-hover:border-green-300 group-hover:bg-green-50 dark:border-green-500/20 dark:bg-[#051005] dark:group-hover:border-green-400/40 dark:group-hover:bg-green-500/10">
                                                        <ChevronRight size={20} className="text-slate-500 group-hover:text-green-700 dark:text-green-400/70 dark:group-hover:text-green-300" />
                                                    </div>
                                                </Link>
                                            ) : <div />}
                                        </div>
                                    </div>

                                    <div className="hidden lg:block">
                                        <TableOfContents headings={headings} activeId={activeHeadingId} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-12">
                                <div className="rounded-[2.5rem] border border-slate-200/90 bg-white/95 p-10 shadow-lg backdrop-blur-sm dark:border-green-500/15 dark:bg-[#051005]/85 sm:p-12">
                                    <h2 className="mb-4 text-4xl font-black tracking-tight text-[#051005] dark:text-white">Quantum Computing Curriculum</h2>
                                    <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-400">Master quantum computing through our comprehensive learning path. From basics to advanced algorithms.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {docFiles.map((doc, index) => (
                                        <Link key={doc.id} href={`/study/${doc.id}`}>
                                            <div className="group rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-md backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-green-400/50 hover:shadow-xl dark:border-green-500/15 dark:bg-[#051005]/80 dark:hover:border-green-400/35 dark:hover:shadow-[0_20px_50px_-20px_rgba(34,197,94,0.15)]">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-green-500/45">Module {String(index + 1).padStart(2, '0')}</span>
                                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${doc.level === 'Beginner' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300' : doc.level === 'Intermediate' ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200' : 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-200'}`}>
                                                        {doc.level}
                                                    </span>
                                                </div>
                                                <h3 className="mb-3 text-xl font-bold text-[#051005] transition-colors group-hover:text-green-700 dark:text-white dark:group-hover:text-green-300">{doc.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
                                                        <Clock size={12} /> {doc.time}
                                                    </span>
                                                    <ChevronRight size={16} className="ml-auto text-slate-400 transition-colors group-hover:text-green-600 dark:text-green-500/50 dark:group-hover:text-green-400" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
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
