// components/home/ProfileCards.tsx
'use client';

import ClickableCard from './ClickableCard';
import { Factory, Package2, Leaf } from 'lucide-react';

export default function ProfileCards({
  onPks,
  onPpis,
  onPpkr,
}: {
  onPks: () => void;
  onPpis: () => void;
  onPpkr: () => void;
}) {
  return (
    <section className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ClickableCard
        title="Profil PKS"
        desc="Profil 12 Pabrik Kelapa Sawit di PTPN IV Regional III. Lihat jenis PKS, alamat, dan kapasitas TBS/jam."
        icon={<Factory className="w-5 h-5" />}
        onClick={onPks}
      />
      <ClickableCard
        title="Profil PPIS"
        desc="Profil Pabrik Pengolahan Inti Sawit (Kernel Crushing Plant)."
        icon={<Package2 className="w-5 h-5" />}
        onClick={onPpis}
      />
      <ClickableCard
        title="Profil PPKR"
        desc="Profil Pabrik Pengolahan Karet. Informasi jenis produk, alur proses, dan kapasitas."
        icon={<Leaf className="w-5 h-5" />}
        onClick={onPpkr}
      />
    </section>
  );
}
