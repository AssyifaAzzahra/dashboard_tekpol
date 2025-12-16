"use client";

import React, { useMemo, useState } from "react";
import { ShieldCheck, XCircle } from "lucide-react";
import TekpolTile, { StatusPill } from "@/components/ui/TekpolTile";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Category = "HO" | "REGIONAL";

type App = {
  id: string;
  name: string;
  category: Category;
  username: string;
  password: string;
  description?: string | null;
};

type User = { id: string; name: string; email?: string | null };

type Approval = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  decidedAt?: string | Date | null;
  approver: User;
};

type RequestRow = {
  id: string;
  type: "PKWT" | "GUEST";
  status: Decision;
  rejectionNote?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  division?: string | null;
  reason?: string | null;
  app: App;
  requester?: User | null;
  approvals: Approval[];
  pic: User | null;
};

type PatchApprovalBody = {
  id: string; // requestId
  decision: "APPROVED" | "REJECTED";
  note?: string;
};

type PatchApprovalOk = { ok: true };
type PatchApprovalErr = { error: string };
type PatchApprovalResponse = PatchApprovalOk | PatchApprovalErr;

function isPatchApprovalErr(x: PatchApprovalResponse): x is PatchApprovalErr {
  return typeof (x as PatchApprovalErr).error === "string";
}

export default function ApprovalClient({
  role,
  rows,
  onDone,
}: {
  role: Role;
  rows: RequestRow[];
  onDone?: () => Promise<void> | void;
}) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const loadingSet = useMemo(() => new Set(loadingIds), [loadingIds]);

  async function decide(requestIdRaw: string, decision: "APPROVED" | "REJECTED") {
    const requestId = (requestIdRaw ?? "").trim();

    if (!requestId) {
      alert("ERROR: Request ID kosong. Tidak akan mengirim request.");
      console.error("DECIDE DIPANGGIL TANPA ID ❌", { requestIdRaw, decision });
      return;
    }

    const note =
      decision === "REJECTED"
        ? window.prompt("Alasan penolakan? (opsional)") || ""
        : undefined;

    setLoadingIds((s) => (s.includes(requestId) ? s : [...s, requestId]));

    try {
      const body: PatchApprovalBody = { id: requestId, decision, note };

      const res = await fetch("/api/approval", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json().catch(() => {
        const fallback: PatchApprovalErr = { error: "Response bukan JSON" };
        return fallback;
      })) as PatchApprovalResponse;

      if (!res.ok) {
        const msg = isPatchApprovalErr(data) ? data.error : "Gagal memproses";
        throw new Error(msg);
      }

      if (isPatchApprovalErr(data)) {
        throw new Error(data.error);
      }

      await onDone?.();
    } catch (e) {
      alert((e as Error).message || "Terjadi kesalahan");
      console.error("Error approve/reject:", e);
    } finally {
      setLoadingIds((s) => s.filter((x) => x !== requestId));
    }
  }

  return (
    <main className="space-y-4 relative z-[9999] pointer-events-auto">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <h1 className="text-lg md:text-xl font-bold">
          Approval <span className="text-emerald-400">({role})</span>
        </h1>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => {
          const id = r.id?.trim();
          if (!id) {
            console.error("ROW TANPA ID ❌", r);
            return null;
          }

          // Approval yang relevan untuk role user, fallback ke approval pertama
          const you = r.approvals.find((a) => a.role === role) ?? r.approvals[0];

          const pending =
            r.status === "PENDING" &&
            you?.decision !== "APPROVED" &&
            you?.decision !== "REJECTED";

          const busy = loadingSet.has(id);
          const requesterLabel = r.requester?.name ?? r.guestName ?? "Tamu";

          return (
            <TekpolTile
              key={id}
              icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
              title={`${r.app.name} — ${r.type}`}
              tag={r.app.category}
              overlay={busy ? <LoadingOverlay text="Memproses..." /> : undefined}
              desc={
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    Requester:{" "}
                    <span className="text-slate-200">{requesterLabel}</span>
                  </div>

                  {r.division && (
                    <div>
                      Divisi: <span className="text-slate-200">{r.division}</span>
                    </div>
                  )}

                  {r.reason && (
                    <div>
                      Alasan: <span className="text-slate-200">{r.reason}</span>
                    </div>
                  )}

                  {r.pic && (
                    <div>
                      PIC: <span className="text-slate-200">{r.pic.name}</span>
                    </div>
                  )}
                </div>
              }
              rightSlot={<StatusPill value={r.status} />}
              asButton={false}
              footer={
                pending ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const ok = window.confirm("Yakin setujui permohonan ini?");
                        if (!ok) return;

                        void decide(id, "APPROVED");
                      }}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 disabled:opacity-60 pointer-events-auto"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void decide(id, "REJECTED");
                      }}
                      className="rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white text-xs px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-60 pointer-events-auto"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    Selesai oleh {you?.approver?.name ?? "—"}
                  </div>
                )
              }
            />
          );
        })}
      </div>
    </main>
  );
}
