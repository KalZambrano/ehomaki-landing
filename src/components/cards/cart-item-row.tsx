import type { CartItem } from "@/hooks/useCart";
import { formatCurrency } from "@/hooks/useCart";
import { useEffect, useState } from "react";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showDetails]);

  const hasDetails = item.items && item.items.length > 0;

  const comboDescription = item.items
    ?.map((detail) => `${detail.quantity}x ${detail.name}`)
    .join(", ");

  return (
    <>
      <li className="group relative grid grid-cols-[76px_minmax(0,1fr)_auto] gap-4 rounded-2xl border border-(--gold)/10 bg-[#111]/90 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--gold)/30 hover:shadow-[0_8px_30px_rgba(200,155,60,0.12)]">
        <div className="overflow-hidden rounded-xl">
          <img
            src={item.img}
            alt={item.name}
            loading="lazy"
            className="h-19 w-19 object-cover saturate-[0.9] brightness-[0.95] transition-all duration-500 group-hover:scale-105 group-hover:saturate-100"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[0.95rem] font-semibold text-white">
              {item.name}
            </h3>
          </div>

          {comboDescription && (
            <p className="line-clamp-1 text-[0.75rem] text-white/50">
              {comboDescription}
            </p>
          )}

          <p className="text-[0.75rem] text-white/60">
            {formatCurrency(item.price)} c/u
          </p>
        </div>

        <div className="flex flex-col items-end justify-center">
          <p className="text-lg font-bold tracking-tight text-(--gold)">
            {formatCurrency(item.price * item.qty)}
          </p>

          {item.qty > 1 && (
            <p className="text-[0.7rem] text-white/40">{item.qty} unidades</p>
          )}

          {hasDetails && (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="
      group
      w-fit
      text-sm cursor-pointer py-0.5 px-2 rounded-2xl bg-(--gold)/10 mt-1
      font-medium
      text-(--gold)
      transition-all duration-300
      hover:gap-2
    "
            >
              Detalles
            </button>
          )}
        </div>
      </li>
      {showDetails && (
        <div
          className="
            fixed inset-0 z-100
            flex items-center justify-center
            bg-black/70
            backdrop-blur-sm
            p-4
          "
          onClick={() => setShowDetails(false)}
        >
          <div
            className="
              flex w-full max-w-md
              max-h-[85dvh]
              flex-col
              overflow-hidden
              rounded-3xl
              border border-(--gold)/10
              bg-[#111]
              shadow-[0_20px_60px_rgba(0,0,0,.5)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="flex shrink-0 items-center gap-4 border-b border-white/5 px-7 pt-7 pb-5">
              <img
                src={item.img}
                alt={item.name}
                className="h-18 w-18 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-white">
                  {item.name}
                </h2>
                <p className="text-sm text-white/50">{item.qty} unidades</p>
              </div>
            </div>

            {/* Lista con scroll */}
            <div
              className="flex-1 space-y-3 overflow-y-auto px-7 py-5
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-(--gold)/20
                hover:[&::-webkit-scrollbar-thumb]:bg-(--gold)/40
              "
            >
              {item.items?.map((detail, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-xl border border-white/5 bg-white/3 px-4 py-3
                  "
                >
                  <span className="text-white/80">{detail.name}</span>
                  <span className="text-(--gold)">x{detail.quantity}</span>
                </div>
              ))}
            </div>

            {/* Footer fijo */}
            <div className="shrink-0 border-t border-(--gold)/10 px-7 pt-5 pb-7">
              <div className="flex justify-between">
                <span className="text-white/70">Total</span>
                <span className="text-2xl font-bold text-(--gold)">
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>

              <button
                className="mt-5 w-full rounded-full border border-(--gold)/20 py-3 text-sm font-medium text-white/70
                  transition-colors
                  hover:border-(--gold)/40
                  hover:text-white
                "
                onClick={() => setShowDetails(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
