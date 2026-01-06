"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY || 0;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const percent = docHeight <= 0 ? 0 : (scrollTop / docHeight) * 100;
      setPct(Math.max(0, Math.min(100, percent)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-[60] h-1 w-full bg-transparent">
      <div
        className="h-full bg-emerald-600 transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
