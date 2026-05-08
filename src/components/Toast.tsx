import { useEffect, useState, useRef } from "react";

export function Toast() {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: CustomEvent<{ message: string }>) => {
      // Limpiar timer anterior si existe
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setMessage(e.detail.message);
      setIsVisible(true);

      // Ocultar el toast después de 2.5 segundos
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // Limpiar el mensaje después de la animación
        setTimeout(() => {
          setMessage("");
        }, 300);
      }, 2500);
    };

    window.addEventListener("toast", handler as EventListener);
    
    return () => {
      window.removeEventListener("toast", handler as EventListener);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`toast transition-all duration-300 ${
        isVisible && message ? "opacity-100" : "opacity-0"
      }`} 
      style={{
        transform: `translateX(-50%) ${isVisible && message ? 'translateY(0)' : 'translateY(80px)'}`
      }}
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
