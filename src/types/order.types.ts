export interface OrderItemDetail {
    name: string;
    quantity: number;
}

export interface OrderItemPayload {
    catalogId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    details: OrderItemDetail[];
}

export interface CreateOrderPayload {
    guestId: string;
    customerName: string;
    phone: string;
    paymentMethod: string;
    deliveryType: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    total: number;
    items: OrderItemPayload[];
}

export interface OrderStatus {
    pending: "pending";
    confirmed: "confirmed";
    preparing: "preparing";
    ready: "ready";
    delivered: "delivered";
}

export interface Order {
    id: string;
    guestId: string;
    customer_name: string;
    phone: string;
    payment_method: string;
    delivery_type: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    total: number;
    status: keyof OrderStatus;
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    catalogId: string;
    name: string;
    unit_price: number;
    quantity: number;
    details: OrderItemDetail[];
}