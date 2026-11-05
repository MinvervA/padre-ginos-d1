import { Suspense } from "react";
import PizzaOfTheDay from "@/components/PizzaOfTheDay";
import MenuExplorer from "@/components/MenuExplorer";
import { getFavoriteIds, getPizzas } from "@/lib/data";

async function Menu() {
  const pizzas = await getPizzas();
  const favoritesPromise = getFavoriteIds();
  return <MenuExplorer pizzas={pizzas} favoritesPromise={favoritesPromise} />;
}

export default function MenuPage() {
  return (
    <>
      <Suspense fallback={null}>
        <PizzaOfTheDay />
      </Suspense>
      <Suspense fallback={<p className="py-16 text-center text-lg">Memuat menu…</p>}>
        <Menu />
      </Suspense>
    </>
  );
}
