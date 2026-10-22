import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

const DEFAULT_NEXT_PATH = '/projects';

/**
 * Dozvoljava preusmjeravanje samo na putanju na ovom sajtu, da namjenski
 * napravljen link nikoga ne može poslati na drugi sajt nakon prijave
 * (open redirect).
 */
function safeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return DEFAULT_NEXT_PATH;
  }
  if (next.startsWith('/\\')) return DEFAULT_NEXT_PATH;
  return next;
}

/**
 * Odredište za linkove koje Supabase šalje (potvrda emaila, kasnije OAuth).
 * Jednokratni `code` iz linka mijenja za sesiju prijave, pa korisnika šalje
 * na `next` (podrazumijevano: /projects).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Kod nedostaje ili je istekao: nazad na login, koji može prikazati poruku.
  return NextResponse.redirect(new URL('/login?error=auth_callback', origin));
}
