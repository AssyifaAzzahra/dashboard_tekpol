"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import React from "react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/home" })}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-sm font-semibold transition"
      aria-label="Logout"
      title="Logout"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
