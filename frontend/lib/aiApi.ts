import axios, { type AxiosInstance } from 'axios';
import { normalizeBackendOrigin } from '@/lib/backendUrl';

/**
 * AI routes only. When NEXT_PUBLIC_API_URL is unset, uses same-origin + Next.js
 * rewrite → FastAPI (see next.config.ts), so local dev works without CORS.
 * Experiments still use `api` from ./api.ts (always hits :8000 or your env URL).
 */
function createAiClient(): AxiosInstance {
    const raw = process.env.NEXT_PUBLIC_API_URL;
    const base = raw && raw.trim().length > 0 ? normalizeBackendOrigin(raw) : '';
    return axios.create({
        baseURL: base,
        timeout: 120_000,
        headers: { 'Content-Type': 'application/json' },
    });
}

const aiClient = createAiClient();

aiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const key = localStorage.getItem('quantum_api_key');
        if (key) {
            config.headers.Authorization = `Bearer ${key}`;
        }
    }
    return config;
});
export type ChatMessage = { 
    role: 'system' | 'user' | 'assistant'; 
    content: string;
    chart?: { labels: string[]; values: number[] } | null;
    bloch?: { theta: number; phi: number } | null;
};

export type ChatResponse = {
    reply: string;
    chart?: { labels: string[]; values: number[] } | null;
    bloch?: { theta: number; phi: number } | null;
};

export type GateOp = {
    op: 'H' | 'X' | 'Y' | 'Z' | 'RX' | 'RY' | 'RZ' | 'CX' | 'CZ' | 'I';
    targets: number[];
    params?: number[];
};

export type PlaygroundResponse = {
    title: string;
    explanation: string;
    legend: string[];
    n_qubits: number;
    gates: GateOp[];
    ascii_circuit: string;
    state_summary: string;
};

export type SimulateResponse = {
    probabilities: Record<string, number>;
    bloch: { theta: number; phi: number } | null;
    state_summary: string;
};

export async function postAiChat(messages: ChatMessage[]): Promise<ChatResponse> {
    const { data } = await aiClient.post<ChatResponse>('/api/ai/chat', { messages });
    return data;
}

export async function postAiPlayground(prompt: string): Promise<PlaygroundResponse> {
    const { data } = await aiClient.post<PlaygroundResponse>('/api/ai/playground', { prompt });
    return data;
}

export async function postAiSimulate(n_qubits: number, gates: GateOp[]): Promise<SimulateResponse> {
    const { data } = await aiClient.post<SimulateResponse>('/api/ai/simulate', { n_qubits, gates });
    return data;
}
