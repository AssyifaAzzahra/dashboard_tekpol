// components/shared/BackBar.tsx
'use client';

import { ArrowLeft } from 'lucide-react';

export default function BackBar({ onBack, label = 'Kembali' }: { onBack: () => void; label?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}
