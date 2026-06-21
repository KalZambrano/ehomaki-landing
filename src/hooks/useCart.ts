import { useEffect, useState } from "react";

export interface ComboItemDetail {
    name: string;
    quantity: number;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    img: string;
    qty: number;
    items?: ComboItemDetail[];
}

// Ajusta esta key si en tu proyecto el carrito se guarda bajo otro nombre
const CART_STORAGE_KEY = "sushi_cart";
const CART_EVENT = "cartUpdated";

function readCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        return [];
    }
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setItems(readCart());
        setIsHydrated(true);

        const syncFromStorage = () => setItems(readCart());
        window.addEventListener(CART_EVENT, syncFromStorage);
        window.addEventListener("storage", syncFromStorage);

        return () => {
            window.removeEventListener(CART_EVENT, syncFromStorage);
            window.removeEventListener("storage", syncFromStorage);
        };
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalItems = items.length

    return { items, isHydrated, subtotal, totalItems };
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(value);
}