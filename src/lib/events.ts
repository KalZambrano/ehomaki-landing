import { type Item } from '@/types/types'

export const showToast = (message: string) => {
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

export const handleAddToCart = (id: string, name: string, price: number, img: string, items?: Item[]) => {
    const event = new CustomEvent("addToCart", {
        detail: {
            id,
            name,
            price,
            img,
            items
        },
    });
    window.dispatchEvent(event);
    showToast(`${name} agregado ✓`);
};
