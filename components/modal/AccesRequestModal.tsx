'use client';

import React, { useState } from 'react';
import { cls } from '@/lib/utils';

export default function AccessRequestModal({
  open,
  sending,
  itemTitle,
  onClose,
  onSubmit,
}: {
  open: boolean;
  sending: boolean;
  itemTitle?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});
  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-lg font-bold">Form Permohonan Akses</h3>
        <p className="text-sm text-slate-500 mt-1">
          Silakan isi data berikut sebelum membuka dokumen.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Baris input: Nama & Divisi */}
          <div className="grid sm:grid-cols-2 gap-3">
            <TextField
              label="Nama"
              name="nama"
              required
              value={form.nama}
              onChange={setForm}
            />
            <TextField
              label="Divisi"
              name="divisi"
              required
              value={form.divisi}
              onChange={setForm}
            />
          </div>

          {/* Tujuan Akses sebagai textarea */}
          <div>
            <label className="text-xs text-slate-500">Tujuan Akses</label>
            <textarea
              rows={4}
              required
              value={form.tujuan || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, tujuan: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-emerald-500/40"
              placeholder={
                itemTitle
                  ? `Contoh: Mohon akses untuk "${itemTitle}" (keperluan presentasi/review, dsb.)`
                  : 'Contoh: Keperluan review dokumen / presentasi / audit'
              }
            />
          </div>

          <div className="flex items-center justify-end pt-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
              disabled={sending}
            >
              Batal
            </button>
            <button
              type="submit"
              className={cls(
                'px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm inline-flex items-center gap-2',
                sending && 'opacity-70 cursor-not-allowed'
              )}
              disabled={sending}
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/60 border-b-transparent animate-spin" />
                  Mengirim…
                </>
              ) : (
                <>Ajukan & Lanjutkan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  required,
  type = 'text',
}: {
  label: string;
  name: string;
  value?: string;
  onChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input
        type={type}
        required={required}
        value={value || ''}
        onChange={(e) => onChange((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 ring-emerald-500/40"
      />
    </div>
  );
}
