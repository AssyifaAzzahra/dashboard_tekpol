// components/home/ProfileCards.tsx
'use client';

import ClickableCard from './ClickableCard';
import Image from 'next/image';

function CardIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={30}
      height={30}
      className="w-8 h-8"
    />
  );
}

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
        desc="Profil 12 Pabrik Kelapa Sawit di PTPN IV Regional III."
        icon={<CardIcon src="/icons/pks.png" alt="Icon PKS" />}
        onClick={onPks}
      />
      <ClickableCard
        title="Profil PPIS"
        desc="Profil Pabrik Pengolahan Inti Sawit (Kernel Crushing Plant)."
        icon={<CardIcon src="/icons/ppis.png" alt="Icon PPIS" />}
        onClick={onPpis}
      />
      <ClickableCard
        title="Profil PPKR"
        desc="Profil Pabrik Pengolahan Karet PTPN IV Regional 3."
        icon={<CardIcon src="/icons/ppkr.png" alt="Icon PPKR" />}
        onClick={onPpkr}
      />
    </section>
  );
}
