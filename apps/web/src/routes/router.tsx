import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/modules/auth/auth-context';
import { LoginPage } from '@/modules/auth/LoginPage';
import { ProtectedRoute } from '@/modules/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from './DashboardPage';
import { buildModuleRoutes } from '@/components/resource/buildModuleRoutes';
import { accountsConfig } from '@/modules/accounts/config';
import { contactsConfig } from '@/modules/contacts/config';
import { leadsConfig } from '@/modules/leads/config';
import { opportunitiesConfig } from '@/modules/opportunities/config';
import { casesConfig } from '@/modules/cases/config';
import { callsConfig } from '@/modules/calls/config';
import { meetingsConfig } from '@/modules/meetings/config';
import { tasksConfig } from '@/modules/tasks/config';
import { notesConfig } from '@/modules/notes/config';

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const moduleRoutes = [
  accountsConfig,
  contactsConfig,
  leadsConfig,
  opportunitiesConfig,
  casesConfig,
  callsConfig,
  meetingsConfig,
  tasksConfig,
  notesConfig,
].flatMap(buildModuleRoutes);

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
            children: [{ index: true, element: <DashboardPage /> }, ...moduleRoutes],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
