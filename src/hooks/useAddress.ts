import { useState, useEffect } from "react";
import type { Order } from "@/types/order.types";

const linkAddress = async (address: string) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=jsonv2`,
    );
    const data = await response.json();
    return data[0]?.lat && data[0]?.lon
        ? `https://www.google.com/maps?q=${data[0].lat},${data[0].lon}`
        : null;
};

export function useAddressLink(order: Order) {
    const [addressLink, setAddressLink] = useState<string | null>(null);

    useEffect(() => {
        // Si tiene coordenadas, no hace falta fetch
        if (order.latitude && order.longitude) {
            setAddressLink(
                `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
            );
            return;
        }

        // Fallback: geocodificar el address con Nominatim
        if (order.address) {
            linkAddress(order.address).then(setAddressLink);
        }
    }, [order.id]);

    return addressLink;
}