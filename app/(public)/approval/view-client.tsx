"use client";

import React, { useMemo, useState } from "react";
import { ShieldCheck, XCircle } from "lucide-react";
import TekpolTile, { StatusPill } from "@/components/ui/TekpolTile";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import ConfirmModal from "@/components/ui/ConfirmModal";

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
  id: string;
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

  // modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRequestId, setConfirmRequestId] = useState<string | null>(null);

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

      const rawText = await res.text();

      let data: PatchApprovalResponse = { ok: true };
      if (rawText) {
        try {
          data = JSON.parse(rawText) as PatchApprovalResponse;
        } catch {
          data = { error: rawText };
        }
      }

      if (!res.ok) {
        const msg = isPatchApprovalErr(data)
          ? data.error
          : `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      if (isPatchApprovalErr(data)) {
        throw new Error(data.error);
      }

      await onDone?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
      alert(msg);
      console.error("Error approve/reject:", e);
    } finally {
      setLoadingIds((s) => s.filter((x) => x !== requestId));
    }
  }

  function openApproveConfirm(requestId: string) {
    setConfirmRequestId(requestId);
    setConfirmOpen(true);
  }

  function closeApproveConfirm() {
    setConfirmOpen(false);
    setConfirmRequestId(null);
  }

  const confirmBusy =
    confirmRequestId ? loadingSet.has(confirmRequestId) : false;

  return (
    <main className="space-y-4 relative">
      <ConfirmModal
        open={confirmOpen}
        title="Setujui Permohonan"
        message="Apakah Anda yakin ingin menyetujui permohonan akses ini?"
        confirmText="Ya, Setujui"
        cancelText="Batal"
        loading={confirmBusy}
        onCancel={closeApproveConfirm}
        onConfirm={async () => {
          if (!confirmRequestId) return;
          const id = confirmRequestId;
          closeApproveConfirm();
          await decide(id, "APPROVED");
        }}
      />

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

          const kasubagApproval = r.approvals.find((a) => a.role === "KASUBAG");
          const kasubagStillPending =
            (kasubagApproval?.decision ?? "PENDING") === "PENDING";

          // ✅ hak approve:
          // - KASUBAG selalu bisa saat request pending
          // - KABAG hanya bisa jika KASUBAG masih pending
          const canApproveThisRequest =
            role === "KASUBAG" || (role === "KABAG" && kasubagStillPending);

          const pending = r.status === "PENDING";

          const busy = loadingSet.has(id);
          const requesterLabel = r.requester?.name ?? r.guestName ?? "Tamu";

          // siapa yang tampil sebagai "selesai oleh"
          const decidedBy =
            r.approvals.find((a) => a.decision !== "PENDING") ?? kasubagApproval;

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
                  canApproveThisRequest ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openApproveConfirm(id);
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
                      Menunggu keputusan KASUBAG
                    </div>
                  )
                ) : (
                  <div className="text-xs text-slate-400">
                    Selesai oleh {decidedBy?.approver?.name ?? "—"}
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
