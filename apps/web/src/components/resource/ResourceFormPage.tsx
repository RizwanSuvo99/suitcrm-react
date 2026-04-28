import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useResource, useResourceCreate, useResourceUpdate } from '@/lib/resource-api';
import type { ResourceConfig } from './types';
import { FieldRenderer } from './fields';

interface Props {
  config: ResourceConfig;
  mode: 'create' | 'edit';
}

type FormShape = Record<string, unknown>;

export function ResourceFormPage({ config, mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existing = useResource<Record<string, unknown>>(
    config.module,
    mode === 'edit' ? id : undefined,
  );

  const create = useResourceCreate<FormShape>(config.module);
  const update = useResourceUpdate<FormShape>(config.module, id ?? '');
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = mode === 'create' ? config.createSchema : config.updateSchema;

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: config.defaults ?? {},
  });

  useEffect(() => {
    if (mode === 'edit' && existing.data) {
      reset(prepareDefaults(existing.data, config));
    }
  }, [mode, existing.data, reset, config]);

  const onSubmit: SubmitHandler<FormShape> = async (values) => {
    setServerError(null);
    try {
      const cleaned = stripEmpty(values);
      if (mode === 'create') {
        const created = await create.mutateAsync(cleaned);
        navigate(`/${config.module}/${String(created.id)}`);
      } else {
        await update.mutateAsync(cleaned);
        navigate(`/${config.module}/${id}`);
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { detail?: string; title?: string } } }).response?.data
          ?.detail ?? 'Save failed. Please try again.';
      setServerError(message);
    }
  };

  if (mode === 'edit' && existing.isLoading) {
    return <div className="text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          to={mode === 'edit' ? `/${config.module}/${id}` : `/${config.module}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === 'create' ? `New ${config.entityName}` : `Edit ${config.entityName}`}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {config.fields
                .filter((f) => f.form !== false)
                .map((field) => (
                  <FieldRenderer
                    key={field.name}
                    control={control}
                    field={field}
                    error={errors[field.name]?.message as string | undefined}
                  />
                ))}
            </div>

            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(mode === 'edit' ? `/${config.module}/${id}` : `/${config.module}`)
                }
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function prepareDefaults(row: Record<string, unknown>, config: ResourceConfig): FormShape {
  const result: FormShape = {};
  for (const f of config.fields) {
    const v = row[f.name];
    if (f.type === 'date' && typeof v === 'string') {
      result[f.name] = v.slice(0, 10);
    } else if (f.type === 'datetime' && typeof v === 'string') {
      result[f.name] = v.slice(0, 16);
    } else {
      result[f.name] = v ?? null;
    }
  }
  return result;
}

function stripEmpty(values: FormShape): FormShape {
  const out: FormShape = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === '' || v === undefined) continue;
    out[k] = v;
  }
  return out;
}
