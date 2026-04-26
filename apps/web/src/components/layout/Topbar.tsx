import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/auth-context';
import { useLogout } from '@/modules/auth/api';
import { getInitials } from '@/lib/utils';

export function Topbar() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout.mutateAsync();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-14 items-center justify-end gap-3 border-b bg-card px-6">
      {user && (
        <>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logout.isPending}
            aria-label="Sign out"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </Button>
        </>
      )}
    </header>
  );
}
