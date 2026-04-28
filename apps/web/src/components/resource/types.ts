import type { ZodTypeAny } from 'zod';
import type { ReactNode } from 'react';

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'relation';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  /** show this field on the create + edit form (default true) */
  form?: boolean;
  /** options for `select` */
  options?: ReadonlyArray<string>;
  /** for `relation`: which module endpoint to fetch options from */
  relationModule?: string;
  /** for `relation`: which field on the related row to use as the label */
  relationLabel?: (row: Record<string, unknown>) => string;
  /** required at the form layer (zod schema is the source of truth) */
  required?: boolean;
  /** placeholder text */
  placeholder?: string;
  /** UI hint: 1 = full width, 2 = half width (default 2) */
  span?: 1 | 2;
}

export interface ColumnConfig {
  name: string;
  label: string;
  /** custom cell renderer; defaults to value as text */
  render?: (row: Record<string, unknown>) => ReactNode;
  /** sortable column key, defaults to `name` */
  sort?: string | false;
}

export interface RelationshipConfig {
  /** label shown in the detail-view tabs */
  label: string;
  /** suffix appended to /<module>/<id>, e.g. 'contacts' */
  endpoint: string;
  /** which fields to show as columns in the embedded table */
  columns: ColumnConfig[];
  /** which module these rows belong to (for "open" navigation) */
  targetModule: string;
}

export interface ResourceConfig {
  /** singular noun, e.g. "Account" */
  entityName: string;
  /** plural url-segment, e.g. "accounts" */
  module: string;
  /** Tabler / shadcn icon component (rendered in sidebar/header) */
  icon?: ReactNode;
  /** the function used to render the row title (detail page header, list link) */
  rowTitle: (row: Record<string, unknown>) => string;
  /** form fields */
  fields: FieldConfig[];
  /** list-view columns */
  columns: ColumnConfig[];
  /** zod schemas */
  createSchema: ZodTypeAny;
  updateSchema: ZodTypeAny;
  /** related-record tabs on the detail page */
  relationships?: RelationshipConfig[];
  /** initial values for the create form */
  defaults?: Record<string, unknown>;
  /** placeholder shown in the list-view search box */
  searchPlaceholder?: string;
}
