import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isJsonRecord } from "@/lib/validation";

export async function GET() {
  const skills = await prisma.skill.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  return NextResponse.json({ skills });
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
  if (
    !isJsonRecord(body) ||
    typeof body.name !== "string" ||
    !body.name.trim() ||
    typeof body.category !== "string" ||
    !body.category.trim()
  ) {
    return NextResponse.json(
      { error: "name and category are required strings." },
      { status: 400 },
    );
  }

  try {
    const skill = await prisma.skill.create({
      data: { name: body.name.trim(), category: body.category.trim() },
    });
    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "That skill already exists in this category." }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Provide the skill id in the ?id= query parameter." }, { status: 400 });
  }

  try {
    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Skill not found." }, { status: 404 });
    }
    throw error;
  }
}
