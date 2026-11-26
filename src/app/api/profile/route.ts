import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isJsonRecord } from "@/lib/validation";

const PROFILE_ID = "default-qa-profile";
const requiredFields = ["name", "title", "bio", "email"] as const;
const optionalFields = ["avatarUrl", "resumeUrl", "githubUrl", "linkedinUrl"] as const;

export async function GET() {
  const profile = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!isJsonRecord(body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const data: {
    name?: string;
    title?: string;
    bio?: string;
    email?: string;
    avatarUrl?: string | null;
    resumeUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
  } = {};
  for (const field of requiredFields) {
    if (field in body) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json({ error: `${field} must be a non-empty string.` }, { status: 400 });
      }
      data[field] = body[field].trim();
    }
  }

  for (const field of optionalFields) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `${field} must be a string or null.` }, { status: 400 });
      }
      data[field] = typeof value === "string" ? value.trim() || null : null;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Provide at least one profile field to update." }, { status: 400 });
  }

  const existing = await prisma.profile.findUnique({ where: { id: PROFILE_ID } });
  const profile = existing
    ? await prisma.profile.update({ where: { id: PROFILE_ID }, data })
    : await prisma.profile.create({
        data: {
          id: PROFILE_ID,
          name: "",
          title: "",
          bio: "",
          email: "",
          ...data,
        },
      });

  return NextResponse.json({ profile });
}
