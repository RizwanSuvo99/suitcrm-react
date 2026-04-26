import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginInput, LoginResponse, MeResponse } from '@suitecrm/shared';
import { api, tokenStore } from '@/lib/api';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<LoginResponse> => {
      const res = await api.post<{ data: LoginResponse }>('/auth/login', input);
      tokenStore.set(res.data.data.tokens);
      return res.data.data;
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<void> => {
      const refreshToken = tokenStore.getRefresh();
      if (refreshToken) {
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // best-effort — logout is idempotent server-side
        }
      }
      tokenStore.clear();
      qc.clear();
    },
  });
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    enabled,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<MeResponse> => {
      const res = await api.get<{ data: MeResponse }>('/auth/me');
      return res.data.data;
    },
  });
}
