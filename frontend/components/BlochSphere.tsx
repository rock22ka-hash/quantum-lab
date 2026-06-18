'use client';

/**
 * Simple Bloch-sphere diagram: wireframe + state vector as a point on the surface.
 * theta, phi in radians (physics-style: theta from +Z, phi in XY from +X).
 */
export default function BlochSphere({
    theta,
    phi,
    size = 200,
    className = '',
}: {
    theta: number;
    phi: number;
    size?: number;
    className?: string;
}) {
    const r = size / 2 - 8;
    const cx = size / 2;
    const cy = size / 2;
    const st = Math.sin(theta);
    const x = r * st * Math.cos(phi);
    const y = r * Math.sin(phi) * st;
    const z = r * Math.cos(theta);
    const px = cx + x;
    const py = cy - z;
    const equatorRy = r * 0.92;
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            aria-label="Bloch sphere representation of qubit state"
        >
            <defs>
                <radialGradient id="bloch-grad" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="rgba(167,139,250,0.25)" />
                    <stop offset="60%" stopColor="rgba(99,102,241,0.12)" />
                    <stop offset="100%" stopColor="rgba(79,70,229,0.08)" />
                </radialGradient>
                <radialGradient id="bloch-state" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#7c3aed" />
                </radialGradient>
            </defs>
            <circle cx={cx} cy={cy} r={r} fill="url(#bloch-grad)" stroke="rgba(139,92,246,0.3)" strokeWidth={1.5} />
            <ellipse cx={cx} cy={cy} rx={r * 0.98} ry={equatorRy * 0.35}
                fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth={1}
                transform={`rotate(-18 ${cx} ${cy})`}
            />
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="rgba(139,92,246,0.25)" strokeWidth={1} strokeDasharray="4 4" />
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="rgba(139,92,246,0.25)" strokeWidth={1} strokeDasharray="4 4" />
            {/* State vector line */}
            <line x1={cx} y1={cy} x2={px} y2={py} stroke="url(#bloch-state)" strokeWidth={2} />
            {/* State point */}
            <circle cx={px} cy={py} r={7} fill="url(#bloch-state)" style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.7))' }} />
            <circle cx={px} cy={py} r={3} fill="white" opacity={0.9} />
            <text x={cx} y={size - 4} textAnchor="middle" fill="rgba(139,92,246,0.6)" fontSize="9" fontWeight="700" letterSpacing="2">
                BLOCH
            </text>
        </svg>
    );
}
