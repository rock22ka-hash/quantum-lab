'use client';

import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen items-center justify-center bg-[#dfe3e8] p-8 dark:bg-[#080808]">
                    <div className="max-w-lg space-y-6 rounded-[2.5rem] border border-red-200 bg-red-50 p-12 text-center shadow-lg dark:border-rose-400/30 dark:bg-rose-500/10">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle size={40} className="text-red-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Something went wrong</h2>
                        <p className="text-slate-600 dark:text-rose-100/80">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-sky-500 transition-all flex items-center gap-3 mx-auto shadow-md"
                        >
                            <RefreshCw size={18} />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
