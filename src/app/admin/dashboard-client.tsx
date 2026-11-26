"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  Eye,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import AdminLogoutButton from "./logout-button";

type Profile = {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  email: string;
};
type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  tools: string[];
  metrics: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  createdAt?: string;
};
type Skill = { id: string; name: string; category: string };
type Analytics = {
  days: number;
  visits: number;
  visitorSessions: number;
  interactions: number;
  daily: { date: string; visits: number; interactions: number }[];
  interactionBreakdown: { eventType: string; count: number }[];
  popularProjects: { projectId: string; clicks: number }[];
};
type Tab = "overview" | "profile" | "projects" | "skills" | "analytics";

const navItems: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "projects", label: "Projects", icon: BriefcaseBusiness },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const emptyProfile: Profile = {
  name: "Ayoub Boumalek",
  title: "QA Automation Engineer",
  bio: "",
  avatarUrl: null,
  resumeUrl: null,
  githubUrl: null,
  linkedinUrl: null,
  email: "",
};

const emptyAnalytics: Analytics = {
  days: 30,
  visits: 0,
  visitorSessions: 0,
  interactions: 0,
  daily: [],
  interactionBreakdown: [],
  popularProjects: [],
};

async function responseError(response: Response) {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
      return body.error;
    }
  } catch {
    // Use the generic response below when the server did not send JSON.
  }
  return `Request failed (${response.status}).`;
}

function splitLines(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean) : [];
}

function optionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() || null : null;
}

function Field({ label, name, defaultValue = "", type = "text", placeholder, required = false }: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-xl border border-white/10 bg-[#090b10] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/10"
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue = "", rows = 4, placeholder }: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-white/10 bg-[#090b10] px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/10"
      />
    </label>
  );
}

function Panel({ title, description, action, children }: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#10131a]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, hint, icon: Icon }: {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Activity;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#10131a] p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-300/[0.08] text-indigo-200"><Icon size={17} /></span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </article>
  );
}

export default function DashboardClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [analyticsWarning, setAnalyticsWarning] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileRes, projectsRes, skillsRes, analyticsResult] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetch("/api/projects", { cache: "no-store" }),
        fetch("/api/skills", { cache: "no-store" }),
        fetch("/api/analytics?days=30", { cache: "no-store" })
          .then((response) => ({ response }))
          .catch(() => ({ response: null })),
      ]);
      const failed = [profileRes, projectsRes, skillsRes].find((response) => !response.ok);
      if (failed) throw new Error(await responseError(failed));
      const [profileData, projectData, skillData] = await Promise.all([
        profileRes.json(), projectsRes.json(), skillsRes.json(),
      ]);
      setProfile({ ...emptyProfile, ...(profileData.profile ?? {}) });
      setProjects(Array.isArray(projectData.projects) ? projectData.projects : []);
      setSkills(Array.isArray(skillData.skills) ? skillData.skills : []);
      if (analyticsResult.response?.ok) {
        setAnalytics(await analyticsResult.response.json());
        setAnalyticsWarning("");
      } else {
        setAnalytics(emptyAnalytics);
        setAnalyticsWarning("Traffic analytics are unavailable. Check that the deployment database has the latest schema and persistent storage configured.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      title: String(data.get("title") ?? "").trim(),
      bio: String(data.get("bio") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      avatarUrl: optionalString(data.get("avatarUrl")),
      resumeUrl: optionalString(data.get("resumeUrl")),
      githubUrl: optionalString(data.get("githubUrl")),
      linkedinUrl: optionalString(data.get("linkedinUrl")),
    };
    try {
      const response = await fetch("/api/profile", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const result = await response.json();
      setProfile({ ...emptyProfile, ...result.profile });
      setNotice("Profile saved. Your public portfolio will use the new details.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save profile.");
    } finally { setBusy(false); }
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      imageUrl: optionalString(data.get("imageUrl")),
      tools: splitLines(data.get("tools")),
      metrics: splitLines(data.get("metrics")),
      githubUrl: optionalString(data.get("githubUrl")),
      demoUrl: optionalString(data.get("demoUrl")),
      featured: data.get("featured") === "on",
    };
    try {
      const response = await fetch(editingProject ? `/api/projects/${editingProject.id}` : "/api/projects", {
        method: editingProject ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setNotice(editingProject ? "Project updated." : "Project added to your portfolio.");
      setEditingProject(null); setShowProjectForm(false);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project.");
    } finally { setBusy(false); }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`Delete “${project.title}” from your portfolio?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      setNotice("Project deleted."); await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete project.");
    } finally { setBusy(false); }
  }

  async function addSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/skills", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), category: data.get("category") }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      form.reset(); setNotice("Skill added."); await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add skill.");
    } finally { setBusy(false); }
  }

  async function deleteSkill(skill: Skill) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/skills?id=${encodeURIComponent(skill.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      setNotice("Skill removed."); await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove skill.");
    } finally { setBusy(false); }
  }

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    (groups[skill.category] ??= []).push(skill);
    return groups;
  }, {});
  const maxDaily = Math.max(1, ...analytics.daily.map((day) => day.visits));

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100">
      <div className="mx-auto max-w-[1440px] lg:flex">
        <aside className="border-b border-white/[0.07] bg-[#0d1016] lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.07] px-5 sm:px-7 lg:px-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.07] text-indigo-200"><ShieldCheck size={19} /></span>
            <span><span className="block text-sm font-semibold text-white">QA Portfolio</span><span className="block text-xs text-slate-500">Admin workspace</span></span>
          </div>
          <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:px-3 lg:py-6">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => { setTab(id); setNotice(""); setError(""); }} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition lg:w-full ${tab === id ? "bg-indigo-400/10 font-medium text-indigo-100" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
                <Icon size={17} /> {label}
                {tab === id ? <ChevronRight size={15} className="ml-auto hidden lg:block" /> : null}
              </button>
            ))}
          </nav>
          <div className="hidden px-5 lg:block">
            <div className="rounded-xl border border-emerald-300/10 bg-emerald-300/[0.04] p-3.5">
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Workspace protected</p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">Changes here are published to the portfolio content APIs.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8">
            <div><p className="text-xs text-slate-500">Portfolio management</p><p className="mt-1 text-sm font-medium text-white">{navItems.find((item) => item.id === tab)?.label}</p></div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void loadData()} aria-label="Refresh dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/[0.05] hover:text-white"><RefreshCw size={15} /></button>
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"><Eye size={15} /><span className="hidden sm:inline">View site</span><ArrowUpRight size={13} /></a>
              <AdminLogoutButton />
            </div>
          </header>

          <main className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Good to see you</p>
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{tab === "overview" ? `Welcome, ${profile.name || "Ayoub"}` : navItems.find((item) => item.id === tab)?.label}</h1>
                <p className="mt-2 text-sm text-slate-400">Manage your public profile, project work, and portfolio performance.</p>
              </div>
              {tab === "projects" ? <button type="button" onClick={() => { setEditingProject(null); setShowProjectForm((value) => !value); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400"><Plus size={16} /> Add project</button> : null}
            </div>

            {error ? <div role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.06] px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            {notice ? <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.05] px-4 py-3 text-sm text-emerald-200"><Check size={16} />{notice}</div> : null}
            {analyticsWarning && tab === "analytics" ? <div role="status" className="rounded-xl border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 text-sm leading-6 text-amber-100">{analyticsWarning}</div> : null}

            {loading ? <div className="flex items-center gap-2 py-16 text-sm text-slate-400"><LoaderCircle className="animate-spin" size={17} /> Loading your workspace…</div> : null}

            {!loading && tab === "overview" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Portfolio visits" value={analytics.visits} hint="Last 30 days" icon={Eye} />
                  <MetricCard label="Visitor sessions" value={analytics.visitorSessions} hint="Anonymous sessions" icon={Activity} />
                  <MetricCard label="Project interactions" value={analytics.interactions} hint="Code and demo clicks" icon={ArrowUpRight} />
                  <MetricCard label="Published projects" value={projects.length} hint="Visible on your portfolio" icon={BriefcaseBusiness} />
                </div>
                <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                  <Panel title="Traffic overview" description="Visits and engagement across the past 30 days." action={<button onClick={() => setTab("analytics")} className="text-xs font-medium text-indigo-200 hover:text-white">View analytics <ArrowUpRight className="ml-1 inline" size={13} /></button>}>
                    <TrafficChart daily={analytics.daily} maxDaily={maxDaily} />
                  </Panel>
                  <Panel title="Quick actions" description="Keep your portfolio current.">
                    <div className="space-y-2">
                      <QuickAction title="Update your profile" description="Edit bio, links, and résumé." icon={UserRound} onClick={() => setTab("profile")} />
                      <QuickAction title="Manage projects" description="Add, edit, or remove project cards." icon={BriefcaseBusiness} onClick={() => setTab("projects")} />
                      <QuickAction title="Review performance" description="See visits and audience actions." icon={BarChart3} onClick={() => setTab("analytics")} />
                    </div>
                  </Panel>
                </div>
                <Panel title="Recent projects" description="Your latest work displayed on the public site." action={<button onClick={() => setTab("projects")} className="text-xs font-medium text-indigo-200 hover:text-white">Manage all <ArrowUpRight className="ml-1 inline" size={13} /></button>}>
                  {projects.length ? <div className="divide-y divide-white/[0.06]">{projects.slice(0, 4).map((project) => <div key={project.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{project.title}</p><p className="mt-1 truncate text-xs text-slate-500">{project.tools.join(" · ")}</p></div>{project.featured ? <span className="rounded-full border border-indigo-300/15 bg-indigo-300/[0.06] px-2.5 py-1 text-[10px] font-medium text-indigo-200">Featured</span> : null}</div>)}</div> : <EmptyState text="No projects found. Add your first project to showcase your work." />}
                </Panel>
              </>
            ) : null}

            {!loading && tab === "profile" ? (
              <Panel title="Public profile" description="These details appear across your portfolio. Save to publish the changes.">
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Full name" name="name" defaultValue={profile.name} required />
                    <Field label="Professional title" name="title" defaultValue={profile.title} required />
                    <Field label="Email address" name="email" type="email" defaultValue={profile.email} required />
                    <Field label="Avatar image URL" name="avatarUrl" type="url" defaultValue={profile.avatarUrl} placeholder="https://…" />
                    <Field label="Résumé PDF URL" name="resumeUrl" type="url" defaultValue={profile.resumeUrl} placeholder="https://…" />
                    <Field label="GitHub profile" name="githubUrl" type="url" defaultValue={profile.githubUrl} placeholder="https://github.com/…" />
                    <Field label="LinkedIn profile" name="linkedinUrl" type="url" defaultValue={profile.linkedinUrl} placeholder="https://linkedin.com/in/…" />
                  </div>
                  <TextArea label="Short bio" name="bio" defaultValue={profile.bio} rows={5} />
                  <div className="flex justify-end border-t border-white/[0.07] pt-5"><SubmitButton busy={busy} label="Save profile" /></div>
                </form>
              </Panel>
            ) : null}

            {!loading && tab === "projects" ? (
              <div className="space-y-5">
                {showProjectForm || editingProject ? (
                  <Panel title={editingProject ? "Edit project" : "New project"} description="Add a clear summary, the tools you used, and measurable outcomes." action={<button type="button" onClick={() => { setShowProjectForm(false); setEditingProject(null); }} className="text-sm text-slate-400 hover:text-white">Cancel</button>}>
                    <form key={editingProject?.id ?? "new"} onSubmit={saveProject} className="space-y-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <Field label="Project title" name="title" defaultValue={editingProject?.title} required />
                        <Field label="Thumbnail image URL" name="imageUrl" type="url" defaultValue={editingProject?.imageUrl} placeholder="https://…" />
                        <Field label="GitHub repository URL" name="githubUrl" type="url" defaultValue={editingProject?.githubUrl} placeholder="https://github.com/…" />
                        <Field label="Live demo URL" name="demoUrl" type="url" defaultValue={editingProject?.demoUrl} placeholder="https://…" />
                      </div>
                      <TextArea label="Project description" name="description" defaultValue={editingProject?.description} rows={4} />
                      <div className="grid gap-5 md:grid-cols-2">
                        <TextArea label="Tools and technologies" name="tools" defaultValue={editingProject?.tools.join("\n")} rows={4} placeholder="One item per line" />
                        <TextArea label="Results and metrics" name="metrics" defaultValue={editingProject?.metrics.join("\n")} rows={4} placeholder="One result per line" />
                      </div>
                      <label className="inline-flex items-center gap-2 text-sm text-slate-300"><input name="featured" type="checkbox" defaultChecked={editingProject?.featured ?? false} className="h-4 w-4 accent-indigo-400" /> Feature this project near the top</label>
                      <div className="flex justify-end border-t border-white/[0.07] pt-5"><SubmitButton busy={busy} label={editingProject ? "Save project" : "Create project"} /></div>
                    </form>
                  </Panel>
                ) : null}
                {projects.length ? <div className="grid gap-4 lg:grid-cols-2">{projects.map((project) => (
                  <article key={project.id} className="rounded-2xl border border-white/[0.08] bg-[#10131a] p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-medium text-slate-500">{project.featured ? "Featured project" : "Portfolio project"}</p><h3 className="mt-2 text-lg font-semibold text-white">{project.title}</h3></div><Code2 className="shrink-0 text-indigo-200" size={18} /></div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">{project.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{project.tools.map((tool) => <span key={tool} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-slate-300">{tool}</span>)}</div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4"><span className="text-xs text-slate-500">{project.metrics.length} outcome{project.metrics.length === 1 ? "" : "s"}</span><div className="flex gap-2"><button type="button" onClick={() => { setEditingProject(project); setShowProjectForm(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.05]">Edit</button><button type="button" disabled={busy} onClick={() => void deleteProject(project)} aria-label={`Delete ${project.title}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300/10 text-rose-200/80 hover:bg-rose-300/[0.07] disabled:opacity-40"><Trash2 size={14} /></button></div></div>
                  </article>
                ))}</div> : <Panel title="Your projects" description="Projects you add here will appear on the public portfolio."><EmptyState text="No project cards yet. Use Add project to publish your first one." /></Panel>}
              </div>
            ) : null}

            {!loading && tab === "skills" ? (
              <div className="space-y-6">
                <Panel title="Add a skill" description="Skills are grouped into categories on the portfolio.">
                  <form onSubmit={addSkill} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <Field label="Skill name" name="name" placeholder="e.g. Playwright" required />
                    <Field label="Category" name="category" placeholder="e.g. Test Automation" required />
                    <button disabled={busy} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"><Plus size={16} /> Add skill</button>
                  </form>
                </Panel>
                {Object.entries(groupedSkills).map(([category, categorySkills]) => <Panel key={category} title={category} description={`${categorySkills.length} skill${categorySkills.length === 1 ? "" : "s"}`}>
                  <div className="flex flex-wrap gap-2">{categorySkills.map((skill) => <span key={skill.id} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] py-2 pl-3 pr-2 text-sm text-slate-200">{skill.name}<button type="button" onClick={() => void deleteSkill(skill)} disabled={busy} aria-label={`Remove ${skill.name}`} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-rose-300/10 hover:text-rose-200 disabled:opacity-40"><Trash2 size={13} /></button></span>)}</div>
                </Panel>)}
              </div>
            ) : null}

            {!loading && tab === "analytics" ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Page views" value={analytics.visits} hint="Past 30 days" icon={Eye} />
                  <MetricCard label="Visitor sessions" value={analytics.visitorSessions} hint="Anonymous browser sessions" icon={Activity} />
                  <MetricCard label="Interactions" value={analytics.interactions} hint="Contact and project actions" icon={ArrowUpRight} />
                  <MetricCard label="Engagement rate" value={`${analytics.visits ? Math.round((analytics.interactions / analytics.visits) * 100) : 0}%`} hint="Interactions per page view" icon={BarChart3} />
                </div>
                <Panel title="Traffic over time" description="Daily page views for the past 30 days.">
                  <TrafficChart daily={analytics.daily} maxDaily={maxDaily} large />
                </Panel>
                <Panel title="What visitors clicked" description="Counts of portfolio actions. No names, IP addresses, or contact details are collected.">
                  {analytics.interactionBreakdown.length ? <div className="divide-y divide-white/[0.06]">{analytics.interactionBreakdown.map(({ eventType, count }) => <div key={eventType} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><span className="text-sm text-slate-300">{eventLabel(eventType)}</span><span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white">{count}</span></div>)}</div> : <EmptyState text="No tracked interactions yet. Contact links and project links will appear here as visitors use them." />}
                </Panel>
                <Panel title="Most explored projects" description="Project source and demo link clicks over the past 30 days.">
                  {analytics.popularProjects.length ? <div className="divide-y divide-white/[0.06]">{analytics.popularProjects.map((item) => <div key={item.projectId} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><span className="truncate text-sm text-slate-300">{projects.find((project) => project.id === item.projectId)?.title ?? "Removed project"}</span><span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white">{item.clicks} clicks</span></div>)}</div> : <EmptyState text="Project interest will appear after visitors open project links." />}
                </Panel>
                <p className="text-xs leading-5 text-slate-600">Visitor sessions are anonymous browser sessions, not verified unique people. Analytics depends on the database connection configured for this deployment.</p>
              </div>
            ) : null}
          </main>

          <footer className="border-t border-white/[0.06] px-5 py-5 text-center text-xs text-slate-600 sm:px-8">Portfolio Admin · Signed-in session <span className="px-1">·</span><Link href="/" className="text-slate-400 hover:text-white">Open public site</Link></footer>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return <button disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={15} /> : <Save size={15} />}{busy ? "Saving…" : label}</button>;
}

function QuickAction({ title, description, icon: Icon, onClick }: { title: string; description: string; icon: typeof Activity; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] p-3 text-left transition hover:border-indigo-300/20 hover:bg-white/[0.025]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-indigo-200"><Icon size={16} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-white">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{description}</span></span><ChevronRight size={15} className="text-slate-600" /></button>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-slate-500">{text}</div>;
}

function TrafficChart({ daily, maxDaily, large = false }: { daily: Analytics["daily"]; maxDaily: number; large?: boolean }) {
  const visible = daily.filter((_, index) => large || index % 3 === 0 || index === daily.length - 1);
  return (
    <div>
      <div className={`flex items-end gap-1.5 ${large ? "h-56 sm:gap-2" : "h-40"}`}>
        {visible.map((day) => {
          const height = day.visits ? Math.max(8, (day.visits / maxDaily) * 100) : 3;
          return <div key={day.date} className="group relative flex h-full min-w-0 flex-1 items-end" title={`${day.date}: ${day.visits} views, ${day.interactions} interactions`}><div className={`w-full rounded-t-sm transition ${day.visits ? "bg-gradient-to-t from-indigo-500/60 to-cyan-300/80 group-hover:from-indigo-400 group-hover:to-cyan-200" : "bg-white/[0.05]"}`} style={{ height: `${height}%` }} /></div>;
        })}
      </div>
      <div className="mt-3 flex justify-between text-[10px] text-slate-600"><span>{daily[0]?.date ?? "—"}</span><span>{daily[Math.floor(daily.length / 2)]?.date ?? ""}</span><span>{daily[daily.length - 1]?.date ?? "—"}</span></div>
      <div className="mt-5 flex items-center gap-4 border-t border-white/[0.06] pt-4 text-xs text-slate-500"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-cyan-300/80" /> Page views</span><span className="ml-auto">Bars show views per day</span></div>
    </div>
  );
}

function eventLabel(eventType: string) {
  const labels: Record<string, string> = {
    email_click: "Contact email clicked",
    resume_click: "Résumé opened",
    github_click: "GitHub profile opened",
    linkedin_click: "LinkedIn profile opened",
    project_code_click: "Project source opened",
    project_demo_click: "Project demo opened",
  };
  return labels[eventType] ?? eventType.replaceAll("_", " ");
}
