"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Layers3,
  Mail,
  ShieldCheck,
  Workflow,
} from "lucide-react";

type Profile = {
  name: string;
  title: string;
  bio: string;
  email: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string;
  tools: string[];
  metrics: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
};

type Skill = { id: string; name: string; category: string };

const portfolioOwner = "Ayoub Boumalek";

const fallbackProfile: Profile = {
  name: portfolioOwner,
  title: "QA Automation",
  bio: "I build dependable test systems that help teams ship with confidence. From browser automation to API quality gates, I turn repetitive checks into fast, useful feedback.",
  email: "boumalekayoub392@gmail.com",
  githubUrl: "https://github.com/AyoubBoumalek",
  linkedinUrl: "https://www.linkedin.com/",
};

const fallbackProjects: Project[] = [
  {
    id: "ecommerce-regression-suite",
    title: "Swag Labs E-commerce UI Automation",
    description:
      "A Java-based end-to-end UI automation project for the Swag Labs demo store. Selenium WebDriver and TestNG drive a Chrome scenario through login, product selection, cart, checkout, order confirmation, and logout.",
    tools: ["Java 16", "Selenium WebDriver", "TestNG", "Maven", "Chrome"],
    metrics: ["Complete purchase flow from login through logout", "Order confirmation and logout are validated"],
    githubUrl: "https://github.com/AyoubBoumalek/Swag-Labs-Ecommerce-WebSite",
    demoUrl: "https://www.saucedemo.com",
    featured: true,
  },
  {
    id: "api-contract-validation",
    title: "API Contract Validation",
    description:
      "An automated validation workflow for response schemas, authentication, error handling, and business rules on every pull request.",
    tools: ["Postman", "Python", "Docker"],
    metrics: ["85 API endpoints covered", "60% fewer manual checks", "Breaking changes caught early"],
    githubUrl: null,
    demoUrl: null,
    featured: true,
  },
  {
    id: "continuous-quality-pipeline",
    title: "Continuous Quality Pipeline",
    description:
      "A CI quality pipeline that runs pull request smoke checks and scheduled regression tests with clear artifacts for debugging failures.",
    tools: ["Cypress", "TypeScript", "GitHub Actions"],
    metrics: ["Feedback reduced to 18 minutes", "95% of smoke checks automated", "40% fewer flaky tests"],
    githubUrl: null,
    demoUrl: null,
    featured: true,
  },
];

const fallbackSkills: Skill[] = [
  { id: "playwright", name: "Playwright", category: "Test Automation" },
  { id: "cypress", name: "Cypress", category: "Test Automation" },
  { id: "selenium", name: "Selenium", category: "Test Automation" },
  { id: "typescript", name: "TypeScript", category: "Programming" },
  { id: "python", name: "Python", category: "Programming" },
  { id: "github-actions", name: "GitHub Actions", category: "CI/CD" },
  { id: "docker", name: "Docker", category: "DevOps" },
  { id: "postman", name: "Postman", category: "API Testing" },
];

export default function Home() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [projects, setProjects] = useState(fallbackProjects);
  const [skills, setSkills] = useState(fallbackSkills);

  useEffect(() => {
    let active = true;

    async function loadPortfolio() {
      const [profileResult, projectsResult, skillsResult] = await Promise.allSettled([
        fetch("/api/profile", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/projects", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/skills", { cache: "no-store" }).then((response) => response.json()),
      ]);

      if (!active) return;

      if (profileResult.status === "fulfilled" && profileResult.value.profile) {
        setProfile({ ...fallbackProfile, ...profileResult.value.profile, name: portfolioOwner });
      }
      if (
        projectsResult.status === "fulfilled" &&
        Array.isArray(projectsResult.value.projects) &&
        projectsResult.value.projects.length > 0
      ) {
        setProjects(projectsResult.value.projects);
      }
      if (
        skillsResult.status === "fulfilled" &&
        Array.isArray(skillsResult.value.skills) &&
        skillsResult.value.skills.length > 0
      ) {
        setSkills(skillsResult.value.skills);
      }
    }

    void loadPortfolio();
    return () => {
      active = false;
    };
  }, []);

  const skillGroups = skills.reduce<Record<string, Skill[]>>((groups, skill) => {
    (groups[skill.category] ??= []).push(skill);
    return groups;
  }, {});

  return (
    <main className="min-h-screen overflow-hidden bg-[#090b10] text-slate-100">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute -top-72 left-1/2 h-[38rem] w-[58rem] -translate-x-1/2 rounded-full bg-indigo-500/[0.11] blur-[130px]" />
        <div className="absolute right-[-24rem] top-[38rem] h-[40rem] w-[40rem] rounded-full bg-cyan-500/[0.07] blur-[140px]" />
      </div>

      <header className="relative z-10 border-b border-white/[0.07]">
        <nav className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#home" className="flex items-center gap-3" aria-label="Go to home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/20 bg-indigo-300/[0.08] text-indigo-200">
              <ShieldCheck size={18} />
            </span>
            <span className="text-sm font-semibold tracking-wide">{portfolioOwner}</span>
          </a>
          <div className="hidden items-center gap-8 text-sm text-slate-400 sm:flex">
            <a className="transition hover:text-white" href="#work">Projects</a>
            <a className="transition hover:text-white" href="#skills">Skills</a>
            <a className="transition hover:text-white" href="#contact">Contact</a>
          </div>
          <a
            href="mailto:boumalekayoub392@gmail.com"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-indigo-300/40 hover:bg-white/[0.04]"
          >
            Let&apos;s talk
          </a>
        </nav>
      </header>

      <section id="home" className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-32">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3.5 py-2 text-xs font-medium text-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            Quality built into every release
          </div>
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-indigo-200/80 uppercase">
            {profile.title}
          </p>
          <h1 className="max-w-3xl text-5xl leading-[1.06] font-semibold tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.5rem]">
            Better tests.
            <br />
            <span className="bg-gradient-to-r from-indigo-200 via-indigo-300 to-cyan-200 bg-clip-text text-transparent">
              Better software.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            {profile.bio}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#work"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400"
            >
              Explore my work <ArrowDown size={16} />
            </a>
            <a
              href="mailto:boumalekayoub392@gmail.com"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <Mail size={16} /> Get in touch
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
            <span className="h-px w-8 bg-slate-700" />
            Turning quality goals into repeatable engineering practice
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px]">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-400/15 via-transparent to-cyan-300/10 blur-2xl" />
          <div className="relative rounded-[1.6rem] border border-white/10 bg-[#10131a]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
              </div>
              <span className="font-mono text-[10px] tracking-wide text-slate-600">quality-pipeline.yml</span>
            </div>
            <div className="space-y-4 py-6 font-mono text-xs sm:text-[13px]">
              <p className="text-slate-600">01 <span className="ml-4 text-indigo-300">name:</span> <span className="text-slate-300">BOUMALEK AYOUB</span></p>
              <p className="text-slate-600">02 <span className="ml-4 text-indigo-300">on:</span> <span className="text-slate-300">[pull_request]</span></p>
              <p className="text-slate-600">03</p>
              <p className="text-slate-600">04 <span className="ml-4 text-indigo-300">jobs:</span></p>
              <p className="text-slate-600">05 <span className="ml-8 text-cyan-200">e2e-tests:</span></p>
              <p className="text-slate-600">06 <span className="ml-12 text-indigo-300">steps:</span></p>
              <p className="text-slate-600">07 <span className="ml-16 text-slate-400">- install dependencies</span></p>
              <p className="text-slate-600">08 <span className="ml-16 text-slate-400">- run browser tests</span></p>
              <p className="text-slate-600">09 <span className="ml-16 text-slate-400">- publish report</span></p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-300/10 bg-emerald-300/[0.05] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-200">
                <CheckCircle2 size={15} /> All checks passed
              </div>
              <span className="font-mono text-[10px] text-slate-500">2m 14s</span>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141820] px-4 py-3 shadow-xl sm:-left-9">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-300/10 text-indigo-200"><Workflow size={18} /></span>
            <span><span className="block text-xs font-semibold text-white">Reliable releases</span><span className="mt-1 block text-[10px] text-slate-500">Confidence through automation</span></span>
          </div>
        </div>
      </section>

      <section id="work" className="relative border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-indigo-200/80 uppercase">Selected work</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Quality in practice</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">Automation that shortens feedback loops, protects critical journeys, and keeps releases moving.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {projects.map((project, index) => (
              <article key={project.id} className="group flex min-h-[360px] flex-col rounded-2xl border border-white/[0.08] bg-[#10131a] p-5 transition hover:-translate-y-1 hover:border-indigo-300/25 sm:p-6">
                <div className="mb-7 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-300/10 bg-indigo-300/[0.06] text-indigo-200">
                    {index === 0 ? <Layers3 size={19} /> : index === 1 ? <ShieldCheck size={19} /> : <Workflow size={19} />}
                  </span>
                  <span className="font-mono text-xs text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{project.description}</p>
                <ul className="mt-5 space-y-2">
                  {project.metrics.slice(0, 2).map((metric) => (
                    <li key={metric} className="flex items-start gap-2 text-xs leading-5 text-emerald-200/90">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {metric}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
                  {project.tools.slice(0, 4).map((tool) => (
                    <span key={tool} className="rounded-md bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">{tool}</span>
                  ))}
                  {project.githubUrl ? <a className="ml-auto inline-flex items-center gap-1 text-xs text-indigo-200 hover:text-white" href={project.githubUrl} target="_blank" rel="noreferrer">Code <ArrowUpRight size={13} /></a> : null}
                  {project.demoUrl ? <a className="inline-flex items-center gap-1 text-xs text-indigo-200 hover:text-white" href={project.demoUrl} target="_blank" rel="noreferrer">Demo <ArrowUpRight size={13} /></a> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-indigo-200/80 uppercase">Toolkit</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tools for quality at every layer.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">A practical mix of browser, API, programming, and delivery tools to make quality part of the development workflow.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(skillGroups).map(([category, categorySkills]) => (
              <div key={category} className="rounded-2xl border border-white/[0.08] bg-[#10131a]/80 p-5">
                <h3 className="mb-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span key={skill.id} className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs font-medium text-slate-200">{skill.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative border-t border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-indigo-200/80 uppercase">Contact</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Let&apos;s make quality a team habit.</h2>
            <p className="mt-3 text-sm text-slate-400">Have a quality challenge or a role in mind? I&apos;d like to hear about it.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="mailto:boumalekayoub392@gmail.com" className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400"><Mail size={16} /> Email me</a>
            {profile.githubUrl ? <a href={profile.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/[0.05] hover:text-white"><Code2 size={17} /></a> : null}
            {profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white">LinkedIn <ArrowUpRight size={14} className="ml-1" /></a> : null}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {profile.name}. Built with care for quality.</span>
          <a href="/admin/login" className="transition hover:text-slate-300">Admin sign in</a>
        </div>
      </footer>
    </main>
  );
}
