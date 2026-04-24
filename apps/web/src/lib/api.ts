import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { TokenPair } from '@suitecrm/shared';

const ACCESS_TOKEN_KEY = 'suitecrm.accessToken';
const REFRESH_TOKEN_KEY = 'suitecrm.refreshToken';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (tokens: TokenPair) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  const token = tokenStore.getAccess();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshPromise: Promise<string> | null = null;
let onAuthFailure: () => void = () => {};

export function setAuthFailureHandler(fn: () => void) {
  onAuthFailure = fn;
}

async function performRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new Error('no refresh token');
  const res = await axios.post<{ data: { tokens: TokenPair } }>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );
  tokenStore.set(res.data.data.tokens);
  return res.data.data.tokens.accessToken;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');

    if (status === 401 && !original._retried && !isAuthEndpoint && tokenStore.getRefresh()) {
      original._retried = true;
      try {
        refreshPromise = refreshPromise ?? performRefresh();
        const newToken = await refreshPromise;
        refreshPromise = null;
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      } catch (refreshErr) {
        refreshPromise = null;
        tokenStore.clear();
        onAuthFailure();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);
