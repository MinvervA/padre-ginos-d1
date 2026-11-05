import { Suspense } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import FavoriteButton from "@/components/FavoriteButton";
import { toggleFavoriteAction } from "@/app/actions";

vi.mock("@/app/actions", () => ({ toggleFavoriteAction: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

test("shows optimistic favorite, rolls back on failure, then allows retry", async () => {
  let finish!: (value: { error?: string }) => void;
  vi.mocked(toggleFavoriteAction).mockImplementationOnce(
    () => new Promise((resolve) => { finish = resolve; }),
  );
  const favoritesPromise = Promise.resolve<string[]>([]);
  let view!: ReturnType<typeof render>;
  await act(async () => { view = render(
    <Suspense fallback="Loading">
      <FavoriteButton pizzaId="thai_ckn" pizzaName="Thai" favoritesPromise={favoritesPromise} />
    </Suspense>,
  ); });
  const button = await screen.findByRole<HTMLButtonElement>("button", { name: "Tambah Thai ke favorit" });
  await userEvent.click(button);
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.disabled).toBe(true);
  await act(async () => { finish({ error: "Gagal menyimpan favorit. Coba lagi." }); });
  expect(button.getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByRole("alert").textContent).toContain("Gagal");

  vi.mocked(toggleFavoriteAction).mockImplementationOnce(async () => {
    view.rerender(
      <Suspense fallback="Loading">
        <FavoriteButton pizzaId="thai_ckn" pizzaName="Thai" favoritesPromise={Promise.resolve(["thai_ckn"])} />
      </Suspense>,
    );
    return {};
  });
  await userEvent.click(button);
  await waitFor(() => expect(button.disabled).toBe(false));
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(screen.queryByRole("alert")).toBeNull();
});
