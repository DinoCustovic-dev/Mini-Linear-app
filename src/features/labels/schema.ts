import { z } from 'zod';

/** Colors a label can have. The database accepts any #rrggbb value. */
export const LABEL_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#6b7280',
] as const;

export const DEFAULT_LABEL_COLOR = '#6b7280';

const name = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(30, 'Name must be at most 30 characters');

const color = z
  .string()
  .toLowerCase()
  .refine(
    (value) => (LABEL_COLORS as readonly string[]).includes(value),
    'Pick one of the available colors'
  );

export const createLabelSchema = z.object({
  name,
  color: color.default(DEFAULT_LABEL_COLOR),
});

export const idSchema = z.string().uuid();

export type CreateLabelInput = z.input<typeof createLabelSchema>;
