import { useEffect, useMemo, useState } from "react";
import { CartItem } from "./cards/CartItem";
import { showToast } from "../lib/events";
import { cartStore, type CartItemType } from "../lib/cartStore";

const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

export default function CartApp({ handleCloseCart }: { handleCloseCart: any }) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  useEffect(() => {
    setCart(cartStore.get());
    setHydrated(true);
    const countEl = document.getElementById("cartCount");
    if (countEl) countEl.textContent = String(cartCount);
  }, [cartCount]);

  const handleIncrement = (id: string) => setCart(cartStore.increment(id));
  const handleDecrement = (id: string) => setCart(cartStore.decrement(id));
  const handleRemove = (id: string) => setCart(cartStore.remove(id));

  useEffect(() => {
    const handleAddToCartEvent = (event: Event) => {
      const { id, name, price, img } = (event as CustomEvent).detail;
      // 👇 store.add persiste y devuelve el array actualizado
      const updated = cartStore.add({ id, name, price, img });
      setCart(updated);
      showToast(`${name} agregado ✓`);
    };

    window.addEventListener("addToCart", handleAddToCartEvent);
    return () => window.removeEventListener("addToCart", handleAddToCartEvent);
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
