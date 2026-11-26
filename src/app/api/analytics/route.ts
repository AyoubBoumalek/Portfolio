import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { isJsonRecord } from "@/lib/validation";

const PUBLIC_EVENTS = new Set([
  "page_view",
  "email_click",
  "resume_click",
  "github_click",
  "linkedin_click",
  "project_code_click",
  "project_demo_click",
]);
const VISITOR_ID_PATTERN = /^[0-9a-f-]{36}$/i;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (
    !isJsonRecord(body) ||
    typeof body.visitorId !== "string" ||
    !VISITOR_ID_PATTERN.test(body.visitorId) ||
    typeof body.eventType !== "string" ||
    !PUBLIC_EVENTS.has(body.eventType) ||
    typeof body.path !== "string" ||
    !body.path.startsWith("/") ||
    body.path.startsWith("//") ||
    (body.target !== undefined && body.target !== null && typeof body.target !== "string")
  ) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }

  const target = typeof body.target === "string" ? body.target.trim().slice(0, 120) || null : null;
  await prisma.analyticsEvent.create({
    data: {
      visitorId: body.visitorId,
      eventType: body.eventType,
      target,
      path: body.path.slice(0, 200),
    },
  });

  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const daysParam = Number(request.nextUrl.searchParams.get("days") ?? "30");
  const days = Number.isFinite(daysParam) ? Math.min(90, Math.max(7, Math.floor(daysParam))) : 30;
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const events = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: start } },
    select: { visitorId: true, eventType: true, target: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const daily = new Map<string, { visits: number; interactions: number }>();
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + offset);
    daily.set(date.toISOString().slice(0, 10), { visits: 0, interactions: 0 });
  }

  const visitors = new Set<string>();
  const interactions = new Map<string, number>();
  const projectActivity = new Map<string, number>();
  let visits = 0;
  for (const event of events) {
    const day = daily.get(event.createdAt.toISOString().slice(0, 10));
    if (event.eventType === "page_view") {
      visits += 1;
      visitors.add(event.visitorId);
      if (day) day.visits += 1;
    } else {
      if (day) day.interactions += 1;
      interactions.set(event.eventType, (interactions.get(event.eventType) ?? 0) + 1);
      if (
        (event.eventType === "project_code_click" || event.eventType === "project_demo_click") &&
        event.target
      ) {
        projectActivity.set(event.target, (projectActivity.get(event.target) ?? 0) + 1);
      }
    }
  }

  return NextResponse.json({
    days,
    visits,
    visitorSessions: visitors.size,
    interactions: events.length - visits,
    daily: Array.from(daily, ([date, counts]) => ({ date, ...counts })),
    interactionBreakdown: Array.from(interactions, ([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count),
    popularProjects: Array.from(projectActivity, ([projectId, clicks]) => ({ projectId, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
