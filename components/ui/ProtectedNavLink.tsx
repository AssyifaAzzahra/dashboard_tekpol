"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import KeywordGateModal from "@/components/ui/KeywordGateModal";

type ProtectedNavLinkProps = {
  href: string;
  label: string;
  keyword: string;
  className?: string;
  children: React.ReactNode;
};

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

export default function ProtectedNavLink({
  href,
  label,
  keyword,
  className,
  children,
}: ProtectedNavLinkProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setErrorText(undefined);
    setOpen(true);
  }

  function handleCancel() {
    setOpen(false);
    setErrorText(undefined);
  }

  function handleSubmit(entered: string) {
    if (normalize(entered) !== normalize(keyword)) {
      setErrorText("Kata kunci salah. Coba lagi.");
      return;
    }
    setOpen(false);
    setErrorText(undefined);
    router.push(href);
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className={className}>
        {children}
      </button>

      <KeywordGateModal
        open={open}
        title={`Buka: ${label}`}
        description="Masukkan kata kunci untuk mengakses menu ini."
        errorText={errorText}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </>
  );
}
