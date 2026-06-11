import CartButton from "./ui/cart-button";
import CartApp from "./CartApp";
import { useEffect, useState } from "react";
import { cartStore } from "../lib/cartStore";

export default function CartSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // console.log("cartStore", cartStore.get().length);
    // carga inicial desde localStorage
    const getCount = () => cartStore.get().length;
    setCartCount(getCount());

    // se actualiza cada vez que CartApp modifica el carrito
    const onCartUpdated = () => setCartCount(getCount());
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleCloseCart = () => {
    setIsOpen(false);
  };

  return (
    <>
      <CartButton count={cartCount} onOpenCart={() => setIsOpen(true)} />

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`
          fixed inset-0 z-200
          bg-black/70 backdrop-blur-sm
          transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 right-0 bottom-0
          z-201
          flex flex-col
          w-screen md:w-105
          bg-(--dark)
          border-l border-border
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <CartApp handleCloseCart={handleCloseCart} />
      </aside>
    </>
  );
}
