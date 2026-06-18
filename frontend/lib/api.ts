import axios from 'axios';
import { normalizeBackendOrigin } from '@/lib/backendUrl';

const raw = process.env.NEXT_PUBLIC_API_URL;
const API_URL =
    raw && raw.trim().length > 0 ? normalizeBackendOrigin(raw) : 'http://127.0.0.1:8000';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 120_000,
    headers: {
        'Content-Type': 'application/json',
    },
});
