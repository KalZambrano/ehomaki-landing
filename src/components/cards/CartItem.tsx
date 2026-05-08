import type { CartItemType } from "../CartApp";
import { Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export function CartItem({ item, onRemove, onIncrement, onDecrement }: CartItemProps) {
  return (
    <div className="cart-item" data-id={item.id}>
      <div className="ci-img-wrap">
        <img src={item.img} alt={item.name} />
        <button
          type="button"
          className="remove-btn"
          aria-label={`Eliminar ${item.name}`}
          onClick={() => onRemove(item.id)}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div>
        <div className="ci-name">{item.name}</div>
        {item.qty > 1 ? (
          <div className="ci-unit-price">S/ {item.price.toFixed(2)} c/u</div>
        ) : null}
        <div className="ci-price">S/ {(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div className="ci-controls">
        <div className="qty-controls">
          <button
            type="button"
            className="qty-btn"
            data-action="dec"
            aria-label={`Disminuir cantidad de ${item.name}`}
            onClick={() => onDecrement(item.id)}
            disabled={item.qty === 1}
          >
            −
          </button>
          <span className="qty-num">{item.qty}</span>
          <button
            type="button"
            className="qty-btn"
            data-action="inc"
            aria-label={`Aumentar cantidad de ${item.name}`}
            onClick={() => onIncrement(item.id)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
