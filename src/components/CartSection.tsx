import CartButton from "./ui/cart-button";
import CartApp from "./CartApp";
import { useEffect, useState } from "react";

interface CartSectionProps {
  cartCount?: number;
}

export default function CartSection({
  cartCount = 0,
}: CartSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <CartButton
        count={cartCount}
        onOpenCart={() => setIsOpen(true)}
      />

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
          ${
            isOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        <CartApp />
      </aside>
    </>
  );
}