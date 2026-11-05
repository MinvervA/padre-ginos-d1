"use client";

import { use, useActionState, useOptimistic } from "react";
import { ratePizzaAction } from "@/app/actions";
import { parseStars } from "@/lib/format";
import type { RatingSummary } from "@/lib/types";

export default function RatingPanel({ pizzaId, summaryPromise }: {
  pizzaId: string;
  summaryPromise: Promise<RatingSummary>;
}) {
  const summary = use(summaryPromise);
  const [optimistic, addOptimistic] = useOptimistic(
    summary,
    (current, stars: number) => ({
      average: (current.average * current.count + stars) / (current.count + 1),
      count: current.count + 1,
    }),
  );
  const [error, action, pending] = useActionState(
    async (_previous: string | null, formData: FormData) => {
      const stars = parseStars(formData.get("stars"));
      if (stars === null) return "Rating tidak valid.";
      addOptimistic(stars);
      try {
        const result = await ratePizzaAction(pizzaId, formData);
        return result.error ?? null;
      } catch {
        return "Gagal mengirim rating. Coba lagi.";
      }
    },
    null,
  );

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
      <h2 className="text-lg font-bold">Rating pelanggan</h2>
      <p className="mt-1 text-ink/70" data-testid="rating-summary" aria-live="polite">
        ★ {optimistic.average.toFixed(1)} dari {optimistic.count} rating
      </p>
      <form action={action} className="mt-4" aria-busy={pending}>
        <fieldset disabled={pending} className="flex gap-1" aria-label="Beri rating">
          {[1, 2, 3, 4, 5].map((stars) => (
            <button
              key={stars}
              type="submit"
              name="stars"
              value={stars}
              aria-label={`Beri ${stars} bintang`}
              className="text-3xl text-amber-500 hover:scale-110 disabled:opacity-50"
            >
              ★
            </button>
          ))}
        </fieldset>
        {pending && <p role="status" className="mt-2 text-sm">Mengirim rating…</p>}
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
