"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cls } from "@/lib/utils";
import {
  LayoutDashboard,
  Inbox,
  AppWindow,
  Users,
  ScrollText,
  Newspaper,
  Instagram,
  Image as ImageIcon,
  Tags,
  FileText,
  FileCog,
  Factory,        // ✅ icon untuk PKS
  Building2,      // ✅ icon untuk PPIS / PPKR
} from "lucide-react";

type Menu = {
  href: string;
  label: string;
  icon: React.ReactNode;
  group?: "MAIN" | "CONTENT";
};

const menus: Menu[] = [
  // ================= MAIN =================
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, group: "MAIN" },
  { href: "/admin/requests", label: "Requests", icon: <Inbox className="h-4 w-4" />, group: "MAIN" },
  { href: "/admin/apps", label: "Apps", icon: <AppWindow className="h-4 w-4" />, group: "MAIN" },
  { href: "/admin/users", label: "Users & Roles", icon: <Users className="h-4 w-4" />, group: "MAIN" },
  { href: "/admin/audit", label: "Audit Log", icon: <ScrollText className="h-4 w-4" />, group: "MAIN" },

  // ================= CONTENT =================
  { href: "/admin/news", label: "News", icon: <Newspaper className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/gallery", label: "Gallery", icon: <ImageIcon className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/gallery-categories", label: "Kategori Galeri", icon: <Tags className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/pks-deck", label: "PPT PKS", icon: <FileText className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/pks-documents", label: "Dokumen PKS", icon: <FileText className="h-4 w-4" />, group: "CONTENT" },

  // ✅ NEW: CRUD UNIT
  { href: "/admin/pks", label: "Kelola PKS", icon: <Factory className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/ppis", label: "Kelola PPIS", icon: <Building2 className="h-4 w-4" />, group: "CONTENT" },
  { href: "/admin/ppkr", label: "Kelola PPKR", icon: <Building2 className="h-4 w-4" />, group: "CONTENT" },

  // ✅ Dokumen Tekpol
  { href: "/admin/content", label: "Dokumen TEKPOL", icon: <FileCog className="h-4 w-4" />, group: "CONTENT" },
];

export default function AdminSidebar() {
  const path = usePathname();

  const main = menus.filter((m) => m.group === "MAIN");
  const content = menus.filter((m) => m.group === "CONTENT");

  return (
    <aside className="w-72 shrink-0 bg-slate-950 text-slate-100">
      <div className="p-5 border-b border-white/10">
        <div className="text-lg font-semibold leading-tight">Admin Panel</div>
        <div className="text-xs text-slate-400 mt-1">Superadmin Area</div>
      </div>

      <nav className="p-3 space-y-3">
        {/* ===== MAIN ===== */}
        <div className="space-y-1">
          {main.map((m) => {
            const active = path === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cls(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                  "hover:bg-white/10 hover:text-white",
                  active
                    ? "bg-emerald-600/20 text-emerald-200 ring-1 ring-emerald-500/30"
                    : "text-slate-300"
                )}
              >
                <span className={cls(active ? "text-emerald-200" : "text-slate-400")}>
                  {m.icon}
                </span>
                <span>{m.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="px-3 pt-2 text-[11px] uppercase tracking-wider text-slate-500">
          Content
        </div>

        <div className="space-y-1">
          {content.map((m) => {
            const active = path === m.href || path.startsWith(m.href + "/");
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cls(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                  "hover:bg-white/10 hover:text-white",
                  active
                    ? "bg-emerald-600/20 text-emerald-200 ring-1 ring-emerald-500/30"
                    : "text-slate-300"
                )}
              >
                <span className={cls(active ? "text-emerald-200" : "text-slate-400")}>
                  {m.icon}
                </span>
                <span>{m.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
