import { handleAddToCart } from "@/lib/events";

interface CartaItemProps {
  cat: {
    id: string;
    label: string;
    kanji: string;
  };
  item: {
    nombre: string;
    ingredientes: string;
    img: string;
    price?: number;
    pieces?: number;
  };
  isComplement: boolean;
}

export function CartaItem({ cat, item, isComplement }: CartaItemProps) {
  return (
    <div
      className="maki-card group relative overflow-hidden
    rounded-[22px]
    border border-[#2a2318]
    bg-[#0d0b08]
    transition-all duration-300
    hover:-translate-y-1
    hover:border-[#c89b3c]/40
    hover:bg-[#15110c]"
      data-name={item.nombre.toLowerCase()}
      data-desc={item.ingredientes.toLowerCase()}
      data-cat={cat.id}
    >
      {/* Glow hover */}
      <div
        className="pointer-events-none
      absolute inset-0 opacity-0
      transition-opacity duration-500
      group-hover:opacity-100"
      >
        <div
          className="absolute inset-0 rounded-[22px]
        shadow-[0_0_35px_rgba(200,155,60,0.10)]"
        ></div>
      </div>

      {/* Image */}
      <div className="relative aspect-[2.5] lg:aspect-4/3 overflow-hidden">
        <img
          src={item.img}
          alt={item.nombre}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover
        saturate-[.8]
        transition-transform duration-700 ease-out
        group-hover:scale-110
        group-hover:saturate-100"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0
        bg-linear-to-t
        from-black/80
        via-black/10
        to-transparent"
        ></div>

        {/* Title inside image */}
        <div
          className="absolute bottom-0 left-0 w-full p-4
    transition-transform duration-300
    md:group-hover:-translate-y-10"
        >
          <h3 className="font-['Noto_Serif_JP'] text-lg font-bold text-white drop-shadow-lg md:text-xl">
            {item.nombre}
          </h3>
        </div>

        {item.pieces && (
          <span className="absolute top-3 right-3 rounded-lg bg-[#c89b3c]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#0d0b08] shadow-lg backdrop-blur-sm">
            {item.pieces} pz
          </span>
        )}
      </div>

      {/* Bottom preview */}
      <footer className="flex flex-col gap-4 p-4">
        <p className="h-10 line-clamp-2 text-sm leading-relaxed text-[#d1c7b8]">
          {item.ingredientes}
        </p>
        {!isComplement && (
          <div className="flex flex-col gap-2 lg:hidden">
            <button
              onClick={() => handleAddToCart(`${cat.id}-${item.nombre}-10`, `${item.nombre} - 10 piezas`, 25, item.img)}
              className="group flex items-center justify-between rounded-xl bg-[#c89b3c] px-4 py-3 text-black"
            >
              <div className="text-left">
                <p className="font-semibold">10 piezas</p>
                <p className="text-xs opacity-75">Agregar al carrito</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold">S/.25</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-lg font-bold">
                  +
                </span>
              </div>
            </button>

            <button
              onClick={() => handleAddToCart(`${cat.id}-${item.nombre}-6`, `${item.nombre} - 6 piezas`, 18, item.img)}
              className="group flex items-center justify-between rounded-xl bg-[#1a1a1a] px-4 py-3 text-[#f3e7d3]"
            >
              <div className="text-left">
                <p className="font-semibold">6 piezas</p>
                <p className="text-xs opacity-75">Agregar al carrito</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-[#c89b3c]">S/.18</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c89b3c]/10 text-lg font-bold text-[#c89b3c]">
                  +
                </span>
              </div>
            </button>
          </div>
        )}
        {isComplement && (
          <div className="flex flex-col gap-2 lg:hidden">
            <button
              onClick={() => handleAddToCart(`${cat.id}-${item.nombre}`, item.nombre, item.price || 0, item.img)}
              className="group flex items-center justify-between rounded-xl bg-[#c89b3c] px-4 py-3 text-black"
            >
              <div className="text-left">
                <p className="font-semibold">{item.nombre}</p>
                <p className="text-xs opacity-75">Agregar al carrito</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold">
                  {item.price ? `S/.${item.price}` : "Consultar"}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-lg font-bold">
                  +
                </span>
              </div>
            </button>
          </div>
        )}
      </footer>

      {/* Acciones hover */}
      {!isComplement && (
        <div
          className="hidden lg:block translate-y-full absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0d0b08] to-[#0d0b08]/95 p-4
                  transition-transform duration-300 group-hover:translate-y-0"
          data-actions
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              className="rounded-xl border border-[#c89b3c]/30 bg-[#18130d] px-3 py-3 text-left
            transition-all hover:border-[#c89b3c] hover:bg-[#20180f]"
              onClick={() => handleAddToCart(`${cat.id}-${item.nombre}-10`, `${item.nombre} - 10 piezas`, 25, item.img)}
            >
              <div className="text-[11px] uppercase tracking-widest text-[#c89b3c]">
                Ordenar
              </div>

              <div className="mt-1 text-sm font-semibold text-white">
                10 piezas
              </div>

              <div className="text-lg font-bold text-[#c89b3c]">S/ 25</div>
            </button>

            <button
              className="rounded-xl border border-[#c89b3c]/30 bg-[#18130d] px-3 py-3 text-left
            transition-all hover:border-[#c89b3c] hover:bg-[#20180f]"
              onClick={() => handleAddToCart(`${cat.id}-${item.nombre}-6`, `${item.nombre} - 6 piezas`, 18, item.img)}
            >
              <div className="text-[11px] uppercase tracking-widest text-[#c89b3c]">
                Ordenar
              </div>
              <div className="mt-1 text-sm font-semibold text-white">
                6 piezas
              </div>
              <div className="text-lg font-bold text-[#c89b3c]">S/ 18</div>
            </button>
          </div>
        </div>
      )}
      {isComplement && (
        <div
          className="hidden lg:block translate-y-full absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0d0b08] to-[#0d0b08]/95 p-4
                  transition-transform duration-300 group-hover:translate-y-0"
          data-actions
        >
          <button
            className="rounded-xl border border-[#c89b3c]/30 bg-[#18130d] px-3 py-3 text-left
            transition-all hover:border-[#c89b3c] hover:bg-[#20180f]"
            onClick={() => handleAddToCart(`${cat.id}-${item.nombre}`, item.nombre, item.price || 0, item.img)}
          >
            <div className="text-[11px] uppercase tracking-widest text-[#c89b3c]">
              Ordenar
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {item.nombre}
            </div>
            <div className="text-lg font-bold text-[#c89b3c]">
              {item.price ? `S/.${item.price}` : "Consultar"}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
