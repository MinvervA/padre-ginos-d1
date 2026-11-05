"use server";

import { refresh } from "next/cache";
import { addRating, pizzaExists, toggleFavorite } from "@/lib/data";
import { shouldFail, simulateLatency } from "@/lib/demo";
import { parseStars } from "@/lib/format";

export async function toggleFavoriteAction(id: string): Promise<{ error?: string }> {
  await simulateLatency("write");
  if (await shouldFail()) return { error: "Gagal menyimpan favorit. Coba lagi." };
  if (typeof id !== "string" || !(await pizzaExists(id))) {
    return { error: "Pizza tidak ditemukan." };
  }
  try {
    await toggleFavorite(id);
  } catch {
    return { error: "Gagal menyimpan favorit. Coba lagi." };
  }
  refresh();
  return {};
}

export async function ratePizzaAction(id: string, formData: FormData): Promise<{ error?: string }> {
  const stars = parseStars(formData.get("stars"));
  if (stars === null || typeof id !== "string" || !(await pizzaExists(id))) {
    return { error: "Rating tidak valid." };
  }
  await simulateLatency("write");
  if (await shouldFail()) return { error: "Gagal mengirim rating. Coba lagi." };
  try {
    await addRating(id, stars);
  } catch {
    return { error: "Gagal mengirim rating. Coba lagi." };
  }
  refresh();
  return {};
}
