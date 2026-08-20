import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase session cookie on protected routes.
 *  Does nothing (and never crashes) while env vars are missing. */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the token if it expired, and read the current user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // GUARD: protected /app routes require a signed-in user.
  // If there's no valid session, send them to /login before the page renders.
  if (!user && request.nextUrl.pathname.startsWith("/app")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Remember where they were headed so we can return them after login.
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Never let the browser cache a protected page (stops the Back button
    // from showing /app after sign-out from the bfcache).
    redirectResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    return redirectResponse;
  }

  // Also mark the served protected page as non-cacheable, so the browser
  // re-requests it (and re-checks auth) on Back/Forward navigation.
  if (request.nextUrl.pathname.startsWith("/app")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
  }

  return response;
}

export const config = { matcher: ["/app/:path*"] };
