export function MenuCard({ item }: { item: any }) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-[28px]
        border border-[#2b2418]
        bg-[#0f0c09]/95
        p-4 md:p-5
        transition-all duration-500
        animate-fade-in-up
        delay-${item.id * 100}
        ${item.id % 2 === 0 ? "xl:translate-y-8" : ""}
      `}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={item.image}
          alt={item.name}
          width="360"
          height="240"
          loading="lazy"
          className="
            h-55 w-full object-cover
            transition-transform duration-700
            group-hover:scale-110
          "
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        {/* Floating title inside image */}
        <div className="absolute bottom-0 left-0 w-full p-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg">
            {item.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-5 flex flex-col gap-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-[#d1c7b8] md:text-base">
          {item.description}
        </p>
      </div>
    </div>
  );
}
