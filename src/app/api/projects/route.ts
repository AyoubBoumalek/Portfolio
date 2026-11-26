import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isJsonRecord, parseStoredStringArray, readStringArray } from "@/lib/validation";

function serializeProject<T extends { tools: string; metrics: string }>(project: T) {
  return {
    ...project,
    tools: parseStoredStringArray(project.tools),
    metrics: parseStoredStringArray(project.metrics),
  };
}

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ projects: projects.map(serializeProject) });
}

export async function POST(request: NextRequest) {
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

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }
  if (typeof body.description !== "string" || !body.description.trim()) {
    return NextResponse.json({ error: "description is required." }, { status: 400 });
  }

  const tools = body.tools === undefined ? [] : readStringArray(body.tools);
  const metrics = body.metrics === undefined ? [] : readStringArray(body.metrics);
  if (!tools || !metrics) {
    return NextResponse.json({ error: "tools and metrics must be arrays of strings." }, { status: 400 });
  }

  const nullableFields = ["imageUrl", "githubUrl", "demoUrl"] as const;
  const nullableData: Record<string, string | null> = {};
  for (const field of nullableFields) {
    const value = body[field];
    if (value !== undefined && value !== null && typeof value !== "string") {
      return NextResponse.json({ error: `${field} must be a string or null.` }, { status: 400 });
    }
    nullableData[field] = typeof value === "string" ? value.trim() || null : null;
  }
  if (body.featured !== undefined && typeof body.featured !== "boolean") {
    return NextResponse.json({ error: "featured must be a boolean." }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      title: body.title.trim(),
      description: body.description.trim(),
      tools: JSON.stringify(tools),
      metrics: JSON.stringify(metrics),
      featured: body.featured === true,
      ...nullableData,
    },
  });

  return NextResponse.json({ project: serializeProject(project) }, { status: 201 });
}
