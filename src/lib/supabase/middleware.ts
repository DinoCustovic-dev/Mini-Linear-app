import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { supabaseEnv } from '@/lib/supabase/env';

import type { Database } from '@/types/database.types';

/** Pages for logged-out users. A logged-in user is sent to /projects. */
const AUTH_PATHS = ['/login', '/signup'];
/** Everything else requires login. /auth is for callback routes. */
const PUBLIC_PATHS = [...AUTH_PATHS, '/auth'];

const HOME_PATH = '/projects';
const LOGIN_PATH = '/login';

function matchesPath(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function redirectTo(
  request: NextRequest,
  response: NextResponse,
  pathname: string
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';

  const redirect = NextResponse.redirect(url);
  // Keep refreshed session cookies, otherwise the session is lost
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));

  return redirect;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
    supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not put any code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !matchesPath(pathname, PUBLIC_PATHS)) {
    return redirectTo(request, response, LOGIN_PATH);
  }

  if (user && (pathname === '/' || matchesPath(pathname, AUTH_PATHS))) {
    return redirectTo(request, response, HOME_PATH);
  }

  return response;
}
