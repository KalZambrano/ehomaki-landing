import { handleAddToCart } from "@/lib/events";
import { type ComboSelect } from "@/types/types";

function generateUniqueId(combo: ComboSelect, comboId?: string): string {
  if (comboId) return comboId;
  
  // Generate unique ID based on combo name and selected varieties
  const varietiesKey = combo.items
    ? combo.items
        .map((item) => `${item.name}:${item.quantity}`)
        .sort()
        .join("|")
    : "";
  
  return varietiesKey ? `${combo.name}_${varietiesKey}` : combo.name;
}

export function AddButton({
  disabled = false,
  isSticky = false,
  combo,
  comboId,
  comboPrice,
  comboImg,
}: {
  disabled?: boolean;
  isSticky?: boolean;
  combo: ComboSelect;
  comboId?: string;
  comboPrice?: number;
  comboImg?: string;
}) {
  return (
    <button
      className={`mt-8 h-16 w-full rounded-2xl bg-(--gold) text-sm font-bold uppercase tracking-[0.16em] text-black 
        ${isSticky ? "sticky bottom-4 mt-6" : ""}
      transition hover:bg-[#d8aa4f] 
      disabled:cursor-not-allowed disabled:bg-[#1b1812] disabled:text-zinc-500`}
      onClick={() => handleAddToCart(generateUniqueId(combo, comboId), combo.name, comboPrice || 0, comboImg || "", combo.items)}
      disabled={disabled}
    >
      Añadir al carrito
    </button>
  );
}
