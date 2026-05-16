import { z } from 'zod';
import { TASK_STATUS, TASK_PRIORITY } from '../config/constants.js';

// Query params arrive as strings — empty strings from the frontend filters
// (e.g. "All Status" = "") must be treated as "not provided" (undefined).
const emptyToUndefined = z.literal('').transform(() => undefined);

// Helper: accept a valid enum value OR an empty string (treated as undefined)
const optionalEnum = (values) =>
  z.union([z.enum(values), emptyToUndefined]).optional();

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(Object.values(TASK_STATUS)).default('TODO'),
  priority: z.enum(Object.values(TASK_PRIORITY)).default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags').default([]),
});

export const updateTaskSchema = createTaskSchema.partial(); // All fields optional for PATCH

export const taskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: optionalEnum(Object.values(TASK_STATUS)),
  priority: optionalEnum(Object.values(TASK_PRIORITY)),
  search: z.union([z.string().max(100), emptyToUndefined]).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  tags: z.union([z.string(), emptyToUndefined]).optional(),
});