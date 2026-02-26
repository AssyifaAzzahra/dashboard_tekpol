'use client';

export default function HomeRoot({
  onGoPks,
}: {
  onGoPks: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-6 space-y-4">
      <h1 className="text-2xl font-bold">Beranda</h1>
      <p className="text-slate-500 text-sm">
        Silakan pilih menu PKS untuk melihat daftar pabrik.
      </p>

      <button
        onClick={onGoPks}
        className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Lihat Daftar PKS
      </button>
    </section>
  );
}
