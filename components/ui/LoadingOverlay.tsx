"use client";

import React from "react";

export default function LoadingOverlay({
  text = "Loading...",
  logoSrc = "/ptpn4-logo.png",
}: {
  text?: string;
  logoSrc?: string;
}) {
  return (
    <div className="absolute inset-0 z-[50] rounded-2xl bg-slate-950/35 backdrop-blur-[2px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={logoSrc}
              alt="PTPN4"
              className="w-8 h-8 object-contain drop-shadow"
            />
          </div>
        </div>
        <div className="text-xs text-white/90">{text}</div>
      </div>
    </div>
  );
}
