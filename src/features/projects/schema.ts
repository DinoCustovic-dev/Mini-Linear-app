import { z } from 'zod';

// Limits mirror the check constraints in the projects table.
const name = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(80, 'Name must be at most 80 characters');

// Typing "ft" is fine: the key is upper-cased before it is checked.
const key = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2,5}$/, 'Key must be 2 to 5 letters (A-Z)');

export const createProjectSchema = z.object({ name, key });

/** The key is part of every URL and ticket id (FT-16), so it never changes. */
export const updateProjectSchema = z.object({ name });

export const projectIdSchema = z.string().uuid('Invalid project');
export const projectKeySchema = key;

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type UpdateProjectInput = z.input<typeof updateProjectSchema>;
