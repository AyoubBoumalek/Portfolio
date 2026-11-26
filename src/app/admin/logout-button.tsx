"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isLoggingOut}
      className="inline-flex h-10 items-center rounded-xl border border-white/10 px-3 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
    >
      {isLoggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
