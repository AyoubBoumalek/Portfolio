import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/auth";

export async function requireAdmin(request: NextRequest): Promise<Response | null> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token && (await isValidAdminSession(token))) {
    return null;
  }

  return Response.json({ error: "Authentication required." }, { status: 401 });
}
