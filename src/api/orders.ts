import type { Order } from "../types/order";

const API_URL = "http://localhost:5000";

export async function getOrders(): Promise<Order[]> {
	const response = await fetch(`${API_URL}/orders`);

	if (!response.ok) {
		throw new Error("Failed to load orders");
	}

	return (await response.json()) as Order[];
}

export async function getOrdersByDealerId(dealerId: string): Promise<Order[]> {
	const response = await fetch(`${API_URL}/orders?dealerId=${encodeURIComponent(dealerId)}`);

	if (!response.ok) {
		throw new Error("Failed to load orders");
	}

	return (await response.json()) as Order[];
}

export async function createOrder(order: Omit<Order, "id">): Promise<Order> {
	const response = await fetch(`${API_URL}/orders`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(order),
	});

	if (!response.ok) {
		throw new Error("Failed to create order");
	}

	return (await response.json()) as Order;
}