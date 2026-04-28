import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useResourceList } from '@/lib/resource-api';
import { cn } from '@/lib/utils';
import type { FieldConfig } from './types';

interface FieldRendererProps<T extends FieldValues> {
  control: Control<T>;
  field: FieldConfig;
  error?: string;
}

export function FieldRenderer<T extends FieldValues>({
  control,
  field,
  error,
}: FieldRendererProps<T>) {
  const span = field.span ?? 2;
  return (
    <div className={cn('space-y-1.5', span === 1 ? 'md:col-span-2' : '')}>
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Controller
        control={control}
        name={field.name as Path<T>}
        render={({ field: { value, onChange, onBlur, ref } }) => {
          const v = value ?? '';
          switch (field.type) {
            case 'textarea':
              return (
                <Textarea
                  id={field.name}
                  ref={ref}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                  rows={4}
                />
              );
            case 'select':
              return (
                <Select
                  id={field.name}
                  ref={ref}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(error)}
                >
                  <option value="">— select —</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              );
            case 'relation':
              return (
                <RelationSelect
                  id={field.name}
                  field={field}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  forwardedRef={ref}
                />
              );
            case 'checkbox':
              return (
                <input
                  type="checkbox"
                  id={field.name}
                  ref={ref}
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
                  onBlur={onBlur}
                  className="h-4 w-4 rounded border-input"
                />
              );
            case 'date':
              return (
                <Input
                  id={field.name}
                  type="date"
                  ref={ref}
                  value={(v as string) || ''}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case 'datetime':
              return (
                <Input
                  id={field.name}
                  type="datetime-local"
                  ref={ref}
                  value={
                    typeof v === 'string' && v.length >= 16 ? v.slice(0, 16) : (v as string) || ''
                  }
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(error)}
                />
              );
            case 'number':
            case 'currency':
              return (
                <Input
                  id={field.name}
                  type="number"
                  step={field.type === 'currency' ? '0.01' : '1'}
                  ref={ref}
                  value={v === null || v === undefined ? '' : (v as string)}
                  onChange={(e) =>
                    onChange(e.target.value === '' ? null : Number(e.target.value))
                  }
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                />
              );
            case 'email':
              return (
                <Input
                  id={field.name}
                  type="email"
                  ref={ref}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                />
              );
            case 'url':
              return (
                <Input
                  id={field.name}
                  type="url"
                  ref={ref}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                />
              );
            case 'phone':
              return (
                <Input
                  id={field.name}
                  type="tel"
                  ref={ref}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                />
              );
            default:
              return (
                <Input
                  id={field.name}
                  type="text"
                  ref={ref}
                  value={v as string}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  aria-invalid={Boolean(error)}
                />
              );
          }
        }}
      />
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface RelationSelectProps {
  id: string;
  field: FieldConfig;
  value: string;
  onChange: (val: string | null) => void;
  onBlur: () => void;
  forwardedRef: React.Ref<HTMLSelectElement>;
}

function RelationSelect({ id, field, value, onChange, onBlur, forwardedRef }: RelationSelectProps) {
  const list = useResourceList<Record<string, unknown>>(field.relationModule!, {
    page: 1,
    pageSize: 100,
  });
  const labelOf = field.relationLabel ?? ((row) => String(row.id));
  return (
    <Select
      id={id}
      ref={forwardedRef}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      onBlur={onBlur}
    >
      <option value="">— none —</option>
      {list.data?.data.map((row) => (
        <option key={String(row.id)} value={String(row.id)}>
          {labelOf(row)}
        </option>
      ))}
    </Select>
  );
}
