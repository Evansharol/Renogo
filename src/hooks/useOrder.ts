import { useEffect, useState } from "react";
import { getOrdersByDealerId } from "../api/orders";
import type { Order } from "../types/order";

export function useOrder(dealerId?: string, orderId?: string) {
	const [order, setOrder] = useState<Order | null>(null);
	const [isLoading, setIsLoading] = useState(Boolean(dealerId));
	const [error, setError] = useState("");

	useEffect(() => {
		if (!dealerId) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		getOrdersByDealerId(dealerId)
			.then((orders) => {
				const selectedOrder = orderId ? orders.find((item) => item.id === orderId) : orders[0];
				if (!selectedOrder) throw new Error("Order not found");
				setOrder(selectedOrder);
			})
			.catch(() => setError("Unable to load order"))
			.finally(() => setIsLoading(false));
	}, [dealerId, orderId]);

	return { order, isLoading, error: dealerId ? error : "Dealer ID is missing" };
}