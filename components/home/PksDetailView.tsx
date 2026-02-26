'use client';

import PksDetailById from './PksDetailById';
import type { PksDetail as PksDetailType } from '@/lib/types';

export default function PksDetailView({
  detail,
  onBack,
}: {
  detail: PksDetailType;
  onBack: () => void;
}) {
  // ✅ pastikan detail benar-benar dikirim sebagai fallback
  return (
    <PksDetailById
      id={detail.id}
      fallbackDetail={detail}
      onBack={onBack}
    />
  );
}
