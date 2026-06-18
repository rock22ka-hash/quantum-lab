'use client';

import { type Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const code = String(children).replace(/\n$/, '');
    const isDark = theme === 'dark';
    const prismStyle = isDark ? oneDark : oneLight;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-8 overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-cyan-500/20">
            <div className={`flex items-center justify-between border-b px-5 py-2.5 ${isDark ? 'border-white/10 bg-[#0f172a]' : 'border-slate-200 bg-slate-100'}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-green-400' : 'text-green-700'}`}>{language}</span>
                <button type="button" onClick={handleCopy} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                    {copied ? <><Check size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={prismStyle}
                customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: isDark ? '#020617' : '#f8fafc',
                    fontSize: '0.8rem',
                    lineHeight: '1.7',
                    borderRadius: 0,
                }}
                showLineNumbers
                lineNumberStyle={{ color: isDark ? '#475569' : '#94a3b8', fontSize: '0.7rem', minWidth: '2.5em' }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

function InlineCode({ children }: { children?: React.ReactNode }) {
    return (
        <code className="rounded-lg border border-green-200/80 bg-green-50 px-2 py-0.5 font-mono text-sm text-green-900 dark:border-green-500/30 dark:bg-green-950/50 dark:text-green-200">
            {children}
        </code>
    );
}

export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
    const headings: { id: string; text: string; level: number }[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
        const match = line.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            headings.push({ id, text, level });
        }
    }

    return headings;
}

export const markdownComponents: Components = {
    code({ className, children }) {
        const isBlock = /language-/.test(className || '') || String(children).includes('\n');
        if (isBlock) {
            return <CodeBlock className={className}>{children}</CodeBlock>;
        }
        return <InlineCode>{children}</InlineCode>;
    },

    pre({ children }) {
        return <>{children}</>;
    },

    h1({ children }) {
        const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
        return <h1 id={id} className="mb-10 mt-16 scroll-mt-32 text-4xl font-black tracking-tighter text-[#0a1d37] first:mt-0 dark:text-white sm:text-5xl">{children}</h1>;
    },
    h2({ children }) {
        const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
        return (
            <h2 id={id} className="mb-8 mt-20 scroll-mt-32 border-t border-slate-200 pt-10 text-3xl font-black tracking-tight text-[#0a1d37] dark:border-green-500/15 dark:text-white">
                <span className="mr-3 text-green-600 dark:text-green-400">#</span>{children}
            </h2>
        );
    },
    h3({ children }) {
        const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
        return <h3 id={id} className="mb-6 mt-14 scroll-mt-32 text-2xl font-black text-[#0a1d37] dark:text-white">{children}</h3>;
    },
    h4({ children }) {
        return <h4 className="mb-4 mt-10 text-lg font-black text-slate-800 dark:text-slate-200">{children}</h4>;
    },

    p({ children }) {
        return <p className="mb-6 text-base leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>;
    },

    ul({ children }) {
        return <ul className="mb-8 ml-6 space-y-3">{children}</ul>;
    },
    ol({ children }) {
        return <ol className="mb-8 ml-6 list-decimal space-y-3">{children}</ol>;
    },
    li({ children }) {
        return <li className="relative pl-4 leading-relaxed text-slate-700 before:absolute before:left-0 before:text-cyan-600 before:content-['•'] dark:text-slate-300 dark:before:text-cyan-400">{children}</li>;
    },

    a({ href, children }) {
        return (
            <a href={href} className="text-cyan-700 underline underline-offset-4 transition-colors hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-200">
                {children}
            </a>
        );
    },

    blockquote({ children }) {
        return (
            <blockquote className="my-8 rounded-r-xl border-l-4 border-green-500 bg-gradient-to-r from-green-50/90 to-transparent py-2 pl-6 text-slate-700 dark:border-green-400 dark:from-green-950/40 dark:text-slate-300">
                {children}
            </blockquote>
        );
    },

    hr() {
        return <hr className="my-12 border-slate-200 dark:border-green-500/15" />;
    },

    table({ children }) {
        return (
            <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200 shadow-sm dark:border-cyan-500/20">
                <table className="w-full text-left">{children}</table>
            </div>
        );
    },
    thead({ children }) {
        return <thead className="bg-slate-50 dark:bg-[#0a1628]/90">{children}</thead>;
    },
    th({ children }) {
        return <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-cyan-400/80">{children}</th>;
    },
    td({ children }) {
        return <td className="border-t border-slate-100 px-6 py-4 text-sm text-slate-700 dark:border-cyan-500/10 dark:text-slate-300">{children}</td>;
    },
};
