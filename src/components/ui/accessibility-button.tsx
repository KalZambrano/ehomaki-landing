import { PersonStanding } from "lucide-react";
import { useState, useEffect } from "react";
import AccessibilityAside from "../AccessibilityAside";

export default function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseAccessibility = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <>
      <AccessibilityButtonIcon onOpenAccessibility={() => setIsOpen(true)} />

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
        <AccessibilityAside handleCloseAccessibility={handleCloseAccessibility} />
      </aside>
    </>
  );
}

function AccessibilityButtonIcon({ onOpenAccessibility }: { onOpenAccessibility: () => void }) {
  return (
    <button
      className="fixed bottom-14 left-6 z-20 cursor-pointer bg-white rounded-full p-2"
      onClick={onOpenAccessibility}
      aria-label="Abrir opciones de accesibilidad"
    >
      <PersonStanding className="size-8 md:size-9 text-blue-500" />
    </button>
  );
}
