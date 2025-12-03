// components/home/PksList.tsx
'use client';

import { Factory, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import BackBar from '@/components/shared/BackBar';
import type { Pks } from '@/lib/types';

export default function PksList({
  list,
  onBack,
  onSelect,
}: {
  list: Pks[];
  onBack: () => void;
  onSelect: (id: string) => void;
}) {

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5">
      <BackBar onBack={onBack} />
      <h2 className="text-xl font-bold">PKS PT.Perkebunan Nusantara IV Regional III</h2>
      <p className="text-sm text-slate-500 mt-1">Klik salah satu pabrik untuk melihat detail profilnya.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {list.map((pks) => (
          <motion.article
            key={pks.id}
            whileHover={{ y: -2 }}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/70 p-4 hover:shadow-md transition cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(pks.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Factory className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold leading-tight truncate">{pks.nama}</h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-medium">Jenis:</span> {pks.jenis}
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-medium">Alamat:</span> {pks.alamat}
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-medium">Kapasitas:</span> {pks.kapasitasTbsPerJam} TBS/jam
                </p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
