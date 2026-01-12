"use client";

import React from "react";

export default function AdminShell({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 text-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
        {children}
      </div>
    </div>
  );
}
