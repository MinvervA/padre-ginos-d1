"use client";

import { useState, type ReactNode } from "react";

export default function DismissibleBanner({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <aside aria-label="Pizza of the Day" className="relative mb-8 rounded-2xl bg-crust p-6">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Tutup Pizza of the Day"
        className="absolute top-3 right-4 text-sm underline"
      >
        Tutup
      </button>
      {children}
    </aside>
  );
}
