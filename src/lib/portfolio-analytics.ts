type PortfolioEvent =
  | "page_view"
  | "email_click"
  | "resume_click"
  | "github_click"
  | "linkedin_click"
  | "project_code_click"
  | "project_demo_click";

const VISITOR_KEY = "qa-portfolio-visitor";

function getVisitorId() {
  try {
    const existing = window.sessionStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const visitorId = window.crypto.randomUUID();
    window.sessionStorage.setItem(VISITOR_KEY, visitorId);
    return visitorId;
  } catch {
    return window.crypto.randomUUID();
  }
}

export function trackPortfolioEvent(eventType: PortfolioEvent, target?: string) {
  const body = JSON.stringify({
    visitorId: getVisitorId(),
    eventType,
    target: target?.slice(0, 120),
    path: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
