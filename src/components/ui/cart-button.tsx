import { ShoppingBag } from "lucide-react"

interface CartButtonProps {
  count: number;
  onOpenCart: () => void;
}

export default function CartButton({ count, onOpenCart }: CartButtonProps) {
  return (
    <button
      type="button"
      aria-label="Abrir carrito"
      onClick={onOpenCart}
      className="
        fixed bottom-14 right-6 z-20
        flex items-center justify-center
        rounded-full border
        border-(--gold)
        text-(--gold)
        p-[0.65rem] md:p-3
        backdrop-blur-md
        transition-all duration-200
        hover:bg-(--gold)
        hover:text-(--black)
        cursor-pointer
      "
    >
      <div className="relative">
        <ShoppingBag className="size-7 md:size-8" />

        {count > 0 && (
          <span
            className="
              absolute -top-2 -right-2
              flex items-center justify-center
              w-6 h-6
              rounded-full
              bg-(--red)
              text-white
              text-xs
              font-semibold
            "
          >
            {count}
          </span>
        )}
      </div>
    </button>
  );
}
