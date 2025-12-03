'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import type { LinkItem } from '@/lib/types';
import ContentItemRow from './ContentItemRow';
import { cls } from '@/lib/utils';

/**
 * Satu kolom/section berjudul (mis. "Halaman Muka", "Web APK", "2023")
 * Default TERBUKA (defaultOpen = true).
 */
export default function ContentGroup({
  title,
  items,
  defaultOpen = true,
}: {
  title: string;
  items: LinkItem[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-900/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cls(
          'w-full flex items-center justify-between px-4 py-3 rounded-t-2xl',
          'bg-slate-900/60'
        )}
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold text-slate-100">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="p-3 space-y-2">
          {items.map((it) => (
            <ContentItemRow key={it.id} item={it} />
          ))}
          {items.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-6">Belum ada item.</div>
          )}
        </div>
      )}
    </div>
  );
}
