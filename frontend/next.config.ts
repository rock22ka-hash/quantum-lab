import type { NextConfig } from "next";

/** FastAPI origin for Next.js rewrites (AI routes only — avoids clashing with `/experiment/[id]` pages). */
function fastApiOrigin(): string {
    const raw =
        process.env.BACKEND_PROXY_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000";
    let u = raw.trim().replace(/\/+$/, "");
    if (/\/api$/i.test(u)) {
        u = u.replace(/\/api$/i, "");
    }
    return u;
}

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
    },
    async rewrites() {
        const base = fastApiOrigin();
        return [{ source: "/api/ai/:path*", destination: `${base}/api/ai/:path*` }];
    },
};

export default nextConfig;
