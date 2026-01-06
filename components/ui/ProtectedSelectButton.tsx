"use client";

import React, { useState } from "react";
import KeywordGateModal from "@/components/ui/KeywordGateModal";
import type { PathKey } from "@/lib/types";

type ProtectedSelectButtonProps = {
  targetKey: PathKey;
  label: string;
  keyword: string;
  active?: boolean;
  onSelect: (k: PathKey) => void;
  className?: string;
  children: React.ReactNode;
};

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

export default function ProtectedSelectButton({
  targetKey,
  label,
  keyword,
  active = false,
  onSelect,
  className,
  children,
}: ProtectedSelectButtonProps) {
  const [open, setOpen] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>(undefined);

  function openModal(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setErrorText(undefined);
    setOpen(true);
  }

  function cancel() {
    setOpen(false);
    setErrorText(undefined);
  }

  function submit(entered: string) {
    if (normalize(entered) !== normalize(keyword)) {
      setErrorText("Kata kunci salah. Coba lagi.");
      return;
    }
    setOpen(false);
    setErrorText(undefined);
    onSelect(targetKey);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {children}
      </button>

      <KeywordGateModal
        open={open}
        title={`Buka: ${label}`}
        description="Masukkan kata kunci untuk mengakses menu ini."
        errorText={errorText}
        onCancel={cancel}
        onSubmit={submit}
      />
    </>
  );
}
