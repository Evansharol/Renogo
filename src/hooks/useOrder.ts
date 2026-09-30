import { useEffect, useState } from "react";
import { getOrdersByDealerId } from "../api/orders";
import type { Order } from "../types/order";

type LoadedOrder = {
	dealerId: string;
	orderId?: string;
	order: Order | null;
	error: string;
};

export function useOrder(dealerId?: string, orderId?: string) {
	const [loadedOrder, setLoadedOrder] = useState<LoadedOrder | null>(null);

	useEffect(() => {
		if (!dealerId) return;

		let isActive = true;
		getOrdersByDealerId(dealerId)
			.then((orders) => {
				const selectedOrder = orderId ? orders.find((item) => item.id === orderId) : orders[0];
				if (!selectedOrder) throw new Error("Order not found");
				if (isActive) {
					setLoadedOrder({ dealerId, orderId, order: selectedOrder, error: "" });
				}
			})
			.catch(() => {
				if (isActive) {
					setLoadedOrder({ dealerId, orderId, order: null, error: "Unable to load order" });
				}
			});
		return () => {
			isActive = false;
		};
	}, [dealerId, orderId]);

	const currentResult = loadedOrder && loadedOrder.dealerId === dealerId && loadedOrder.orderId === orderId
		? loadedOrder
		: null;
	return {
		order: currentResult?.order ?? null,
		isLoading: Boolean(dealerId) && !currentResult,
		error: dealerId
			? currentResult?.error ?? ""
			: "Dealer ID is missing",
	};
}