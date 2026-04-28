import type { RouteObject } from 'react-router-dom';
import { ResourceListPage } from './ResourceListPage';
import { ResourceFormPage } from './ResourceFormPage';
import { ResourceDetailPage } from './ResourceDetailPage';
import type { ResourceConfig } from './types';

export function buildModuleRoutes(config: ResourceConfig): RouteObject[] {
  return [
    { path: config.module, element: <ResourceListPage config={config} /> },
    { path: `${config.module}/new`, element: <ResourceFormPage config={config} mode="create" /> },
    { path: `${config.module}/:id`, element: <ResourceDetailPage config={config} /> },
    { path: `${config.module}/:id/edit`, element: <ResourceFormPage config={config} mode="edit" /> },
  ];
}
