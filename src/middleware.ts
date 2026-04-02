import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Custom domain middleware.
 *
 * When a request arrives on a hostname that is NOT the app's own domain,
 * we treat it as a custom domain and rewrite the URL to the internal
 * /sites/[slug]/[...path] route so Next.js can render it normally.
 *
 * Example:
 *   www.my-client-site.com/about
 *   → rewrites to /sites/my-client-site/about
 *     (slug resolved at page render time via DB lookup on customDomain)
 */

// The app's own hostnames — requests on these are passed through unchanged.
const APP_HOSTNAMES = new Set([
  process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
  "localhost",
  "127.0.0.1",
]);

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  // Strip port for comparison
  const hostnameWithoutPort = hostname.split(":")[0];

  // Pass through if this is the app's own domain or a Vercel preview URL
  if (
    APP_HOSTNAMES.has(hostnameWithoutPort) ||
    hostnameWithoutPort.endsWith(".vercel.app") ||
    hostnameWithoutPort.endsWith(".localhost")
  ) {
    return NextResponse.next();
  }

  // Custom domain — rewrite to /sites/[customDomain]/[...path]
  // The page component resolves the slug from the customDomain DB field.
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = `/sites/${hostnameWithoutPort}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
