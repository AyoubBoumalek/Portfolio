import Link from "next/link";
import { ArrowUpRight, Code2, ExternalLink, ShieldCheck } from "lucide-react";
import AdminLogoutButton from "./logout-button";

const sections = [
  {
    title: "Profile",
    description: "Review the public profile and contact details shown on your portfolio.",
    href: "/#about",
    icon: ShieldCheck,
  },
  {
    title: "Projects",
    description: "View the automation projects currently displayed on the homepage.",
    href: "/#projects",
    icon: Code2,
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#090b10] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <Link href="/" className="flex items-center gap-3" aria-label="QA Portfolio home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.07] text-indigo-200">
              <ShieldCheck size={19} />
            </span>
            <span>
              <span className="block text-sm font-semibold">QA Portfolio</span>
              <span className="block text-xs text-slate-500">Admin dashboard</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white">
              View portfolio <ExternalLink size={14} />
            </Link>
            <AdminLogoutButton />
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Administrator</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to your dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Your admin sign-in is working. Use these shortcuts to review the public portfolio, or return to the homepage.
          </p>
        </section>

        <section aria-label="Portfolio shortcuts" className="grid gap-4 sm:grid-cols-2">
          {sections.map(({ title, description, href, icon: Icon }) => (
            <Link key={title} href={href} className="group rounded-2xl border border-white/[0.09] bg-[#10131a] p-6 transition hover:border-indigo-300/30 hover:bg-[#121620]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-indigo-200">
                <Icon size={18} />
              </span>
              <span className="mt-5 flex items-center justify-between text-lg font-semibold">
                {title}
                <ArrowUpRight size={17} className="text-slate-500 transition group-hover:text-indigo-200" />
              </span>
              <span className="mt-2 block text-sm leading-6 text-slate-400">{description}</span>
            </Link>
          ))}
        </section>
        <p className="mt-8 text-xs text-slate-600">This area is protected by your admin session.</p>
      </div>
    </main>
  );
}
