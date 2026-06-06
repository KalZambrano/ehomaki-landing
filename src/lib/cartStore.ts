// src/lib/cartStore.ts
export type CartItemType = {
    id: string;
    name: string;
    price: number;
    img: string;
    qty: number;
};

const KEY = "sushi_cart";

const isClient = typeof window !== "undefined";

export const cartStore = {
    get(): CartItemType[] {
        if (!isClient) return [];
        try {
            return JSON.parse(localStorage.getItem(KEY) ?? "[]");
        } catch {
            return [];
        }
    },

    save(cart: CartItemType[]) {
        if (!isClient) return;
        localStorage.setItem(KEY, JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
    },

    add(item: Omit<CartItemType, "qty">): CartItemType[] {
        const cart = this.get();
        const existing = cart.find((i) => i.id === item.id);
        const updated = existing
            ? cart.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
            : [...cart, { ...item, qty: 1 }];
        this.save(updated);
        return updated;
    },

    increment(id: string): CartItemType[] {
        const updated = this.get().map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i,
        );
        this.save(updated);
        return updated;
    },

    decrement(id: string): CartItemType[] {
        const updated = this.get()
            .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0);
        this.save(updated);
        return updated;
    },

    remove(id: string): CartItemType[] {
        const updated = this.get().filter((i) => i.id !== id);
        this.save(updated);
        return updated;
    },
};