'use client';

import BackBar from '@/components/shared/BackBar';
import { Leaf } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function PpkrDetail({ onBack }: { onBack: () => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Data PPKR
  const ppkrData = {
    nama: 'PPKR Sei Lindai',
    fotoPpkr: '/images/ppkr.jpg',
    fotoStruktur: '/images/ppkr/strukturppkr.png',
    fotoSertifikasi: '/images/sertifikasiPpkr.png',
    sejarahSingkat: `PPKR (Pabrik Pengolahan Karet) Sei Lindai merupakan salah satu unit pengolahan karet milik PT Perkebunan Nusantara IV Regional III yang berlokasi di Kabupaten Rokan Hilir, Provinsi Riau. Pabrik ini berdiri sejak tahun 1998 dengan luas areal sekitar 6 hektare.
Pabrik ini memiliki kapasitas produksi hingga 120 ton karet olahan per bulan dengan produk utama berupa RSS (Ribbed Smoked Sheet) dan SIR 20 (Standard Indonesian Rubber). Bahan baku lateks dipasok dari kebun-kebun karet di sekitar wilayah operasional PTPN IV Regional III.
PPKR Sei Lindai berkomitmen untuk menghasilkan produk karet berkualitas tinggi yang memenuhi standar SNI (Standar Nasional Indonesia) dan spesifikasi buyer internasional, dengan menerapkan sistem quality control yang ketat di setiap tahapan produksi.`,
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5">
        <BackBar onBack={onBack} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <Leaf className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold">{ppkrData.nama}</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Detail profil {ppkrData.nama}.
        </p>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {/* Foto PPKR */}
          <div
            className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video group cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
            onClick={() => setSelectedImage(ppkrData.fotoPpkr)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="absolute bottom-3 left-3 z-20 text-white font-semibold">
              Foto PPKR
            </div>
            <Image
              src={ppkrData.fotoPpkr}
              alt="Foto PPKR"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Struktur */}
          <div
            className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
            onClick={() => setSelectedImage(ppkrData.fotoStruktur)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="absolute bottom-3 left-3 z-20 text-white font-semibold">
              Struktur PPKR
            </div>
            <Image
              src={ppkrData.fotoStruktur}
              alt="Struktur PPKR"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Sertifikasi */}
          <div
            className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video group cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
            onClick={() => setSelectedImage(ppkrData.fotoSertifikasi)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <div className="absolute bottom-3 left-3 z-20 text-white font-semibold">
              Sertifikasi
            </div>
            <Image
              src={ppkrData.fotoSertifikasi}
              alt="Sertifikasi"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>

        {/* Profil Singkat */}
        <div>
          <h3 className="font-bold text-lg mb-3">Profil Singkat</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {ppkrData.sejarahSingkat}
          </p>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-emerald-400 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative w-full aspect-video">
              <Image
                src={selectedImage}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
