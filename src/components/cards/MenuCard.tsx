export function MenuCard({ item }: { item: any }) {
  return (
    <div
      className={`menu-card
        animate-fade-in-up delay-${item.id * 100} ${item.id % 2 === 0 ? "xl:translate-y-8" : ""}`}
      data-cat={item.category}
      data-id={item.id}
      data-name={item.name}
      data-price={item.price}
      data-img={item.image}
    >
      <div>
        <div className="card-img-wrap">
          <img
            className="card-img"
            src={item.image}
            alt={item.name}
            loading="lazy"
          />
          {item.badge && <span className="card-badge">{item.badge}</span>}
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="card-name">{item.name}</h3>
          <p className="card-desc line-clamp-4">{item.description}</p>
          <div className="md:hidden flex gap-6 items-center">
            <div className="card-price">
              S/ {item.price} <span>/ {item.portion}</span>
            </div>
            <button className="add-btn" title="Agregar al carrito">
              +
            </button>
          </div>
        </div>
      </div>
      <div className="hidden! md:flex! justify-between items-center">
        <div className="card-price">
          S/ {item.price} <span>/ {item.portion}</span>
        </div>
        <button className="add-btn" title="Agregar al carrito">
          +
        </button>
      </div>
    </div>
  );
}
