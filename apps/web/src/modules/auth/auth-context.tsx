import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MeResponse } from '@suitecrm/shared';
import { setAuthFailureHandler, tokenStore } from '@/lib/api';
import { useMe } from './api';

interface AuthContextValue {
  user: MeResponse | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState<boolean>(() => Boolean(tokenStore.getAccess()));
  const meQuery = useMe(hasToken);

  useEffect(() => {
    setAuthFailureHandler(() => {
      setHasToken(false);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  // Watch storage in case another tab logs out.
  useEffect(() => {
    const handler = () => setHasToken(Boolean(tokenStore.getAccess()));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data,
      isAuthenticated: hasToken && Boolean(meQuery.data),
      isLoading: hasToken && meQuery.isLoading,
      refetch: () => {
        setHasToken(Boolean(tokenStore.getAccess()));
        return meQuery.refetch();
      },
      hasPermission: (permission: string) => meQuery.data?.permissions.includes(permission) ?? false,
    }),
    [hasToken, meQuery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
