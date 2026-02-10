"use client";

import React from "react";

type Category = "HO" | "REGIONAL";
type App = {
  id: string;
  name: string;
  category: Category;
  url?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  username?: string | null;
  password?: string | null;
};

export default function AdminAppsCredentialsClient() {
  const [apps, setApps] = React.useState<App[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState<App | null>(null);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/apps", { cache: "no-store" });
      const json = await res.json();
      setApps(Array.isArray(json) ? json : []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  function openEdit(app: App) {
    setOpen(app);
    setUsername(app.username ?? "");
    setPassword(app.password ?? "");
    setMsg(null);
  }

  async function save() {
    if (!open) return;
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/admin/apps/${open.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() ? username.trim() : null,
          password: password.trim() ? password.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error ?? "Gagal menyimpan");
        return;
      }

      setMsg("Tersimpan ✅");
      setOpen(null);
      await load();
    } catch {
      setMsg("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-5">Memuat…</div>;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-5">
      <h1 className="text-xl font-bold">Admin — Kelola Username & Password</h1>
      <p className="text-sm text-slate-500 mt-1">
        Klik aplikasi untuk tambah/edit credentials.
      </p>

      <div className="mt-4 grid gap-2">
        {apps.map((a) => (
          <button
            key={a.id}
            onClick={() => openEdit(a)}
            className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            type="button"
          >
            <div className="font-semibold">{a.name}</div>
            <div className="text-xs text-slate-500">
              Username: {a.username ? "✅ ada" : "—"} | Password: {a.password ? "✅ ada" : "—"}
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-bold">Edit: {open.name}</div>
              <button className="px-3 py-1 border rounded-lg" onClick={() => setOpen(null)} type="button">
                Tutup
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <div className="text-sm text-slate-600 mb-1">Username</div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="username..."
                />
              </div>
              <div>
                <div className="text-sm text-slate-600 mb-1">Password</div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="password..."
                />
              </div>

              {msg ? (
                <div className="text-sm rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  {msg}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpen(null)}
                  className="px-4 py-2 rounded-xl border"
                  type="button"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
                  type="button"
                  disabled={saving}
                >
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
