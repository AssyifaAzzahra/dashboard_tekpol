"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-16 px-6 flex items-center justify-between">
        {/* Kiri */}
        <div>
          <div className="font-semibold leading-tight">
            Dashboard Teknik & Pengolahan
          </div>
          <div className="text-xs text-slate-500">Admin Console</div>
        </div>

        {/* Kanan */}
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-700">
            <span className="font-medium">Super Admin</span>
          </div>

          {/* ✅ BUTTON KEMBALI */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl 
                       border border-slate-200 text-sm 
                       hover:bg-slate-50 active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          {/* Logout */}
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm 
                       hover:bg-slate-50 active:scale-[0.99] transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
