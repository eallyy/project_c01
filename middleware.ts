import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import type { IronSessionData } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Get session data
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

  // Allow public assets (logos, css, js, images, etc.)
  if (
    pathname.startsWith("/_next") || // Next.js static files
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") || // public directory
    pathname.startsWith("/images") || // /public/images
    pathname.startsWith("/api/public") // any public API routes
  ) {
    return res;
  }

  // Allow access to the login page
  if (pathname.startsWith("/login")) {
    // Redirect to root if already logged in
    if (session.user) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return res;
  }

  // If not logged in redirect to login
  if (!session.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

// Paths this middleware should run on
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|images|api).*)",
  ],
};
