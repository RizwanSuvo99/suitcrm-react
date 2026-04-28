import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ListEnvelope<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number };
}
export interface ItemEnvelope<T> {
  data: T;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filter?: Record<string, string>;
}

function listKey(module: string, params: ListParams) {
  return [module, 'list', params] as const;
}
function itemKey(module: string, id: string) {
  return [module, 'item', id] as const;
}

export function useResourceList<T>(module: string, params: ListParams = {}) {
  return useQuery({
    queryKey: listKey(module, params),
    queryFn: async (): Promise<ListEnvelope<T>> => {
      const queryParams: Record<string, string | number> = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 25,
      };
      if (params.sort) queryParams.sort = params.sort;
      if (params.search) queryParams.search = params.search;
      const filter = params.filter
        ? Object.fromEntries(
            Object.entries(params.filter).map(([k, v]) => [`filter[${k}]`, v]),
          )
        : {};
      const res = await api.get<ListEnvelope<T>>(`/${module}`, {
        params: { ...queryParams, ...filter },
      });
      return res.data;
    },
  });
}

export function useResource<T>(module: string, id: string | undefined) {
  return useQuery({
    queryKey: id ? itemKey(module, id) : [module, 'item', 'none'],
    enabled: Boolean(id),
    queryFn: async (): Promise<T> => {
      const res = await api.get<ItemEnvelope<T>>(`/${module}/${id}`);
      return res.data.data;
    },
  });
}

export function useResourceCreate<TCreate, TResult = Record<string, unknown>>(module: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TCreate): Promise<TResult> => {
      const res = await api.post<ItemEnvelope<TResult>>(`/${module}`, input);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [module] }),
  });
}

export function useResourceUpdate<TUpdate, TResult = Record<string, unknown>>(
  module: string,
  id: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TUpdate): Promise<TResult> => {
      const res = await api.patch<ItemEnvelope<TResult>>(`/${module}/${id}`, input);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [module] });
    },
  });
}

export function useResourceDelete(module: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/${module}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [module] }),
  });
}

export function useRelationshipList<T>(
  parentModule: string,
  parentId: string,
  endpoint: string,
  params: ListParams = {},
) {
  return useQuery({
    queryKey: [parentModule, parentId, endpoint, params],
    queryFn: async (): Promise<ListEnvelope<T>> => {
      const res = await api.get<ListEnvelope<T>>(
        `/${parentModule}/${parentId}/${endpoint}`,
        {
          params: {
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 10,
          },
        },
      );
      return res.data;
    },
  });
}
