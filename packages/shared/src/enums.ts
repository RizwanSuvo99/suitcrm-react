export const ModuleName = {
  Accounts: 'accounts',
  Contacts: 'contacts',
  Leads: 'leads',
  Opportunities: 'opportunities',
  Cases: 'cases',
  Calls: 'calls',
  Meetings: 'meetings',
  Tasks: 'tasks',
  Notes: 'notes',
} as const;
export type ModuleName = (typeof ModuleName)[keyof typeof ModuleName];

export const PermissionAction = {
  Read: 'read',
  Write: 'write',
  Delete: 'delete',
} as const;
export type PermissionAction = (typeof PermissionAction)[keyof typeof PermissionAction];

export const RoleName = {
  Admin: 'Admin',
  SalesManager: 'Sales Manager',
  SalesRep: 'Sales Rep',
  ReadOnly: 'Read-Only',
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export function permissionKey(module: ModuleName, action: PermissionAction): string {
  return `${module}:${action}`;
}
