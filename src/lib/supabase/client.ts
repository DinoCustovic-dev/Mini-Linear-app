import { createBrowserClient } from '@supabase/ssr';

import { supabaseEnv } from '@/lib/supabase/env';

import type { Database } from '@/types/database.types';

/**
 * Supabase client for Client Components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
    supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
