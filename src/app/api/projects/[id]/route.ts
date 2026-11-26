import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isJsonRecord, parseStoredStringArray, readStringArray } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

function serializeProject<T extends { tools: string; metrics: string }>(project: T) {
  return {
    ...project,
    tools: parseStoredStringArray(project.tools),
    metrics: parseStoredStringArray(project.metrics),
  };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
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
    title?: string;
    description?: string;
    imageUrl?: string | null;
    githubUrl?: string | null;
    demoUrl?: string | null;
    tools?: string;
    metrics?: string;
    featured?: boolean;
  } = {};

  for (const field of ["title", "description"] as const) {
    if (field in body) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        return NextResponse.json({ error: `${field} must be a non-empty string.` }, { status: 400 });
      }
      data[field] = body[field].trim();
    }
  }

  for (const field of ["imageUrl", "githubUrl", "demoUrl"] as const) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `${field} must be a string or null.` }, { status: 400 });
      }
      data[field] = typeof value === "string" ? value.trim() || null : null;
    }
  }

  for (const field of ["tools", "metrics"] as const) {
    if (field in body) {
      const value = readStringArray(body[field]);
      if (!value) {
        return NextResponse.json({ error: `${field} must be an array of strings.` }, { status: 400 });
      }
      data[field] = JSON.stringify(value);
    }
  }

  if ("featured" in body) {
    if (typeof body.featured !== "boolean") {
      return NextResponse.json({ error: "featured must be a boolean." }, { status: 400 });
    }
    data.featured = body.featured;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Provide at least one project field to update." }, { status: 400 });
  }

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json({ project: serializeProject(project) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    throw error;
  }
}
