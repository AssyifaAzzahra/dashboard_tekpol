// components/home/ClickableCard.tsx
'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

export default function ClickableCard({
  title,
  desc,
  icon,
  onClick,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5 hover:shadow-lg hover:border-emerald-300/60 transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition" />
          </div>
          <p className="text-sm text-slate-500 mt-1">{desc}</p>
          <p className="text-xs mt-3 text-emerald-700 dark:text-emerald-300/90">Klik untuk melihat detail</p>
        </div>
      </div>
    </motion.button>
  );
}
