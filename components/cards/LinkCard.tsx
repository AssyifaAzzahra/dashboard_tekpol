import { ExternalLink, FileText } from 'lucide-react';
import { LinkItem } from '@/lib/types';


export default function LinkCard({ item, onRequest }: { item: LinkItem; onRequest: () => void }) {
  return (
    <article className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold leading-tight">{item.title}</h3>
          {item.desc && <p className="text-sm text-slate-500 mt-1 truncate">{item.desc}</p>}
          <div className="mt-2 flex items-center gap-2">
            {item.tag && (
              <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {item.tag}
              </span>
            )}
          </div>
        </div>
      </div>


      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={onRequest}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Ajukan & Buka
          <ExternalLink className="w-4 h-4" />
        </button>
        <a
          href={item.href}
          target="_blank"
          className="text-xs text-slate-400 hover:text-slate-500 underline underline-offset-4"
          rel="noreferrer"
          onClick={(e) => {
            e.preventDefault();
            onRequest();
          }}
        >
          lihat tautan
        </a>
      </div>
    </article>
  );
}