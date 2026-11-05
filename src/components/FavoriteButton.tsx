"use client";

import { use, useOptimistic, useState, useTransition } from "react";

import { toggleFavoriteAction } from "@/app/actions";

export default function FavoriteButton({ pizzaId, pizzaName, favoritesPromise }: {
  pizzaId: string;
  pizzaName: string;
  favoritesPromise: Promise<string[]>;
}) {
  const favoriteIds = use(favoritesPromise);
  const [isFavorite, setOptimistic] = useOptimistic(favoriteIds.includes(pizzaId));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimistic(!isFavorite);
      try {
        const result = await toggleFavoriteAction(pizzaId);
        if (result.error) setError(result.error);
      } catch {
        setError("Gagal menyimpan favorit. Coba lagi.");
      }
    });
  }

  return (
    <span>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-busy={pending}
        aria-pressed={isFavorite}
        aria-label={`${isFavorite ? "Hapus" : "Tambah"} ${pizzaName} ${isFavorite ? "dari" : "ke"} favorit`}
        className="shrink-0 text-2xl leading-none text-brand"
      >
        {isFavorite ? "♥" : "♡"}
      </button>
      {error && <span role="alert" className="block text-sm text-red-700">{error}</span>}
    </span>
  );
}
