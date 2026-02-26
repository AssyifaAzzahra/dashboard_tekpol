"use client";

import React from "react";
import { ExternalLink, Search, X, KeyRound, Send } from "lucide-react";
import { createPortal } from "react-dom";
import type { App, MyReq, Role, User } from "./types";

type Props = {
  role: Role;
  apps: App[];
  myReqs: MyReq[];
  pics: User[];
  currentUserName?: string;
};

function normalizeUrl(v?: string | null) {
  if (!v) return "#";
  const t = v.trim();
  if (!t) return "#";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function defaultDesc(cat: App["category"]) {
  return cat === "HO" ? "Aplikasi HO" : "Aplikasi Regional";
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function AppsClient({
  role,
  apps,
  myReqs,
  pics,
  currentUserName,
}: Props) {
  const [query, setQuery] = React.useState("");

  // modal kredensial
  const [openApp, setOpenApp] = React.useState<App | null>(null);

  // modal request akses
  const [reqApp, setReqApp] = React.useState<App | null>(null);
  const [reqName, setReqName] = React.useState(currentUserName ?? "");
  const [reqDivision, setReqDivision] = React.useState("");
  const [reqReason, setReqReason] = React.useState("");
  const [reqLoading, setReqLoading] = React.useState(false);
  const [reqMsg, setReqMsg] = React.useState<string | null>(null);

  const canSeeCreds = role === "KARYAWAN" || role === "SUPERADMIN";

  // filter apps by query (SAMA PERSIS TekpolAppsSection)
  const filteredApps = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;

    return apps.filter((app) => {
      const name = (app.name ?? "").toLowerCase();
      const desc = (app.description ?? defaultDesc(app.category)).toLowerCase();
      const cat = (app.category ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [apps, query]);

  const safeUsername = openApp?.username?.trim() ? openApp.username.trim() : "-";
  const safePassword = openApp?.password?.trim() ? openApp.password.trim() : "-";
  const modalHref = normalizeUrl(openApp?.url);
  const hasModalLink = Boolean(openApp?.url && openApp.url.trim().length > 0);

  async function submitRequest() {
    if (!reqApp) return;

    setReqMsg(null);

    const name = reqName.trim();
    const division = reqDivision.trim();
    const reason = reqReason.trim();

    if (!name) return setReqMsg("Nama wajib diisi.");
    if (!division) return setReqMsg("Divisi wajib diisi.");
    if (reason.length < 5) return setReqMsg("Alasan minimal 5 karakter.");

    try {
      setReqLoading(true);

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GUEST",
          appId: reqApp.id,
          name,
          division,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReqMsg(data?.error ?? "Gagal mengirim request.");
        return;
      }

      setReqMsg("Request berhasil dikirim. Silakan tunggu persetujuan.");
      setReqReason("");
    } catch {
      setReqMsg("Terjadi kesalahan jaringan.");
    } finally {
      setReqLoading(false);
    }
  }

  function closeReqModal() {
    setReqApp(null);
    setReqMsg(null);
  }

  return (
    <section className="rounded-3xl overflow-hidden bg-white/60 border border-white/30 shadow-sm">
      <div className="p-5">
        {/* HEADER + SEARCH (SAMA PERSIS, judul beda) */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-1 text-2xl font-bold">
              Info Username &amp; Password
            </div>
            <div className="text-slate-600">
              {filteredApps.length} item{" "}
              {query.trim() ? (
                <span className="text-slate-500">(dari {apps.length})</span>
              ) : null}
            </div>
          </div>

          {/* Search Bar (SAMA PERSIS) */}
          <div className="w-full md:w-[360px]">
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-slate-200 px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari aplikasi..."
                className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
              />
              {query.trim() ? (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg hover:bg-slate-100"
                  title="Clear"
                  type="button"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* LIST (SAMA PERSIS TekpolAppsSection) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const logo: string = app.logoUrl ?? "";
            const desc = app.description ?? defaultDesc(app.category);

            return (
              <div
                key={app.id}
                className="
                  group rounded-2xl
                  bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/60
                  border border-slate-200
                  shadow-sm
                  hover:shadow-md
                  transition
                "
              >
                <div className="p-4 flex items-center gap-4">
                  {/* LOGO */}
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                      {logo ? (
                        <img
                          src={logo}
                          alt={app.name}
                          className="max-h-[85%] max-w-[85%] object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-xs font-medium text-slate-400">
                          LOGO
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-slate-900 font-semibold truncate text-[17px]">
                          {app.name}
                        </div>
                        <div className="text-slate-600 text-sm mt-1 truncate">
                          {desc}
                        </div>
                      </div>

                      {/* tombol: karyawan/superadmin = buka modal creds, lain = request */}
                      {canSeeCreds ? (
                        <button
                          type="button"
                          onClick={() => setOpenApp(app)}
                          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReqApp(app);
                            setReqMsg(null);
                          }}
                          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                        >
                          <span>Minta akses</span>
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* TAG */}
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-white/80 text-slate-700 border border-slate-200">
                        {app.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filteredApps.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
            Tidak ada aplikasi yang cocok dengan pencarian:{" "}
            <span className="font-semibold text-slate-800">{query}</span>
          </div>
        ) : null}
      </div>

      {/* MODAL KREDENSIAL */}
      {openApp && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpenApp(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-500" />
                <div className="font-semibold min-w-0 truncate">
                  {openApp.name}
                </div>
                <button
                  className="ml-auto p-2 rounded hover:bg-slate-100"
                  onClick={() => setOpenApp(null)}
                  aria-label="Tutup"
                  type="button"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-slate-500 mb-1">Username</div>
                  <div className="font-mono break-all">{safeUsername}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-slate-500 mb-1">Password</div>
                  <div className="font-mono break-all">{safePassword}</div>
                </div>

                {hasModalLink ? (
                  <div className="sm:col-span-2 rounded-xl border border-slate-200 p-3">
                    <div className="text-slate-500 mb-1">Link aplikasi</div>
                    <a
                      href={modalHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline break-all"
                    >
                      {modalHref}
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="px-5 py-4 border-t border-slate-200 text-right">
                <button
                  onClick={() => setOpenApp(null)}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold"
                  type="button"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* MODAL REQUEST AKSES */}
      {reqApp && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeReqModal}
          >
            <div
              className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-500" />
                <div className="font-semibold min-w-0 truncate">
                  Minta akses: {reqApp.name}
                </div>
                <button
                  className="ml-auto p-2 rounded hover:bg-slate-100"
                  onClick={closeReqModal}
                  aria-label="Tutup"
                  type="button"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-3 text-sm">
                <div>
                  <div className="text-slate-600 mb-1">Nama</div>
                  <input
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white/80 outline-none"
                    placeholder="Nama lengkap"
                  />
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Divisi</div>
                  <input
                    value={reqDivision}
                    onChange={(e) => setReqDivision(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white/80 outline-none"
                    placeholder="Contoh: Teknik Pengolahan"
                  />
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Alasan</div>
                  <textarea
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 bg-white/80 outline-none"
                    placeholder="Jelaskan kebutuhan akses (min 5 karakter)"
                  />
                </div>

                {reqMsg ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    {reqMsg}
                  </div>
                ) : null}
              </div>

              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={closeReqModal}
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm font-semibold"
                  type="button"
                  disabled={reqLoading}
                >
                  Batal
                </button>
                <button
                  onClick={submitRequest}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                  type="button"
                  disabled={reqLoading}
                >
                  {reqLoading ? "Mengirim…" : "Kirim request"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
}
