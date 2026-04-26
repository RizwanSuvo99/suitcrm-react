import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/modules/auth/auth-context';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          Phase 1 foundation is live. CRM modules arrive in Phase 2.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity</CardTitle>
            <CardDescription>Your authenticated session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Email: </span>
              {user?.email}
            </div>
            <div>
              <span className="text-muted-foreground">Tenant: </span>
              <code className="text-xs">{user?.tenantId}</code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles</CardTitle>
            <CardDescription>Assigned to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.roles.length ? (
              <ul className="flex flex-wrap gap-2">
                {user.roles.map((r) => (
                  <li
                    key={r}
                    className="rounded-md border bg-secondary px-2 py-1 text-xs font-medium"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permissions</CardTitle>
            <CardDescription>{user?.permissions.length ?? 0} total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {user?.permissions.map((p) => (
                <code key={p} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                  {p}
                </code>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
