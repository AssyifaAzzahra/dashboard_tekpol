"use client";

import { useEffect, useState } from "react";
import type { HomeView, Pks } from "@/lib/types";

import HomeHero from "./HomeHero";
import ProfileCards from "./ProfileCards";
import PksList from "./PksList";
import PksDetailById from "./PksDetailById";
import PpisDetail from "./PpisDetail";
import PpkrDetail from "./PpkrDetail";
import NewsSection from "./NewsSection";

// ✅ TAMBAHAN
import InfoLoginSection from "@/components/apps/InfoLoginSection";

export default function HomeRouter({
  forcedView,
  onViewChange,
}: {
  forcedView?: HomeView;
  onViewChange?: (v: HomeView) => void;
}) {
  const [internalView, setInternalView] = useState<HomeView>("root");
  const [selectedPksId, setSelectedPksId] = useState<string | null>(null);

  const [pksList, setPksList] = useState<Pks[]>([]);
  const [loadingPks, setLoadingPks] = useState(false);

  const view = forcedView ?? internalView;

  // ✅ FIX: tidak double-call onViewChange
  const setView = (v: HomeView) => {
    if (forcedView !== undefined) {
      onViewChange?.(v);
    } else {
      setInternalView(v);
      onViewChange?.(v);
    }
  };

  // ==============================
  // FETCH PKS LIST
  // ==============================
  useEffect(() => {
    if (view !== "pks-list") return;

    const ac = new AbortController();

    (async () => {
      try {
        setLoadingPks(true);

        const res = await fetch("/api/public/unit/pks", {
          cache: "no-store",
          signal: ac.signal,
        });

        const json = await res.json();
        setPksList(Array.isArray(json) ? (json as Pks[]) : []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setPksList([]);
      } finally {
        if (!ac.signal.aborted) setLoadingPks(false);
      }
    })();

    return () => ac.abort();
  }, [view]);

  // ==============================
  // GUARD DETAIL
  // ==============================
  useEffect(() => {
    if (view === "pks-detail" && !selectedPksId) {
      setView("pks-list");
    }
  }, [view, selectedPksId]);

  // ==============================
  // ROUTING VIEW
  // ==============================

  if (view === "pks-list") {
    return (
      <PksList
        list={pksList}
        loading={loadingPks}
        onBack={() => setView("root")}
        onSelect={(id) => {
          setSelectedPksId(id);
          setView("pks-detail");
        }}
      />
    );
  }

  if (view === "pks-detail") {
    if (!selectedPksId) return null;

    return (
      <PksDetailById
        id={selectedPksId}
        onBack={() => setView("pks-list")}
      />
    );
  }

  if (view === "ppis") return <PpisDetail onBack={() => setView("root")} />;
  if (view === "ppkr") return <PpkrDetail onBack={() => setView("root")} />;

  // ✅ TAMBAHAN PENTING
  if (view === "info-login") {
    return <InfoLoginSection />;
  }

  // ==============================
  // DEFAULT ROOT
  // ==============================
  return (
    <>
      <HomeHero />
      <ProfileCards
        onPks={() => setView("pks-list")}
        onPpis={() => setView("ppis")}
        onPpkr={() => setView("ppkr")}
      />
      <NewsSection />
    </>
  );
}