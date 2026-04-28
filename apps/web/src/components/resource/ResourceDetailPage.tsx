import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useResource, useResourceDelete, useRelationshipList } from '@/lib/resource-api';
import { useAuth } from '@/modules/auth/auth-context';
import { cn } from '@/lib/utils';
import type { ColumnConfig, ResourceConfig, RelationshipConfig } from './types';

interface Props {
  config: ResourceConfig;
}

export function ResourceDetailPage({ config }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const item = useResource<Record<string, unknown>>(config.module, id);
  const del = useResourceDelete(config.module);
  const [activeTab, setActiveTab] = useState(0);
  const canWrite = hasPermission(`${config.module}:write`);
  const canDelete = hasPermission(`${config.module}:delete`);

  if (item.isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!item.data) return <div className="text-destructive">Not found.</div>;

  const row = item.data;
  const title = config.rowTitle(row);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm(`Delete ${config.entityName.toLowerCase()} "${title}"?`)) return;
    await del.mutateAsync(id);
    navigate(`/${config.module}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to={`/${config.module}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {config.entityName}s
        </Link>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/${config.module}/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={del.isPending}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="break-words">{formatValue(row[field.name])}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {config.relationships && config.relationships.length > 0 && id && (
        <Card>
          <div className="border-b">
            <div className="flex">
              {config.relationships.map((rel, idx) => (
                <button
                  key={rel.endpoint}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={cn(
                    'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    idx === activeTab
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  {rel.label}
                </button>
              ))}
            </div>
          </div>
          <CardContent className="pt-4">
            {config.relationships[activeTab] && (
              <RelationshipPanel
                parentModule={config.module}
                parentId={id}
                rel={config.relationships[activeTab]}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RelationshipPanelProps {
  parentModule: string;
  parentId: string;
  rel: RelationshipConfig;
}

function RelationshipPanel({ parentModule, parentId, rel }: RelationshipPanelProps) {
  const list = useRelationshipList<Record<string, unknown>>(
    parentModule,
    parentId,
    rel.endpoint,
  );
  const navigate = useNavigate();

  if (list.isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!list.data?.data.length) return <div className="text-muted-foreground">No related {rel.label.toLowerCase()}.</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {rel.columns.map((c: ColumnConfig) => (
              <TableHead key={c.name}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.data.data.map((row) => (
            <TableRow
              key={String(row.id)}
              className="cursor-pointer"
              onClick={() => navigate(`/${rel.targetModule}/${String(row.id)}`)}
            >
              {rel.columns.map((c) => (
                <TableCell key={c.name}>{c.render ? c.render(row) : formatValue(row[c.name])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
  }
  return String(value);
}
