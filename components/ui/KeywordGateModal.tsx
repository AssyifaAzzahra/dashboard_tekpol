"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { KeyRound, X } from "lucide-react";

type KeywordGateModalProps = {
  open: boolean;
  title: string;
  description?: string;
  loading?: boolean;
  errorText?: string;
  onCancel: () => void;
  onSubmit: (keyword: string) => void;
};

export default function KeywordGateModal({
  open,
  title,
  description = "Masukkan kata kunci untuk membuka menu ini.",
  loading = false,
  errorText,
  onCancel,
  onSubmit,
}: KeywordGateModalProps) {
  const [keyword, setKeyword] = useState("");
  const keywordRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // selalu sync keyword ke ref (biar keydown handler bisa baca yang terbaru)
  useEffect(() => {
    keywordRef.current = keyword;
  }, [keyword]);

  const canSubmit = useMemo(
    () => keyword.trim().length > 0 && !loading,
    [keyword, loading]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ IMPORTANT: effect ini hanya bergantung pada `open`
  useEffect(() => {
    if (!open) return;

    // reset sekali saat modal dibuka
    setKeyword("");

    const t = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();

      if (e.key === "Enter") {
        const current = keywordRef.current.trim();
        if (current.length > 0 && !loading) {
          onSubmit(current);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel, onSubmit, loading]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onMouseDown={onCancel}
        aria-hidden="true"
      />

      {/* card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-2xl p-5 md:p-6"
        onMouseDown={(e) => e.stopPropagation()}
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
            <KeyRound className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
            Kata kunci
          </label>

          <input
            ref={inputRef}
            type="password"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Masukkan kata kunci..."
            className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700 bg-white/90 dark:bg-slate-900/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
          />

          {errorText ? (
            <div className="mt-2 text-xs text-rose-600 dark:text-rose-400">
              {errorText}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => onSubmit(keyword.trim())}
            disabled={!canSubmit}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
          >
            {loading ? "Memeriksa..." : "Buka"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
