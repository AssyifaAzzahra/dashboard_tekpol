"use client";

import React from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { LogOut, LogIn} from "lucide-react";

type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
type AppUser = { name?: string | null; role?: Role };

export default function UserMenu() {
  const { data } = useSession();
  const user = (data?.user ?? {}) as AppUser;
  const name = user?.name ?? "Tamu";
  const role: Role = user?.role ?? "GUEST";
  const initial = (name?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-white/10 border border-white/20">
        <div className="h-6 w-6 rounded-full bg-emerald-600/80 flex items-center justify-center text-white text-xs">
          {initial}
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">{name}</div>
          <div className="text-[10px] opacity-75">{role}</div>
        </div>
      </div>

      {data ? (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-sm font-semibold transition"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      ) : (
        <button
          type="button"
          onClick={() => signIn(undefined, { callbackUrl: "/info-login" })}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-sm font-semibold transition"
          aria-label="Login"
          title="Login"
        >
          <LogIn className="w-4 h-4" />
          Login
        </button>
      )}
    </div>
  );
}
