import { useEffect, useMemo, useState } from "react";
import { CartItem } from "./cards/CartItem";
import { showToast } from "../lib/events";

export type CartItemType = {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
};

const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

export default function CartApp({ handleCloseCart }: { handleCloseCart: any }) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  // const [toastMessage, setToastMessage] = useState("");
  // const [toastVisible, setToastVisible] = useState(false);
  // const toastTimer = useRef<number | null>(null);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  useEffect(() => {
    const countEl = document.getElementById("cartCount");
    if (countEl) {
      countEl.textContent = String(cartCount);
    }
  }, [cartCount]);

  const addToCart = (
    id: string,
    name: string,
    price: number,
    img: string,
    triggerButton?: HTMLElement,
  ) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { id, name, price, img, qty: 1 }];
    });

    showToast(`${name} agregado ✓`);

    if (triggerButton) {
      triggerButton.textContent = "✓";
      triggerButton.classList.add("added");
      window.setTimeout(() => {
        triggerButton.textContent = "+";
        triggerButton.classList.remove("added");
      }, 1500);
    }
  };

  const handleIncrement = (id: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
  };

  const handleDecrement = (id: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0),
    );
  };

  const handleRemove = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const handleAddToCartEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        id: string;
        name: string;
        price: number;
        img: string;
      }>;
      const { id, name, price, img } = customEvent.detail;
      addToCart(id, name, price, img);
    };

    window.addEventListener("addToCart", handleAddToCartEvent);

    return () => {
      window.removeEventListener("addToCart", handleAddToCartEvent);
    };
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <div className="cart-head">
        <h2>Tu Pedido</h2>
        <button
          type="button"
          className="cart-close"
          id="closeCart"
          aria-label="Cerrar carrito"
          onClick={handleCloseCart}
        >
          ✕
        </button>
      </div>

      <div className="cart-items" id="cartItems">
        {cart.length === 0 ? (
          <div className="cart-empty" id="cartEmpty">
            <div className="cart-empty-icon">🍱</div>
            <p>
              Tu carrito está vacío.
              <br />
              Agrega tus makis favoritos.
            </p>
            <a
              href="/carta"
              className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-[#c89b3c]/80 transition-colors duration-300 hover:text-[#f5f1ea]"
            >
              Revisa nuestra carta
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))
        )}
      </div>

      <div
        className="cart-footer"
        id="cartFooter"
        style={{ display: cart.length === 0 ? "none" : "block" }}
      >
        <div className="cart-subtotal">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="cart-subtotal">
          <span>Delivery (a confirmar)</span>
          <span>—</span>
        </div>
        <div className="cart-total">
          <span className="label">Total</span>
          <span className="amount">{formatCurrency(subtotal)}</span>
        </div>
        <button
          type="button"
          className="checkout-btn"
          id="checkoutBtn"
          aria-label="Enviar pedido por WhatsApp"
          onClick={() => {
            if (cart.length === 0) return;
            const lines = cart
              .map(
                (item) =>
                  `• ${item.name} x${item.qty} — S/ ${(item.price * item.qty).toFixed(2)}`,
              )
              .join("\n");
            const total = subtotal.toFixed(2);
            const msg = `¡Hola! Quiero hacer el siguiente pedido:\n\n${lines}\n\n*Total: S/ ${total}*\n\n¿Pueden confirmar disponibilidad y costo de delivery? 🍣`;
            window.open(
              `https://wa.me/51941442899?text=${encodeURIComponent(msg)}`,
              "_blank",
            );
          }}
        >
          Pedir por WhatsApp →
        </button>
        <p className="whatsapp-note">
          Te redirigiremos a WhatsApp con tu pedido listo para enviar.
        </p>
      </div>
    </>
  );
}
