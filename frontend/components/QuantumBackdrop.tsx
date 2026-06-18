'use client';

/**
 * Decorative backdrop layer: violet / cyan / indigo glows + subtle grid.
 * Sits behind content inside a `relative` parent.
 */
export default function QuantumBackdrop() {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
            aria-hidden
        >
            {/* Top-right violet blob */}
            <div className="absolute -top-[40%] -right-[20%] h-[min(90vh,900px)] w-[min(90vh,900px)] rounded-full blur-3xl animate-quantum-blob"
                style={{
                    background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, rgba(37,99,235,0.12) 50%, transparent 70%)',
                }}
            />
            {/* Bottom-left cyan blob */}
            <div className="absolute -bottom-[30%] -left-[25%] h-[min(70vh,700px)] w-[min(70vh,700px)] rounded-full blur-3xl animate-quantum-blob2"
                style={{
                    background: 'radial-gradient(ellipse, rgba(6,182,212,0.18) 0%, rgba(99,102,241,0.1) 50%, transparent 70%)',
                }}
            />
            {/* Center pulse */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full blur-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
                    animation: 'quantum-pulse 5s ease-in-out infinite',
                }}
            />
            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-30 dark:opacity-15"
                style={{
                    backgroundImage: `linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(6,182,212,0.06) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />
        </div>
    );
}
