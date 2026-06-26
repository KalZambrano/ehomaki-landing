import { useEffect, useState } from "react";
import { formatCurrency } from "@/hooks/useCart";
import type { CartItem } from "@/hooks/useCart";
import { User, CreditCard, MapPin, Loader } from "lucide-react";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  total: number;
  orden: CartItem[];
  envio: "delivery" | "pickup" | null;
}

const PAYMENT_METHODS = [
  { id: "tarjeta", label: "Tarjeta" },
  { id: "yape", label: "Yape" },
  { id: "plin", label: "Plin" },
];

type Customer = {
  name: string;
  phone: string;
};

export default function OrderModal({
  open,
  onClose,
  total,
  orden,
  envio,
}: OrderModalProps) {
  // Determinar el número máximo de steps basado en si es delivery
  const totalSteps = envio === "delivery" ? 3 : 2;
  // const stepType = (step: number): 1 | 2 | 3 => step as 1 | 2 | 3;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // Estados para dirección
  const [address, setAddress] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("customerAddress") ?? "";
  });
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Al inicio del componente, junto al resto de estados
  const [customerName, setCustomerName] = useState<Customer>(() => {
    if (typeof window === "undefined") return { name: "", phone: "" };
    const stored = localStorage.getItem("customerName");
    try {
      return stored
        ? (JSON.parse(stored) as Customer)
        : { name: "", phone: "" };
    } catch {
      return { name: "", phone: "" };
    }
  });
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);
  const [keepName, setKeepName] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("keepName") === "true";
  });

  const payloadOrden = orden.map((item) => ({
    catalogId: item.id,
    name: item.name,
    unitPrice: item.price,
    quantity: item.qty,
    details: item.items ?? [],
  }));

  const payload = {
    guestId: getOrCreateGuestId(),
    customerName: customerName.name,
    phone: customerName.phone,
    paymentMethod: selectedPayment,
    deliveryType: envio,
    latitude: latitude,
    longitude: longitude,
    address: address,
    total: total,
    items: payloadOrden,
  };

  function getOrCreateGuestId(): string {
    const existing = localStorage.getItem("guestId");
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem("guestId", newId);
    return newId;
  }

  // Función para obtener ubicación actual
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocalización no disponible en tu navegador");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        setLatitude(lat);
        setLongitude(lng);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );

          const data = await response.json();

          // console.log(data);

          // Dirección completa
          // setAddress(data.display_name);

          // O puedes armar una dirección más corta:

          const address = [
            data.address.road,
            data.address.house_number,
            data.address.suburb,
            data.address.city,
          ]
            .filter(Boolean)
            .join(", ");

          setAddress(address);

          setLocationError(null);
        } catch (error) {
          setLocationError("No pudimos obtener la dirección.");
        }

        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError(
          "No pudimos obtener tu ubicación. Por favor, ingresa la dirección manualmente.",
        );

        setIsLoadingLocation(false);
      },
    );
  };

  // Handler unificado para el checkbox
  const handleKeepName = (checked: boolean) => {
    setKeepName(checked);
    if (checked) {
      localStorage.setItem("keepName", "true");
      localStorage.setItem("customerName", JSON.stringify(customerName));
    } else {
      localStorage.removeItem("keepName");
      localStorage.removeItem("customerName");
    }
  };

  // Handler para actualizar el objeto Customer
  const handleCustomerChange = (value: Customer) => {
    setCustomerName(value);
    if (keepName) localStorage.setItem("customerName", JSON.stringify(value));
  };

  const handlePhoneChange = (value: string) => {
    const phone = value.replace(/\D/g, "").slice(0, 9);
    handleCustomerChange({ ...customerName, phone });
    if (/^\d{9}$/.test(phone)) setShowPhoneWarning(false);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const isNameValid = customerName.name.trim().length > 0;
  const isPhoneValid = /^\d{9}$/.test(customerName.phone);
  const isAddressValid =
    envio === "delivery" ? address.trim().length > 0 : true;
  const canConfirm = selectedPayment !== null;

  const handleClose = () => {
    setStep(1);
    !keepName && setCustomerName({ name: "", phone: "" });
    setSelectedPayment(null);
    setAddress("");
    setLatitude(null);
    setLongitude(null);
    setLocationError(null);
    setShowPhoneWarning(false);
    onClose();
  };

  const enviarPedido = () => {
    // console.warn("Enviando pedido");
    // console.log("Total:", total);
    // console.log("Método de pago:", selectedPayment);
    // console.log("Nombre del cliente:", customerName);
    // console.log("Envio:", envio);
    // console.log("Guest ID:", getOrCreateGuestId());
    // console.log(payload);

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="flex w-full max-w-md max-h-[85dvh] flex-col overflow-hidden rounded-3xl border border-(--gold)/10 bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stepper */}
        <div className="flex shrink-0 items-center justify-center gap-3 border-b border-white/5 px-7 pt-7 pb-5 overflow-x-auto">
          {/* Paso 1: Datos */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                step === 1
                  ? "border-(--gold) text-(--gold)"
                  : "border-white/10 text-white/30"
              }`}
            >
              <User className="size-4" />
            </span>
            <span
              className={`text-xs font-medium whitespace-nowrap ${step === 1 ? "text-white" : "text-white/30"}`}
            >
              Datos
            </span>
          </div>

          <div className="h-px w-8 bg-white/10 shrink-0" />

          {/* Paso 2: Ubicación (solo si es delivery) */}
          {envio === "delivery" && (
            <>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    step === 2
                      ? "border-(--gold) text-(--gold)"
                      : "border-white/10 text-white/30"
                  }`}
                >
                  <MapPin className="size-4" />
                </span>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${step === 2 ? "text-white" : "text-white/30"}`}
                >
                  Ubicación
                </span>
              </div>

              <div className="h-px w-8 bg-white/10 shrink-0" />
            </>
          )}

          {/* Paso 2/3: Pago */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                step === totalSteps
                  ? "border-(--gold) text-(--gold)"
                  : "border-white/10 text-white/30"
              }`}
            >
              <CreditCard className="size-4" />
            </span>
            <span
              className={`text-xs font-medium whitespace-nowrap ${step === totalSteps ? "text-white" : "text-white/30"}`}
            >
              Pago
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div
          className="
            flex-1 overflow-y-auto overscroll-contain px-7 py-6
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-(--gold)/20
            hover:[&::-webkit-scrollbar-thumb]:bg-(--gold)/40
          "
        >
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-white">
                ¿A nombre de quién va el pedido?
              </h2>
              <p className="text-sm text-white/50">
                Lo usaremos para identificarlo al recogerlo o entregarlo.
              </p>

              <label htmlFor="customerNameName" className="sr-only">
                Nombre del pedido
              </label>
              <input
                id="customerNameName"
                type="text"
                value={customerName.name}
                onChange={(e) =>
                  handleCustomerChange({
                    ...customerName,
                    name: e.target.value,
                  })
                }
                placeholder="Ej. María Torres"
                className="
    mt-2 w-full rounded-xl border border-white/10 bg-white/3
    px-4 py-3 text-white placeholder:text-white/30
    outline-none transition-colors focus:border-(--gold)/40
  "
              />

              <label htmlFor="customerPhone" className="sr-only">
                Teléfono del cliente
              </label>
              <input
                id="customerPhone"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                value={customerName.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="Ej. 987654321"
                className="
    mt-2 w-full rounded-xl border border-white/10 bg-white/3
    px-4 py-3 text-white placeholder:text-white/30
    outline-none transition-colors focus:border-(--gold)/40
  "
              />
              {showPhoneWarning && !isPhoneValid && (
                <p className="text-xs text-amber-300/90">
                  Ingresa un numero de telefono valido de 9 digitos.
                </p>
              )}

              <label className="mt-3 flex cursor-pointer items-center gap-2.5 select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={keepName}
                    onChange={(e) => handleKeepName(e.target.checked)}
                    className="peer sr-only"
                  />
                  {/* Custom checkbox visual */}
                  <div
                    className="
      h-4 w-4 rounded border border-white/20 bg-white/5
      transition-colors
      peer-checked:border-(--gold)/60 peer-checked:bg-(--gold)/20
    "
                  />
                  {/* Checkmark */}
                  <svg
                    className="
        pointer-events-none absolute inset-0 m-auto h-2.5 w-2.5
        text-(--gold) opacity-0 transition-opacity
        peer-checked:opacity-100
      "
                    viewBox="0 0 10 10"
                    fill="none"
                  >
                    <path
                      d="M1.5 5l2.5 2.5 4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-sm text-white/50 peer-checked:text-white/70 transition-colors">
                  Recordar mi nombre para futuros pedidos
                </span>
              </label>
            </div>
          )}

          {/* Paso 2: Ubicación (solo si es delivery) */}
          {envio === "delivery" && step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  ¿Dónde te lo entregamos?
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Selecciona tu ubicación o ingresa la dirección manualmente.
                </p>
              </div>

              {/* Botón para usar ubicación actual */}
              <button
                type="button"
                disabled={isLoadingLocation}
                onClick={handleGetCurrentLocation}
                className="
                  w-full flex items-center justify-center gap-2 rounded-xl border border-(--gold)/20
                  px-4 py-3 text-sm font-medium text-white/70 transition-colors
                  hover:border-(--gold)/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoadingLocation ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <MapPin className="size-4" />
                    Usar mi ubicación actual
                  </>
                )}
              </button>

              {locationError && (
                <p className="text-xs text-red-400/80">{locationError}</p>
              )}

              {/* {latitude && longitude && (
                <div className="rounded-lg bg-white/5 border border-(--gold)/20 p-3">
                  <p className="text-xs text-white/50">
                    Coordenadas capturadas
                  </p>
                  <p className="text-sm text-white/80 font-mono">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                </div>
              )} */}

              {/* Input de dirección manual */}
              <div>
                <label htmlFor="address" className="sr-only">
                  Dirección de entrega
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ingresa tu dirección aquí"
                  className="
                    w-full rounded-xl border border-white/10 bg-white/3
                    px-4 py-3 text-white placeholder:text-white/30
                    outline-none transition-colors focus:border-(--gold)/40
                  "
                />
              </div>
            </div>
          )}

          {/* Paso 2 (si no es delivery) o Paso 3 (si es delivery): Pago */}
          {step === totalSteps && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm text-white/50">Total a pagar</p>
                <p className="text-3xl font-bold text-(--gold)">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm text-white/70">Elige un método de pago</p>

                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPayment(method.id)}
                      className={`
                        flex flex-col items-center gap-2 rounded-xl border px-3 py-4
                        transition-colors
                        ${
                          selectedPayment === method.id
                            ? "border-(--gold)/40 bg-(--gold)/10"
                            : "border-white/10 bg-white/3 hover:border-white/20"
                        }
                      `}
                    >
                      {/* Icono genérico — reemplazar por el logo de cada método */}
                      <svg
                        className="h-5 w-5 text-(--gold)"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {method.id === "tarjeta" ? (
                          <>
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <path d="M2 10h20" />
                          </>
                        ) : (
                          <>
                            <rect x="6" y="2" width="12" height="20" rx="2" />
                            <path d="M11 18h2" />
                          </>
                        )}
                      </svg>
                      <span className="text-xs font-medium text-white/80">
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: navegación entre pasos */}
        <div className="shrink-0 border-t border-(--gold)/10 px-7 pt-5 pb-7">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                className="
                  flex-1 rounded-full border border-(--gold)/20 py-3
                  text-sm font-medium text-white/70 transition-colors
                  hover:border-(--gold)/40 hover:text-white
                "
              >
                Atrás
              </button>
            )}

            <button
              type="button"
              disabled={
                step === 1
                  ? !isNameValid
                  : step === 2 && envio === "delivery"
                    ? !isAddressValid
                    : !canConfirm
              }
              onClick={() => {
                if (step === 1) {
                  if (!isPhoneValid) {
                    setShowPhoneWarning(true);
                    return;
                  }
                  setStep(2);
                } else if (step === 2 && envio === "delivery") {
                  setStep(3);
                } else if (step === totalSteps) {
                  enviarPedido();
                } else {
                  setStep((s) => (s + 1) as 1 | 2 | 3);
                }
              }}
              className="
                flex-1 rounded-full bg-(--gold) py-3
                text-sm font-medium text-black
                transition-opacity
                disabled:cursor-not-allowed disabled:opacity-30
              "
            >
              {step === 1
                ? "Siguiente"
                : step === totalSteps
                  ? "Confirmar pedido"
                  : "Siguiente"}
            </button>
          </div>
          <div
            className="flex-1 rounded-full border border-red-400/40 py-3
                  text-sm font-medium text-red-400/70 transition-colors
                  hover:border-(--gold)/40 hover:text-red-400 text-center mt-3 cursor-pointer"
            onClick={handleClose}
          >
            Cancelar
          </div>
        </div>
      </div>
    </div>
  );
}
