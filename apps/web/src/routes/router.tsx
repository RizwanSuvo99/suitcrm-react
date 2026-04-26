import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/modules/auth/auth-context';
import { LoginPage } from '@/modules/auth/LoginPage';
import { ProtectedRoute } from '@/modules/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from './DashboardPage';

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              // Phase 2 modules will be mounted here.
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
