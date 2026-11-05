import DismissibleBanner from "@/components/DismissibleBanner";
import PizzaCard from "@/components/PizzaCard";
import { getPizzaOfTheDay } from "@/lib/data";

export default async function PizzaOfTheDay() {
  const pizza = await getPizzaOfTheDay();
  if (!pizza) return null;

  return (
    <DismissibleBanner>
      <div className="grid items-center gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black">Pizza of the Day</h2>
          <p className="mt-2">Pilihan hari ini: {pizza.name}. Coba favorit baru Anda!</p>
        </div>
        <div className="mx-auto w-full max-w-xs">
          <PizzaCard pizza={pizza} />
        </div>
      </div>
    </DismissibleBanner>
  );
}
