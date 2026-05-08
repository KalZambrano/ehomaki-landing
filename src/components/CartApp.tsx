import { useEffect, useMemo, useState } from "react";
import { CartItem } from "./cards/CartItem";

export type CartItemType = {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
};

const formatCurrency = (value: number) => `S/ ${value.toFixed(2)}`;

export default function CartApp() {
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

  const showToast = (message: string) => {
    // setToastMessage(message);
    // setToastVisible(true);
    // if (toastTimer.current) window.clearTimeout(toastTimer.current);
    // toastTimer.current = window.setTimeout(() => {
    //   setToastVisible(false);
    //   toastTimer.current = null;
    // }, 2000);

    const event = new CustomEvent("toast", {
      detail: {
        message,
      },
    });
    window.dispatchEvent(event);
  };

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
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const handleRemove = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const openCart = () => {
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    cartDrawer?.classList.add("open");
    cartOverlay?.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  useEffect(() => {
    const menuGrid = document.getElementById("menuGrid");
    const handleMenuClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest(".add-btn") as HTMLElement | null;
      if (!button) return;
      const card = button.closest(".menu-card") as HTMLElement | null;
      if (!card) return;

      const id = String(card.dataset.id ?? "");
      const name = String(card.dataset.name ?? "");
      const price = Number(card.dataset.price ?? 0);
      const img = String(card.dataset.img ?? "");
      if (!id || !name) return;

      addToCart(id, name, price, img, button);
    };

    if (menuGrid) {
      menuGrid.addEventListener("click", handleMenuClick);
    }

    const comboButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".combo-add"),
    );

    const handleComboClick = (event: MouseEvent) => {
      const button = event.currentTarget as HTMLElement;
      const card = button.closest(".combo-card") as HTMLElement | null;
      if (!card) return;

      const id = String(card.dataset.id ?? "");
      const name = String(card.dataset.name ?? "");
      const price = Number(card.dataset.price ?? 0);
      const img = String(card.dataset.img ?? "");
      if (!id || !name) return;

      addToCart(id, name, price, img);
      openCart();
    };

    comboButtons.forEach((button) => {
      button.addEventListener("click", handleComboClick);
    });

    return () => {
      if (menuGrid) {
        menuGrid.removeEventListener("click", handleMenuClick);
      }
      comboButtons.forEach((button) => {
        button.removeEventListener("click", handleComboClick);
      });
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
        >
          ✕
        </button>
      </div>

      <div className="cart-items" id="cartItems">
        {cart.length === 0 ? (
          <div className="cart-empty" id="cartEmpty">
            <div className="cart-empty-icon">🍱</div>
            <p>Tu carrito está vacío.<br />Agrega tus makis favoritos.</p>
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
