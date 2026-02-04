"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { Input } from "@/components/ui/input";
import { cls } from "@/lib/utils";
import {
  Search,
  RefreshCcw,
  UserPlus,
  Users,
  Shield,
  Mail,
  KeyRound,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  IdCard,
  BriefcaseBusiness,
} from "lucide-react";

type Role =
  | "SUPERADMIN"
  | "ADMIN"
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST";

type UserItem = {
  id: string;
  name: string;
  email: string | null;
  sapNo: string | null;
  jabatan: string | null;
  role: Role;
  isPic: boolean;
  createdAt: string;
};

const ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "PKWT",
  "KARYAWAN",
  "KASUBAG",
  "KABAG",
  "GUEST",
] as const;

function parseRole(v: string): Role {
  return (ROLES as readonly string[]).includes(v) ? (v as Role) : "PKWT";
}

function badgeRole(r: Role) {
  if (r === "SUPERADMIN")
    return "bg-emerald-50 text-emerald-900 border-emerald-200";
  if (r === "ADMIN") return "bg-sky-50 text-sky-900 border-sky-200";
  if (r === "KABAG" || r === "KASUBAG")
    return "bg-amber-50 text-amber-900 border-amber-200";
  return "bg-slate-50 text-slate-900 border-slate-200";
}

// ✅ Pilihan Jabatan (silakan tambah/ubah sesuai kebutuhan)
const JABATAN_OPTIONS = [
  "Kepala Bagian",
  "Senior Konsultan Tekpol",
  "Junior Konsultan Internal Bagian Tekpol",

  "Ka. Sub Bagian Investasi dan Eksploitasi Pabrik",
  "Ka. Sub Bagian Teknik dan Infrastruktur Kebun",
  "Ka. Sub Bagian Pengolahan",

  "Asisten Mesin dan Instalasi Pabrik",
  "Asisten Traksi & Alat Berat Kebun",
  "Asisten Sipil & Infrastruktur Kebun",
  "Asisten Proses Pengolahan Kelapa Sawit",
  "Asisten Proses & Evaluasi Pengolahan Karet",
  "Asisten QC Pengolahan Kelapa Sawit",

  "Krani Urusan Teknik dan Pengolahan Komoditi Kelapa Sawit",
  "Krani Kepala Bagian Teknik dan Pengolahan",
  "Krani Urusan Administrasi Sekretariat",
  "Krani Urusan Administrasi Teknik dan Pengolahan",
  "Krani Urusan Traksi",
  "Krani Urusan Infrastruktur Produksi",
  "Krani Urusan Administrasi",
  "Krani Maintenance IoT dan Engineering",
  "Krani PPQM",
  "Krani Drafter Tekpol",

  "PKWT Urusan Sipil",
  "PKWT / Krani Urusan Sipil",
  "PKWT Pembantu Mekanik Workshop SGH",
] as const;

type Jabatan = (typeof JABATAN_OPTIONS)[number] | ""; // "" untuk belum pilih

function inferRoleFromJabatan(jabatan: string): Role {
  const j = jabatan.toLowerCase();

  if (!j) return "PKWT"; // default awal (boleh kamu ubah)

  if (j.includes("kepala bagian")) return "KABAG";
  if (j.includes("ka. sub bagian") || j.includes("ka sub bagian") || j.includes("kasub"))
    return "KASUBAG";
  if (j.includes("pkwt")) return "PKWT";

  // selain itu dianggap karyawan
  return "KARYAWAN";
}

type CreateForm = {
  name: string;
  email: string;
  sapNo: string;
  jabatan: Jabatan;
  password: string;
  role: Role;
  isPic: boolean;
};

type EditForm = {
  name: string;
  email: string;
  sapNo: string;
  jabatan: Jabatan;
  role: Role;
  isPic: boolean;
  resetPassword: string;
};

async function readErrorText(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      return JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return "";
  }
}

function monoId(id: string) {
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

function Panel({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />

      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500" />
              <div className="text-sm font-semibold text-slate-950">{title}</div>
            </div>
            {subtitle ? <div className="mt-0.5 text-xs text-slate-600">{subtitle}</div> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [createForm, setCreateForm] = useState<CreateForm>({
    name: "",
    email: "",
    sapNo: "",
    jabatan: "",
    password: "",
    role: "PKWT",
    isPic: false,
  });

  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    email: "",
    sapNo: "",
    jabatan: "",
    role: "PKWT",
    isPic: false,
    resetPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        const t = await readErrorText(res);
        setErr(`Gagal load users. (${res.status}) ${t}`);
        return;
      }
      const data = (await res.json()) as UserItem[];
      setUsers(data);
      setPage(1);
    } catch {
      setErr("Terjadi error jaringan saat load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  const didInit = useRef(false);
  if (!didInit.current) {
    didInit.current = true;
    void load();
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(s) ||
        (u.email ?? "").toLowerCase().includes(s) ||
        (u.sapNo ?? "").toLowerCase().includes(s) ||
        (u.jabatan ?? "").toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s) ||
        (u.isPic ? "pic" : "nonpic").includes(s)
      );
    });
  }, [users, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageUsers = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const pick = useCallback((u: UserItem) => {
    setSelected(u);
    setErr(null);
    setEditForm({
      name: u.name,
      email: u.email ?? "",
      sapNo: u.sapNo ?? "",
      jabatan: (u.jabatan ?? "") as Jabatan,
      role: u.role,
      isPic: u.isPic,
      resetPassword: "",
    });
  }, []);

  const clearSelected = useCallback(() => {
    setSelected(null);
    setErr(null);
    setEditForm((p) => ({ ...p, resetPassword: "" }));
  }, []);

  const create = useCallback(async () => {
    setErr(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal create user. (${res.status}) ${t}`);
      return;
    }

    setCreateForm({
      name: "",
      email: "",
      sapNo: "",
      jabatan: "",
      password: "",
      role: "PKWT",
      isPic: false,
    });

    await load();
  }, [createForm, load]);

  const update = useCallback(async () => {
    if (!selected) return;

    setErr(null);

    const payload: {
      name: string;
      email: string;
      sapNo: string;
      jabatan: string;
      role: Role;
      isPic: boolean;
      resetPassword?: string;
    } = {
      name: editForm.name,
      email: editForm.email,
      sapNo: editForm.sapNo,
      jabatan: editForm.jabatan,
      role: editForm.role,
      isPic: editForm.isPic,
    };

    const reset = editForm.resetPassword.trim();
    if (reset) payload.resetPassword = reset;

    const id = encodeURIComponent(selected.id);

    const res = await fetch(`/api/admin/users?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal update user. (${res.status}) ${t}`);
      return;
    }

    await load();
    setEditForm((p) => ({ ...p, resetPassword: "" }));
  }, [selected, editForm, load]);

  // ✅ handler ketika jabatan dipilih: set jabatan + auto role
  const onPickCreateJabatan = (jabatan: Jabatan) => {
    setCreateForm((p) => ({
      ...p,
      jabatan,
      role: jabatan ? inferRoleFromJabatan(jabatan) : p.role,
    }));
  };

  const onPickEditJabatan = (jabatan: Jabatan) => {
    setEditForm((p) => ({
      ...p,
      jabatan,
      role: jabatan ? inferRoleFromJabatan(jabatan) : p.role,
    }));
  };

  const remove = useCallback(async () => {
    if (!selected) return;

    const ok = confirm(`Hapus user "${selected.name}"?`);
    if (!ok) return;

    setErr(null);

    const id = encodeURIComponent(selected.id);
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });

    if (!res.ok) {
      const t = await readErrorText(res);
      setErr(`Gagal delete user. (${res.status}) ${t}`);
      return;
    }

    setSelected(null);
    await load();
  }, [selected, load]);

  return (
    <AdminShell title="Users" subtitle="Kelola user, role, dan PIC (clean UI + pagination)">
      {err && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-900 px-3 py-2 text-sm shadow-sm">
          {err}
        </div>
      )}

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-950">{total}</span> users
          {loading ? <span className="ml-2 text-slate-500">• loading…</span> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
            onClick={load}
            type="button"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.99] transition"
            onClick={clearSelected}
            type="button"
          >
            <Users className="h-4 w-4" />
            Clear Selected
          </button>
        </div>
      </div>

      <Panel title="Search" subtitle="Cari berdasarkan nama / email / SAP / jabatan / role / PIC">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-9 rounded-xl border-slate-200 focus-visible:ring-slate-200"
            placeholder="Cari user..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Panel>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        {/* table */}
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-700" />
              <div className="text-sm font-semibold text-slate-950">Daftar Users</div>
            </div>

            <div className="text-xs text-slate-600">
              Page <span className="font-semibold text-slate-950">{safePage}</span> / {totalPages}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left bg-slate-50 sticky top-0 z-10">
                <tr className="text-slate-600">
                  <th className="p-3">User</th>
                  <th className="p-3">No. SAP</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">PIC</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((u) => {
                  const active = selected?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className={cls(
                        "border-t border-slate-200 cursor-pointer transition",
                        "hover:bg-slate-50/70",
                        active && "bg-slate-50"
                      )}
                      onClick={() => pick(u)}
                    >
                      <td className="p-3">
                        <div className="font-medium text-slate-950">{u.name}</div>
                        <div className="mt-0.5 text-xs text-slate-600 flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {u.email ?? "-"}
                        </div>
                      </td>

                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <IdCard className="h-4 w-4 text-slate-400" />
                          {u.sapNo ?? "-"}
                        </span>
                      </td>

                      <td className="p-3 text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                          {u.jabatan ?? "-"}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={cls(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                            badgeRole(u.role)
                          )}
                        >
                          <Shield className="h-3.5 w-3.5 mr-1" />
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3 text-slate-800">
                        {u.isPic ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-800">
                            No
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}

                {!loading && total === 0 && (
                  <tr>
                    <td colSpan={6} className="p-5 text-slate-600">
                      No users.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={6} className="p-5 text-slate-600">
                      Memuat data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Menampilkan{" "}
              <span className="font-semibold text-slate-950">
                {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)}
              </span>{" "}
              dari <span className="font-semibold text-slate-950">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* forms */}
        <div className="space-y-4">
          <Panel title="Create User" subtitle="Tambah user baru (Email atau No. SAP)">
            <div className="grid gap-2">
              <Input
                className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                placeholder="Nama"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
              />

              <div className="grid md:grid-cols-2 gap-2">
                <Input
                  className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                  placeholder="No. SAP (opsional)"
                  value={createForm.sapNo}
                  onChange={(e) => setCreateForm((p) => ({ ...p, sapNo: e.target.value }))}
                />
                <Input
                  className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                  placeholder="Email (opsional)"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              {/* ✅ Jabatan dropdown */}
              <select
                className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={createForm.jabatan}
                onChange={(e) => onPickCreateJabatan(e.target.value as Jabatan)}
              >
                <option value="">Pilih Jabatan / Posisi</option>
                {JABATAN_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>

              {/* role (auto berubah, tapi masih bisa override) */}
              <select
                className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: parseRole(e.target.value) }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <Input
                className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                placeholder="Password (min 6)"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              />

              <label className="text-sm flex items-center gap-2 text-slate-800">
                <input
                  type="checkbox"
                  className="accent-indigo-600"
                  checked={createForm.isPic}
                  onChange={(e) => setCreateForm((p) => ({ ...p, isPic: e.target.checked }))}
                />
                isPIC
              </label>

              <button
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 shadow-sm hover:bg-emerald-100 active:scale-[0.99] transition w-fit"
                onClick={create}
                type="button"
              >
                <UserPlus className="h-4 w-4" />
                Create
              </button>
            </div>
          </Panel>

          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
              <div className="text-sm font-semibold text-slate-950">Edit Selected</div>
              <div className="text-xs text-slate-600">
                {selected ? (
                  <>
                    ID: <span className="font-mono">{monoId(selected.id)}</span>
                  </>
                ) : (
                  "Pilih user dari tabel"
                )}
              </div>
            </div>

            <div className="p-4 md:p-5">
              {!selected ? (
                <div className="text-sm text-slate-600">Klik user di tabel untuk edit.</div>
              ) : (
                <div className="grid gap-2">
                  <div className="grid md:grid-cols-2 gap-2">
                    <Input
                      className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                      placeholder="Nama"
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    <Input
                      className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                      placeholder="Email (opsional)"
                      value={editForm.email}
                      onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-2">
                    <Input
                      className="rounded-xl border-slate-200 focus-visible:ring-slate-200"
                      placeholder="No. SAP (opsional)"
                      value={editForm.sapNo}
                      onChange={(e) => setEditForm((p) => ({ ...p, sapNo: e.target.value }))}
                    />
                    {/* ✅ Jabatan dropdown */}
                    <select
                      className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
                      value={editForm.jabatan}
                      onChange={(e) => onPickEditJabatan(e.target.value as Jabatan)}
                    >
                      <option value="">Pilih Jabatan / Posisi</option>
                      {JABATAN_OPTIONS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    className="border border-slate-200 bg-white text-slate-900 rounded-xl px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-200"
                    value={editForm.role}
                    onChange={(e) => setEditForm((p) => ({ ...p, role: parseRole(e.target.value) }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <label className="text-sm flex items-center gap-2 text-slate-800">
                    <input
                      type="checkbox"
                      className="accent-indigo-600"
                      checked={editForm.isPic}
                      onChange={(e) => setEditForm((p) => ({ ...p, isPic: e.target.checked }))}
                    />
                    isPIC
                  </label>

                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      className="pl-9 rounded-xl border-slate-200 focus-visible:ring-slate-200"
                      placeholder="Reset Password (optional)"
                      value={editForm.resetPassword}
                      onChange={(e) => setEditForm((p) => ({ ...p, resetPassword: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 shadow-sm hover:bg-sky-100 active:scale-[0.99] transition"
                      onClick={update}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                      Update
                    </button>

                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 shadow-sm hover:bg-rose-100 active:scale-[0.99] transition"
                      onClick={remove}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
