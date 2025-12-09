"use client";

import { useEffect, useState } from "react";

type AppOption = {
  id: string;
  name: string;
  category: "HO" | "REGIONAL";
  description?: string | null;
};

export default function GuestPermohonanPage() {
  const [apps, setApps] = useState<AppOption[]>([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [reason, setReason] = useState("");
  const [division, setDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadApps() {
      try {
        const res = await fetch("/api/apps");
        const data = await res.json();
        setApps(data);
      } catch (error) {
        console.error("Failed to load apps", error);
      }
    }
    loadApps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/guest-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestEmail,
          reason,
          division,
          appId: selectedAppId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengajukan permohonan");
      }

      const data = await res.json();

      setSuccessMsg(
        `Permohonan berhasil diajukan. Kode tracking Anda: ${data.trackingCode}, PIN: ${data.trackingPin}. Simpan baik-baik untuk cek status.`
      );
      setGuestName("");
      setGuestEmail("");
      setReason("");
      setDivision("");
      setSelectedAppId("");
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Form Permohonan Akses Aplikasi (Guest)
      </h1>

      {successMsg && (
        <div className="mb-4 rounded border border-green-500 bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 rounded border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Guest */}
        <div>
          <label className="block mb-1 text-sm font-medium">Nama</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
          />
        </div>

        {/* Email Guest */}
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Email ini akan digunakan untuk mengirim username & password aplikasi
            saat permohonan disetujui.
          </p>
        </div>

        {/* Division */}
        <div>
          <label className="block mb-1 text-sm font-medium">Divisi / Unit</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          />
        </div>

        {/* Alasan */}
        <div>
          <label className="block mb-1 text-sm font-medium">Alasan Permohonan</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Dropdown Nama Apps */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Nama Aplikasi yang Diperlukan
          </label>
          <select
            className="w-full border rounded px-3 py-2 bg-white"
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            required
          >
            <option value="">-- Pilih Aplikasi --</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.category})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-green-600 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Mengajukan..." : "Ajukan Permohonan"}
        </button>
      </form>
    </div>
  );
}
