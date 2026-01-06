"use client";

import React, { useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Konfirmasi",
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay (NO BLUR) */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={onCancel}
        className="absolute inset-0 bg-black/40"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-5 md:p-6"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 rounded-lg p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 p-2">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
