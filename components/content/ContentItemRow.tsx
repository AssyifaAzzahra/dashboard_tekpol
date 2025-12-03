'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, FileText, FolderOpen } from 'lucide-react';
import type { LinkItem } from '@/lib/types';
import { cls } from '@/lib/utils';

export default function ContentItemRow({ item }: { item: LinkItem }) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const [open, setOpen] = useState(false); // sub-item default tertutup

  if (hasChildren) {
    return (
      <div className="rounded-xl border border-slate-700/30 bg-slate-900/40">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl"
        >
          <div className="flex items-center gap-2 text-slate-200">
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm font-medium">{item.title}</span>
            {item.tag && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-800/70 border border-slate-700/50">
                {item.tag}
              </span>
            )}
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </button>

        {open && (
          <div className="px-3 pb-3 space-y-2">
            {item.children!.map((c) => (
              <a
                key={c.id}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className={cls(
                  'group flex items-center justify-between gap-2 rounded-lg px-3 py-2',
                  'bg-slate-800/50 border border-slate-700/40 hover:bg-slate-800/70'
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-300" />
                  <span className="text-sm text-slate-200">{c.title}</span>
                  {c.tag && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/70 border border-slate-700/50">
                      {c.tag}
                    </span>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      key={item.id}
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className={cls(
        'group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5',
        'bg-slate-900/40 border border-slate-700/30 hover:bg-slate-800/60'
      )}
    >
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-300" />
        <span className="text-sm text-slate-200">{item.title}</span>
        {item.tag && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/70 border border-slate-700/50">
            {item.tag}
          </span>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
    </a>
  );
}
