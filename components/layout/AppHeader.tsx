import { Filter } from 'lucide-react';
import Image from 'next/image';
import UserMenu from "./UserMenu";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-[1400px] px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 font-semibold">
          {/* Logo PTPN 4 Regional III */}
          <Image
            src="https://www.mendaftarkerja.com/wp-content/uploads/2024/09/IMG_3702.png"
            alt="PTPN IV Regional III"
            width={120}                 // dimensi eksplisit agar LCP optimal
            height={32}
            className="h-7 w-auto object-contain"
            priority                    // logo -> prioritas tinggi
            unoptimized                 // hilangkan jika sudah allow domain di next.config
          />
          <span>Dashboard Bagian Teknik & Pengolahan Regional III</span>
        </div>
         {/* ⬇️ Tombol Logout/Login selalu tampil di kanan */}
          <UserMenu />
      </div>
    </header>
  );
}
