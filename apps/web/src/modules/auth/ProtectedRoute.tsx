import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenStore } from '@/lib/api';
import { useAuth } from './auth-context';

export function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  // Fast bail: no token at all → straight to login.
  if (!tokenStore.getAccess()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
