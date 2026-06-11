import { useState, useEffect } from "react";

import { FILTERS } from "../const/accessibility";
import { FONT_SIZES } from "../const/accessibility";
import type { ColorBlindnessType } from "../const/accessibility";
import { History } from "lucide-react";

export default function AccessibilityAside({
  handleCloseAccessibility,
}: {
  handleCloseAccessibility: () => void;
}) {
  const [selectedFilter, setSelectedFilter] =
    useState<ColorBlindnessType>("normal");
  const [isReadingMaskActive, setIsReadingMaskActive] = useState(false);
  const [maskOpacity, setMaskOpacity] = useState(60);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState(0);
  const [isHighContrast, setIsHighContrast] = useState(false);

  // 1. Hidratación (nuevo)
  useEffect(() => {
    const savedFilter = localStorage.getItem(
      "accessibility-filter",
    ) as ColorBlindnessType;
    const savedMask = localStorage.getItem("reading-mask-active") === "true";
    const savedOpacity = Number(localStorage.getItem("mask-opacity") ?? 60);
    const savedMotion = localStorage.getItem("reduced-motion") === "true";
    const savedFontSize = Number(localStorage.getItem("font-size") ?? 0);
    const savedHighContrast = localStorage.getItem("high-contrast") === "true";

    if (savedFilter) setSelectedFilter(savedFilter);
    setIsReadingMaskActive(savedMask);
    setMaskOpacity(savedOpacity);
    setIsReducedMotion(savedMotion);
    setFontSize(savedFontSize);
    setIsHighContrast(savedHighContrast);
  }, []);

  // 2. Filtro CSS
  useEffect(() => {
    document.documentElement.classList.remove(
      "protanopia",
      "deuteranopia",
      "tritanopia",
    );
    if (selectedFilter !== "normal")
      document.documentElement.classList.add(selectedFilter);
    localStorage.setItem("accessibility-filter", selectedFilter);
  }, [selectedFilter]);

  // 3. Listener del mouse para la máscara
  useEffect(() => {
    if (!isReadingMaskActive) return;
    const mask = document.getElementById("reading-mask");
    if (!mask) return;

    const handleMouseMove = (e: MouseEvent) => {
      mask.style.setProperty("--mask-position", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isReadingMaskActive]);

  // 4. Sincronizar DOM y guardar máscara
  useEffect(() => {
    const mask = document.getElementById("reading-mask");
    if (!mask) return;
    mask.style.display = isReadingMaskActive ? "block" : "none";
    mask.style.setProperty("--mask-opacity", (maskOpacity / 100).toString());
    localStorage.setItem("reading-mask-active", String(isReadingMaskActive));
    localStorage.setItem("mask-opacity", String(maskOpacity));
  }, [isReadingMaskActive, maskOpacity]);

  // 5. Reducir animaciones:
  useEffect(() => {
    if (isReducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    localStorage.setItem("reduced-motion", String(isReducedMotion));
  }, [isReducedMotion]);

  // 6. Cambiar el tamaño de la fuente:
  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_SIZES[fontSize].value}%`;
    localStorage.setItem("font-size", String(fontSize));
  }, [fontSize]);

  // 7. Cambiar el contraste:
  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem("high-contrast", String(isHighContrast));
  }, [isHighContrast]);

  // 8. Restablecer todos los filtros
  const handleReset = () => {
    setSelectedFilter("normal");
    setIsReducedMotion(false);
    setFontSize(0);
    setIsHighContrast(false);
    setIsReadingMaskActive(false);
    setMaskOpacity(60);
    localStorage.removeItem("accessibility-filter");
    localStorage.removeItem("reduced-motion");
    localStorage.removeItem("font-size");
    localStorage.removeItem("high-contrast");
    localStorage.removeItem("reading-mask-active");
    localStorage.removeItem("mask-opacity");
  };

  const handleReadingMaskToggle = () => {
    setIsReadingMaskActive(!isReadingMaskActive);
  };

  const handleMaskOpacityChange = (value: number) => {
    setMaskOpacity(value);
  };

  return (
    <>
      <div className="cart-head">
        <h2>Opciones de Accesibilidad</h2>
        <button
          type="button"
          className="cart-close"
          aria-label="Cerrar panel de accesibilidad"
          onClick={handleCloseAccessibility}
        >
          ✕
        </button>
      </div>

      <div className="cart-items">
        <div className="accessibility-options">
          <p className="accessibility-description">
            Selecciona un filtro de daltonismo para adaptar los colores de la
            página:
          </p>

          <div className="filter-options">
            {FILTERS.map(({ id, label, description }) => (
              <button
                key={id}
                type="button"
                className={`filter-option ${selectedFilter === id ? "active" : ""}`}
                onClick={() => setSelectedFilter(id)}
                aria-label={description}
                aria-pressed={selectedFilter === id}
              >
                <div className={`filter-preview ${id}`}>
                  {["red", "green", "blue"].map((c) => (
                    <div key={c} className={`color-circle ${c}`} />
                  ))}
                </div>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="reading-mask-section">
            {isReadingMaskActive && (
              <div className="mask-opacity-control col-span-2">
                <label htmlFor="mask-opacity" className="opacity-label">
                  Opacidad de máscara: {maskOpacity}%
                </label>
                <input
                  id="mask-opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={maskOpacity}
                  onChange={(e) =>
                    handleMaskOpacityChange(Number(e.target.value))
                  }
                  className="opacity-slider"
                  aria-label="Ajustar opacidad de la máscara de lectura"
                />
              </div>
            )}
            <button
              type="button"
              className={`filter-option ${isReadingMaskActive ? "active" : ""}`}
              onClick={handleReadingMaskToggle}
              aria-label="Activar máscara de lectura"
              aria-pressed={isReadingMaskActive}
            >
              <span>Máscara de lectura</span>
              <small>{isReadingMaskActive ? "Activada" : "Desactivada"}</small>
            </button>
            <button
              type="button"
              className={`filter-option ${isReducedMotion ? "active" : ""}`}
              onClick={() => setIsReducedMotion(!isReducedMotion)}
              aria-pressed={isReducedMotion}
              aria-label="Reducir animaciones"
            >
              <span>Reducir animaciones</span>
              <small>{isReducedMotion ? "Activado" : "Desactivado"}</small>
            </button>
            <button
              type="button"
              className={`filter-option ${isHighContrast ? "active" : ""}`}
              onClick={() => setIsHighContrast(!isHighContrast)}
              aria-pressed={isHighContrast}
              aria-label="Activar alto contraste"
            >
              <span>Alto contraste</span>
              <small>{isHighContrast ? "Activado" : "Desactivado"}</small>
            </button>
            <button
              type="button"
              className={`filter-option flex-col gap-1 ${fontSize > 0 ? "active" : ""}`}
              onClick={() => setFontSize((i) => (i + 1) % FONT_SIZES.length)}
              aria-label={`Tamaño de texto: ${FONT_SIZES[fontSize].value}%`}
              aria-pressed={fontSize > 0}
            >
              <div className="flex items-end gap-0.5 leading-none">
                {FONT_SIZES.map((f, i) => (
                  <span
                    key={f.value}
                    className={`font-bold transition-colors ${f.size} ${
                      i === fontSize ? "text-(--color-primary)" : "opacity-40"
                    }`}
                  >
                    T
                  </span>
                ))}
              </div>
              <span>Tamaño de texto</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 border-t border-border">
        <button
          type="button"
          className="w-full py-2 px-4 rounded-lg border border-red-400 text-red-400 text-sm font-medium flex justify-center items-center gap-2
          hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
          onClick={handleReset}
          aria-label="Restablecer todas las opciones de accesibilidad"
        >
          <History className="size-4" />
          Restablecer
        </button>
      </div>
    </>
  );
}
