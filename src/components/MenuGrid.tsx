import { useState } from "react";
import { MenuCard } from "./cards/MenuCard";
import { MAKIS, ENTRADAS } from "../const/menu";

const BUTTONS = ["Makis", "Entradas"];

export function MenuGrid() {
  const [activeCategory, setActiveCategory] = useState("makis");

  return (
    <>
      <div
        className="
      flex justify-center gap-3 py-12 px-4
      "
      >
        {BUTTONS.map((button) => (
          <button
            key={button}
            onClick={() => setActiveCategory(button.toLowerCase())}
            className={`${activeCategory === button.toLowerCase() ? "bg-(--gold) text-(--black)" : "bg-transparent text-muted hover:text-white hover:bg-[#b6b6b633]"} text-xs uppercase cursor-pointer rounded-md font-['DM_Sans'] py-2 px-5 transition-all tracking-widest`}
          >
            {button}
          </button>
        ))}
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8 bg(--border)"
        id="menuGrid"
      >
        {activeCategory === "makis" &&
          MAKIS.map((item) => <MenuCard key={item.id} item={item} />)}
        {activeCategory === "entradas" &&
          ENTRADAS.map((item) => <MenuCard key={item.id} item={item} />)}
      </div>
    </>
  );
}
