import { Suspense } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import RatingPanel from "@/components/RatingPanel";
import { ratePizzaAction } from "@/app/actions";

vi.mock("@/app/actions", () => ({ ratePizzaAction: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

test("optimistically adds a rating, restores summary on failure, and retries", async () => {
  let finish!: (value: { error?: string }) => void;
  vi.mocked(ratePizzaAction).mockImplementationOnce(
    () => new Promise((resolve) => { finish = resolve; }),
  );
  const summaryPromise = Promise.resolve({ average: 4, count: 2 });
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(
      <Suspense fallback="Loading">
        <RatingPanel pizzaId="thai_ckn" summaryPromise={summaryPromise} />
      </Suspense>,
    );
  });
  await userEvent.click(screen.getByRole("button", { name: "Beri 1 bintang" }));
  expect(screen.getByTestId("rating-summary").textContent).toContain("3.0 dari 3 rating");
  expect(screen.getByRole("status").textContent).toContain("Mengirim");
  await act(async () => { finish({ error: "Gagal mengirim rating. Coba lagi." }); });
  expect(screen.getByTestId("rating-summary").textContent).toContain("4.0 dari 2 rating");
  expect(screen.getByRole("alert").textContent).toContain("Gagal");

  vi.mocked(ratePizzaAction).mockImplementationOnce(async (_id, formData) => {
    expect(formData.get("stars")).toBe("5");
    view.rerender(
      <Suspense fallback="Loading">
        <RatingPanel pizzaId="thai_ckn" summaryPromise={Promise.resolve({ average: 4.3, count: 3 })} />
      </Suspense>,
    );
    return {};
  });
  await userEvent.click(screen.getByRole("button", { name: "Beri 5 bintang" }));
  await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  expect(screen.getByTestId("rating-summary").textContent).toContain("4.3 dari 3 rating");
  expect(screen.queryByRole("alert")).toBeNull();
});
