// components/ui/TekpolTile.tsx
'use client';

import { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { cls } from '@/lib/utils';

export function StatusPill({ value }: { value?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NONE' }) {
  const map: Record<string, string> = {
    NONE: 'bg-slate-700/30 text-slate-200',
    PENDING: 'bg-amber-500/15 text-amber-300',
    APPROVED: 'bg-emerald-500/15 text-emerald-300',
    REJECTED: 'bg-rose-500/15 text-rose-300',
  };
  const label: Record<string, string> = {
    NONE: 'Belum diajukan',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  const clsx = map[value ?? 'NONE'] ?? map.NONE;
  return <span className={cls('px-2 py-1 rounded-md text-xs font-semibold', clsx)}>{label[value ?? 'NONE']}</span>;
}

export default function TekpolTile({
  icon,
  title,
  tag,
  desc,
  rightSlot,
  footer,
  onPrimary,
  primaryText = 'Buka',
  asButton = false,
  href,
  className,
}: {
  icon: ReactNode;
  title: string;
  tag?: string;
  desc?: string | ReactNode;
  rightSlot?: ReactNode;         // misal <StatusPill value="PENDING" />
  footer?: ReactNode;            // misal tombol “Login”
  onPrimary?: () => void;
  primaryText?: string;
  asButton?: boolean;            // kalau true -> tombol, kalau false dan ada href -> <a>
  href?: string;
  className?: string;
}) {
  return (
    <div
      className={cls(
        'group rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60',
        'px-4 py-3 md:px-5 md:py-4 shadow-sm hover:shadow-md transition backdrop-blur',
        className
      )}
    >
      {/* header */}
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[15px] md:text-base leading-tight truncate">{title}</h3>
            {tag && <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-700/20">{tag}</span>}
          </div>
          {typeof desc === 'string' ? (
            <p className="text-sm text-slate-400 mt-1 truncate">{desc}</p>
          ) : (
            desc
          )}
        </div>

        {/* right slot (status / aksi ringkas) */}
        {rightSlot && <div className="shrink-0 ml-2">{rightSlot}</div>}
      </div>

      {/* footer */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {footer ?? <div />}
        {asButton ? (
          <button
            onClick={onPrimary}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm px-3 py-2"
          >
            {primaryText} <ExternalLink className="w-4 h-4" />
          </button>
        ) : href ? (
          <a
            href={href}
            rel="noreferrer"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm px-3 py-2"
          >
            {primaryText} <ExternalLink className="w-4 h-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
