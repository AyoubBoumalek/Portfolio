"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Unable to sign in. Please try again.";
        setError(message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090b10] px-5 py-12 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-22rem] right-[-12rem] h-[38rem] w-[38rem] rounded-full bg-cyan-500/[0.07] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <section className="relative w-full max-w-[420px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-indigo-300 shadow-lg shadow-indigo-950/30">
            <ShieldCheck size={21} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">QA Portfolio</p>
            <p className="mt-0.5 text-xs text-slate-500">Administrator access</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.09] bg-[#10131a]/90 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">
          <div className="mb-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-300/[0.07] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-200">
              <LockKeyhole size={12} /> Secure sign in
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter your admin password to manage your portfolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                Admin password
              </label>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  maxLength={512}
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error ? (
              <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || password.length === 0}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
              {!isSubmitting ? <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" /> : null}
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.07] pt-5 text-center">
            <p className="text-xs text-slate-500">Protected area · Authorized access only</p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">QA Automation Engineer Portfolio</p>
      </section>
    </main>
  );
}
