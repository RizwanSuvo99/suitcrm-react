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

// ── CRM enum string-literal arrays (mirror Prisma enums; values match @map) ──

export const LeadStatusValues = [
  'New',
  'Assigned',
  'In Process',
  'Converted',
  'Recycled',
  'Dead',
] as const;
export type LeadStatus = (typeof LeadStatusValues)[number];

export const SalesStageValues = [
  'Prospecting',
  'Qualification',
  'Needs Analysis',
  'Value Proposition',
  'Id. Decision Makers',
  'Perception Analysis',
  'Proposal/Price Quote',
  'Negotiation/Review',
  'Closed Won',
  'Closed Lost',
] as const;
export type SalesStage = (typeof SalesStageValues)[number];

export const CaseStatusValues = [
  'New',
  'Assigned',
  'Pending Input',
  'Closed',
  'Rejected',
  'Duplicate',
] as const;
export type CaseStatus = (typeof CaseStatusValues)[number];

export const CasePriorityValues = ['High', 'Medium', 'Low'] as const;
export type CasePriority = (typeof CasePriorityValues)[number];

export const CallStatusValues = ['Planned', 'Held', 'Not Held'] as const;
export type CallStatus = (typeof CallStatusValues)[number];

export const CallDirectionValues = ['Inbound', 'Outbound'] as const;
export type CallDirection = (typeof CallDirectionValues)[number];

export const MeetingStatusValues = ['Planned', 'Held', 'Not Held'] as const;
export type MeetingStatus = (typeof MeetingStatusValues)[number];

export const TaskStatusValues = [
  'Not Started',
  'In Progress',
  'Completed',
  'Pending Input',
  'Deferred',
] as const;
export type TaskStatus = (typeof TaskStatusValues)[number];

export const TaskPriorityValues = ['High', 'Medium', 'Low'] as const;
export type TaskPriority = (typeof TaskPriorityValues)[number];

export const ActivityParentTypeValues = [
  'Account',
  'Contact',
  'Lead',
  'Opportunity',
  'Case',
] as const;
export type ActivityParentType = (typeof ActivityParentTypeValues)[number];

// Common SuiteCRM lead-source values; not enforced as an enum because they're
// often customized per tenant.
export const LeadSourceValues = [
  'Cold Call',
  'Existing Customer',
  'Self Generated',
  'Employee',
  'Partner',
  'Public Relations',
  'Direct Mail',
  'Conference',
  'Trade Show',
  'Web Site',
  'Word of mouth',
  'Email',
  'Campaign',
  'Other',
] as const;
