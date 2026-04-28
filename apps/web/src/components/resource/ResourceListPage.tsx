import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { useResourceList } from '@/lib/resource-api';
import { useAuth } from '@/modules/auth/auth-context';
import type { ResourceConfig } from './types';

interface Props {
  config: ResourceConfig;
}

export function ResourceListPage({ config }: Props) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState<string | undefined>();

  const list = useResourceList<Record<string, unknown>>(config.module, {
    page,
    pageSize: 25,
    sort,
    search: search || undefined,
  });

  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.pagination.total / 25)) : 1;
  const canWrite = hasPermission(`${config.module}:write`);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const toggleSort = (col: string) => {
    setSort((prev) => {
      if (prev === `${col}:asc`) return `${col}:desc`;
      if (prev === `${col}:desc`) return undefined;
      return `${col}:asc`;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{config.entityName}s</h1>
        {canWrite && (
          <Button onClick={() => navigate(`/${config.module}/new`)}>
            <Plus className="mr-2 h-4 w-4" /> New {config.entityName}
          </Button>
        )}
      </div>

      <form onSubmit={onSubmitSearch} className="flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={config.searchPlaceholder ?? `Search ${config.entityName.toLowerCase()}s…`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setSearchInput('');
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((col) => {
                const sortKey = col.sort ?? col.name;
                const isAsc = sort === `${sortKey}:asc`;
                const isDesc = sort === `${sortKey}:desc`;
                return (
                  <TableHead key={col.name}>
                    {col.sort === false ? (
                      col.label
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSort(String(sortKey))}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        {col.label}
                        {isAsc ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : isDesc ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading && (
              <TableRow>
                <TableCell colSpan={config.columns.length} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!list.isLoading && list.data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={config.columns.length} className="text-center text-muted-foreground">
                  No {config.entityName.toLowerCase()}s yet.
                  {canWrite && (
                    <>
                      {' '}
                      <Link to={`/${config.module}/new`} className="text-primary underline">
                        Create the first one
                      </Link>
                      .
                    </>
                  )}
                </TableCell>
              </TableRow>
            )}
            {list.data?.data.map((row) => (
              <TableRow
                key={String(row.id)}
                className="cursor-pointer"
                onClick={() => navigate(`/${config.module}/${String(row.id)}`)}
              >
                {config.columns.map((col) => (
                  <TableCell key={col.name}>
                    {col.render ? col.render(row) : formatCell(row[col.name])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {list.data ? (
            <>
              Showing page {list.data.pagination.page} of {totalPages} (
              {list.data.pagination.total.toLocaleString()} total)
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
