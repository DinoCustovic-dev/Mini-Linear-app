/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Type-safe environment variables.
 * Supabase vars are optional until ML-03 wires up the clients.
 */
import { z } from 'zod';

const envVariables = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SHOW_LOGGER: z.enum(['true', 'false']).optional(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
