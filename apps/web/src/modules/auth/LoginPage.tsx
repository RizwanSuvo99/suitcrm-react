import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginSchema, type LoginInput } from '@suitecrm/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from './api';
import { useAuth } from './auth-context';

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const login = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (auth.isAuthenticated) {
      const dest = (location.state as LocationState | null)?.from?.pathname ?? '/';
      navigate(dest, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, location.state]);

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      await login.mutateAsync(values);
      await auth.refetch();
      const dest = (location.state as LocationState | null)?.from?.pathname ?? '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string; title?: string } } }).response?.data
          ?.detail ?? 'Unable to log in. Please try again.';
      setServerError(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>SuiteCRM Modern</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || login.isPending}>
              {isSubmitting || login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Default seed: admin@example.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
