"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getPksNameByCode } from "@/lib/pks-list";

export default function PksDocumentUploadSection() {
  const { data } = useSession();

  const pksCode = data?.user?.pksCode ?? null; // ✅ type-safe
  const pksName = useMemo(() => getPksNameByCode(pksCode) ?? "-", [pksCode]);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    if (!file) {
      setMsg("Pilih file dulu.");
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/pks-documents", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Gagal upload");

      setMsg("✅ Upload berhasil. Dokumen dikirim ke admin.");
      setFile(null);

      const input = document.getElementById("pks-doc-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (e: any) {
      setMsg(`❌ ${e?.message || "Error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (!pksCode) {
    return (
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Fitur upload hanya tersedia untuk akun PKS.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Upload Dokumen PKS</h2>
        <p className="text-sm text-slate-500">
          PKS: <span className="font-semibold">{pksCode}</span> — {pksName}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 space-y-3">
        <div className="text-sm font-medium">Upload Dokumen</div>

        <input
          id="pks-doc-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Mengirim..." : "Kirim ke Admin"}
          </button>

          {file && (
            <div className="text-xs text-slate-500">
              Dipilih: <span className="font-medium">{file.name}</span>
            </div>
          )}
        </div>

        {msg && <div className="text-sm">{msg}</div>}

        <div className="text-xs text-slate-500">
          Maksimal 10MB. Format: PDF/DOC/DOCX/XLS/XLSX/PPT/PPTX/JPG/PNG.
        </div>
      </div>
    </div>
  );
}
