import { z } from 'zod';
import { TaskStatusValues, TaskPriorityValues, ActivityParentTypeValues } from '../enums';

export const TaskCreateSchema = z.object({
  subject: z.string().min(1).max(255),
  status: z.enum(TaskStatusValues).optional().default('Not Started'),
  priority: z.enum(TaskPriorityValues).optional().default('Medium'),
  dueDate: z.string().nullable().optional(),
  parentType: z.enum(ActivityParentTypeValues).nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  assignedUserId: z.string().uuid().nullable().optional(),
});
export type TaskCreate = z.infer<typeof TaskCreateSchema>;

export const TaskUpdateSchema = TaskCreateSchema.partial();
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

export const TaskSchema = TaskCreateSchema.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;
