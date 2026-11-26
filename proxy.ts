import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/auth";

const MUTATING_METHODS = new Set(["POST", "PUT", "DELETE"]);
const PUBLIC_MUTATION_ROUTES = new Set(["/api/auth/login", "/api/analytics"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPage = pathname === "/admin/login";
  const isApiRequest = pathname === "/api" || pathname.startsWith("/api/");

  if (isAdminPage && !isLoginPage) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token || !(await isValidAdminSession(token))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (
    isApiRequest &&
    MUTATING_METHODS.has(request.method) &&
    !PUBLIC_MUTATION_ROUTES.has(pathname)
  ) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token || !(await isValidAdminSession(token))) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
