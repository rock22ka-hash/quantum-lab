/**
 * Normalize backend origin: no trailing slash, no trailing `/api`
 * (otherwise requests become `/api/api/ai/...` → FastAPI 404).
 */
export function normalizeBackendOrigin(url: string): string {
    let u = url.trim().replace(/\/+$/, '');
    if (/\/api$/i.test(u)) {
        u = u.replace(/\/api$/i, '');
    }
    return u;
}
