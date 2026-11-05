import { beforeEach, expect, test, vi } from "vitest";
import { refresh } from "next/cache";
import { ratePizzaAction, toggleFavoriteAction } from "@/app/actions";
import { addRating, pizzaExists, toggleFavorite } from "@/lib/data";
import { shouldFail } from "@/lib/demo";

vi.mock("next/cache", () => ({ refresh: vi.fn() }));
vi.mock("@/lib/data", () => ({
  addRating: vi.fn(), pizzaExists: vi.fn(), toggleFavorite: vi.fn(),
}));
vi.mock("@/lib/demo", () => ({ shouldFail: vi.fn(), simulateLatency: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(pizzaExists).mockResolvedValue(true);
  vi.mocked(shouldFail).mockResolvedValue(false);
});

test("rejects invalid ratings and missing pizzas before writing", async () => {
  const form = new FormData();
  form.set("stars", "6");
  expect((await ratePizzaAction("thai_ckn", form)).error).toBeTruthy();
  form.set("stars", "5");
  vi.mocked(pizzaExists).mockResolvedValue(false);
  expect((await ratePizzaAction("missing", form)).error).toBeTruthy();
  expect((await toggleFavoriteAction("missing")).error).toBeTruthy();
  expect(addRating).not.toHaveBeenCalled();
  expect(toggleFavorite).not.toHaveBeenCalled();
});

test("simulated failure prevents both writes and allows a subsequent retry", async () => {
  const form = new FormData();
  form.set("stars", "5");
  vi.mocked(shouldFail).mockResolvedValue(true);
  expect((await ratePizzaAction("thai_ckn", form)).error).toBeTruthy();
  expect((await toggleFavoriteAction("thai_ckn")).error).toBeTruthy();
  expect(addRating).not.toHaveBeenCalled();
  expect(toggleFavorite).not.toHaveBeenCalled();
  expect(refresh).not.toHaveBeenCalled();

  vi.mocked(shouldFail).mockResolvedValue(false);
  expect(await ratePizzaAction("thai_ckn", form)).toEqual({});
  expect(await toggleFavoriteAction("thai_ckn")).toEqual({});
  expect(addRating).toHaveBeenCalledWith("thai_ckn", 5);
  expect(toggleFavorite).toHaveBeenCalledWith("thai_ckn");
  expect(refresh).toHaveBeenCalledTimes(2);
});
