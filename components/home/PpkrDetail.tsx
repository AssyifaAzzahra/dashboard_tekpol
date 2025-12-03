// components/home/PpkrDetail.tsx
'use client';

import BackBar from '@/components/shared/BackBar';
import { Leaf } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function PpkrDetail({ onBack }: { onBack: () => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Data PPKR langsung di component
  const ppkrData = {
    nama: 'PPKR Sei Lindai',
    fotoPpkr: '/images/ppkr.jpg',
    fotoStruktur: '/images/ppkr/strukturppkr.png',
    fotoSertifikasi: '/images/sertifikasiPpkr.png',
    sejarahSingkat: `PPKR (Pabrik Pengolahan Karet) Sei Lindai merupakan salah satu unit pengolahan karet milik PT Perkebunan Nusantara IV Regional III yang berlokasi di Kabupaten Rokan Hilir, Provinsi Riau. Pabrik ini berdiri sejak tahun 1998 dengan luas areal sekitar 6 hektare.
Pabrik ini memiliki kapasitas produksi hingga 120 ton karet olahan per bulan dengan produk utama berupa RSS (Ribbed Smoked Sheet) dan SIR 20 (Standard Indonesian Rubber). Bahan baku lateks dipasok dari kebun-kebun karet di sekitar wilayah operasional PTPN IV Regional III.
PPKR Sei Lindai berkomitmen untuk menghasilkan produk karet berkualitas tinggi yang memenuhi standar SNI (Standar Nasional Indonesia) dan spesifikasi buyer internasional, dengan menerapkan sistem quality control yang ketat di setiap tahapan produksi.`,
    infoUmum: {
      lokasi: 'Kec. Sei Putih, Kab. Rokan Hilir, Riau',
      kapasitas: '120 ton/bulan',
      produkUtama: ['RSS (Ribbed Smoked Sheet)', 'SIR 20 (Standard Indonesian Rubber)'],
      status: 'Beroperasi',
      tahunMulaiOperasi: 1998,
      luasAreal: '6 hektare',
      standarMutu: 'SNI & Buyer Specification',
    },
    catatanOperasional: [
      'Perbaikan jalur pengasapan tahap 2 selesai',
      'Penggantian pompa lateks selesai dilaksanakan',
      'Quality control ketat di setiap tahapan produksi',
      'Perawatan rutin mesin creeper dan dryer',
      'Monitoring kadar karet kering (DRC) secara berkala',
    ],
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
        <p className="text-sm text-slate-500 mb-6">Detail profil {ppkrData.nama}.</p>

        {/* Gallery Grid - Foto, Struktur, Sertifikasi */}
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

          {/* Struktur Organisasi */}
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
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Profil Singkat</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {ppkrData.sejarahSingkat}
          </p>
        </div>

        {/* Grid 2 Kolom - Informasi Umum & Catatan Operasional */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Informasi Umum */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
            <h3 className="font-bold mb-3 text-emerald-600 dark:text-emerald-400">Informasi Umum</h3>
            <ul className="text-sm space-y-2">
              <li className="flex flex-col">
                <span className="font-medium text-slate-600 dark:text-slate-400">Lokasi:</span>
                <span className="text-slate-800 dark:text-slate-200 mt-1">{ppkrData.infoUmum.lokasi}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-slate-600 dark:text-slate-400">Kapasitas:</span>
                <span className="text-slate-800 dark:text-slate-200">{ppkrData.infoUmum.kapasitas}</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium text-slate-600 dark:text-slate-400 mb-1">Produk Utama:</span>
                <ul className="ml-4 space-y-0.5">
                  {ppkrData.infoUmum.produkUtama.map((produk, idx) => (
                    <li key={idx} className="text-slate-800 dark:text-slate-200">• {produk}</li>
                  ))}
                </ul>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-slate-600 dark:text-slate-400">Standar Mutu:</span>
                <span className="text-slate-800 dark:text-slate-200">{ppkrData.infoUmum.standarMutu}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-slate-600 dark:text-slate-400">Tahun Operasi:</span>
                <span className="text-slate-800 dark:text-slate-200">{ppkrData.infoUmum.tahunMulaiOperasi}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-slate-600 dark:text-slate-400">Luas Areal:</span>
                <span className="text-slate-800 dark:text-slate-200">{ppkrData.infoUmum.luasAreal}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-slate-600 dark:text-slate-400">Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  {ppkrData.infoUmum.status}
                </span>
              </li>
            </ul>
          </div>

          {/* Catatan Operasional */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
            <h3 className="font-bold mb-3 text-blue-600 dark:text-blue-400">Catatan Operasional</h3>
            <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
              {ppkrData.catatanOperasional.map((catatan, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                  <span>{catatan}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Image Modal/Lightbox */}
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
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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