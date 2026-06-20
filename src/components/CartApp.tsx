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
      const { id, name, price, img, items } = (event as CustomEvent).detail;
      // 👇 store.add persiste y devuelve el array actualizado
      const updated = cartStore.add({ id, name, price, img, items });
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
          <div className="text-center py-16 px-8 text-muted" id="cartEmpty">
            <div className="text-4xl mb-4 opacity-30">🍱</div>
            <p className="text-sm leading-relaxed">
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
        className="px-8 py-6 border-t border-border"
        id="cartFooter"
        style={{ display: cart.length === 0 ? "none" : "block" }}
      >
        <div className="flex justify-between mb-2 text-[0.8rem] text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between mb-2 text-[0.8rem] text-muted">
          <span>Delivery (a confirmar)</span>
          <span>—</span>
        </div>
        <div className="flex justify-between items-baseline mb-6 pt-3 border-t border-border">
          <span className="text-[0.75rem] tracking-[0.15em] uppercase text-muted">
            Total
          </span>
          <span className="font-['Bebas_Neue',sans-serif] text-[2rem] text-(--gold)">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <button className="checkout-btn">Ordenar</button>
        <button
          type="button"
          className="font-medium flex mx-auto p-4 cursor-pointer"
          id="checkoutBtn"
          aria-label="Enviar pedido por WhatsApp"
          onClick={() => {
            if (cart.length === 0) return;

            const lines = cart
              .map((item) => {
                const subItems = item.items?.length
                  ? "\n" +
                    item.items
                      .map((i) => `   ◦ ${i.name} x${i.quantity}`)
                      .join("\n")
                  : "";

                return `• ${item.name} x${item.qty} — S/ ${(item.price * item.qty).toFixed(2)}${subItems}`;
              })
              .join("\n\n");

            const total = subtotal.toFixed(2);

            const msg = `¡Hola! Quiero hacer el siguiente pedido:

${lines}

*Total: S/ ${total}*

¿Pueden confirmar disponibilidad y costo de delivery?`;

            window.open(
              `https://wa.me/51941442899?text=${encodeURIComponent(msg)}`,
              "_blank",
            );
          }}
        >
          Pedir por WhatsApp →
        </button>
      </div>
    </>
  );
}
