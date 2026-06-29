import { supabase } from "../lib/supabase";
import type { CreateOrderPayload, Order } from "../types/order.types";

/**
 * Obtiene todas las órdenes. Solo para uso del panel admin.
 */
export async function getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from("orders")
        .select(`
      *,
      items: order_items (
        *,
        details: order_item_details (*)
      )
    `)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Error al obtener las órdenes: ${error.message}`);
    }

    return data ?? [];
}

/**
 * Crea una orden completa con sus items y detalles de combos.
 * La inserción de items y detalles se hace secuencialmente
 * después de obtener el ID de la orden creada.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<{ orderId: string }> {
    const orderId = crypto.randomUUID();

    const { error: orderError } = await supabase
        .from("orders")
        .insert({
            id: orderId,
            guest_id: payload.guestId,
            customer_name: payload.customerName,
            phone: payload.phone,
            payment_method: payload.paymentMethod,
            delivery_type: payload.deliveryType,
            address: payload.address,
            latitude: payload.latitude,
            longitude: payload.longitude,
            total: payload.total,
        });

    if (orderError) {
        throw new Error(`Error al crear la orden: ${orderError.message}`);
    }

    const itemsToInsert = payload.items.map((item) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        catalog_id: item.catalogId,
        name: item.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

    if (itemsError) {
        throw new Error(`Error al insertar los items: ${itemsError.message}`);
    }

    const detailsToInsert = payload.items.flatMap((item, index) => {
        const insertedItem = itemsToInsert[index];
        return item.details.map((detail) => ({
            order_item_id: insertedItem.id,
            name: detail.name,
            quantity: detail.quantity,
        }));
    });

    if (detailsToInsert.length > 0) {
        const { error: detailsError } = await supabase
            .from("order_item_details")
            .insert(detailsToInsert);

        if (detailsError) {
            throw new Error(`Error al insertar los detalles: ${detailsError?.message}`);
        }
    }

    return { orderId };
}

/**
 * Obtiene todas las órdenes asociadas a un guestId,
 * ordenadas de la más reciente a la más antigua.
 */
export async function getOrdersByGuestId(guestId: string): Promise<Order[]> {
    const { data, error } = await supabase
        .from("orders")
        .select(`
      *,
      items: order_items (
        *,
        details: order_item_details (*)
      )
    `)
        .eq("guest_id", guestId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Error al obtener las órdenes: ${error.message}`);
    }

    return data ?? [];
}

/**
 * Obtiene el detalle completo de una orden por su ID.
 */
export async function getOrderById(orderId: string): Promise<Order> {
    const { data, error } = await supabase
        .from("orders")
        .select(`
      *,
      items: order_items (
        *,
        details: order_item_details (*)
      )
    `)
        .eq("id", orderId)
        .single();

    if (error || !data) {
        throw new Error(`Orden no encontrada: ${error?.message}`);
    }

    return data;
}

/**
 * Actualiza el estado de una orden. Solo para uso del panel admin.
 */
export async function updateOrderStatus(
    orderId: string,
    status: string
): Promise<void> {
    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

    if (error) {
        throw new Error(`Error al actualizar el estado: ${error.message}`);
    }
}