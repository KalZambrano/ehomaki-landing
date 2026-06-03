import { useState } from "react";
import { AddButton } from "./ui/add-button";

interface Variety {
  name: string;
  ingredients: string;
  category: string;
}

interface SelectVarietyProps {
  varietiesCount: number;
  allVarieties: Variety[];
  name: string;
}

export function SelectVariety({
  varietiesCount,
  allVarieties,
  name,
}: SelectVarietyProps) {
  const [selectedVarieties, setSelectedVarieties] = useState<
    Map<string, number>
  >(new Map());
  const [totalCount, setTotalCount] = useState(0);

  const handleIncrement = (varietyName: string) => {
    if (totalCount < varietiesCount) {
      setSelectedVarieties((prev) => {
        const newMap = new Map(prev);
        newMap.set(varietyName, (newMap.get(varietyName) || 0) + 1);
        return newMap;
      });
      setTotalCount((prev) => prev + 1);
    }
  };

  const handleDecrement = (varietyName: string) => {
    const currentQuantity = selectedVarieties.get(varietyName) || 0;
    if (currentQuantity > 0) {
      setSelectedVarieties((prev) => {
        const newMap = new Map(prev);
        newMap.set(varietyName, currentQuantity - 1);
        return newMap;
      });
      setTotalCount((prev) => prev - 1);
    }
  };

  const selected = Array.from(selectedVarieties.entries())
    .filter(([_, quantity]) => quantity > 0)
    .map(([name, quantity]) => ({ name, quantity }));

  const comboDone = {
    name: name,
    items: selected,
  };

  const handleAddToCart = () => {
    console.log("Añadiendo al carrito:", comboDone);
  };

  const progress = (totalCount / varietiesCount) * 100;

  return (
    <div
      id="variety-selector"
      className="mt-8 rounded-[28px] border border-[#c89b3c]/15 bg-[#0c0a07] p-4 md:p-6"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#f5f1ea]">
            Elige tus variedades ({varietiesCount}{" "}
            {varietiesCount === 1 ? "variedad" : "variedades"})
          </h2>
          <p className="mt-2 text-sm text-[#cfc5b6]/70">
            Selecciona {varietiesCount}{" "}
            {varietiesCount === 1 ? "variedad" : "variedades"} de sushi
          </p>
        </div>

        <div className="rounded-2xl border border-[#c89b3c]/10 bg-[#090806] p-4">
          <div className="mb-3 flex justify-between text-sm text-[#cfc5b6]/70">
            <span>Variedades seleccionadas</span>
            <span id="count-display">
              {totalCount} / {varietiesCount}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#1b1812]">
            <div
              id="progress"
              className="h-full bg-[#c89b3c] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div
        id="varieties-list"
        className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        {allVarieties.map((variety) => {
          const quantity = selectedVarieties.get(variety.name) || 0;
          return (
            <div
              key={variety.name}
              className="variety-item group grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3 rounded-2xl border border-[#c89b3c]/10 bg-[#15110c] p-4 transition-all duration-300 hover:border-[#c89b3c]/35"
              data-variety={variety.name}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="truncate font-semibold text-[#f5f1ea]">
                    {variety.name}
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-[#c89b3c]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c89b3c] sm:inline">
                    {variety.category}
                  </span>
                </div>
                <div className="mt-1 line-clamp-2 text-sm leading-snug text-[#cfc5b6]/70">
                  {variety.ingredients}
                </div>
              </div>

              <div className="flex h-11 items-center justify-between rounded-xl border border-[#c89b3c]/15 bg-[#090806] p-1">
                <button
                  className="decrement-btn grid size-9 place-items-center rounded-lg text-lg text-[#f5f1ea] transition hover:bg-[#c89b3c]/15 disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={quantity === 0}
                  onClick={() => handleDecrement(variety.name)}
                  aria-label="Quitar"
                >
                  -
                </button>
                <span className="quantity min-w-6 text-center text-lg font-bold text-[#c89b3c]">
                  {quantity}
                </span>
                <button
                  className="increment-btn grid size-9 place-items-center rounded-lg text-lg text-[#f5f1ea] transition hover:bg-[#c89b3c]/15 disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={totalCount >= varietiesCount}
                  onClick={() => handleIncrement(variety.name)}
                  aria-label="Agregar"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddButton
        disabled={totalCount !== varietiesCount}
        isSticky={true}
        combo={comboDone}
      />
    </div>
  );
}
