import { skipToken } from "@reduxjs/toolkit/query";
import { useGetDealerOrdersQuery } from "../features/orders/ordersApi";

export function useOrder(dealerId?: string, orderId?: string) {
	const query = useGetDealerOrdersQuery(dealerId ?? skipToken);
	const order = query.data?.find((item) => item.id === orderId) ?? (orderId ? null : query.data?.[0] ?? null);

	return {
		order,
		isLoading: Boolean(dealerId) && query.isLoading,
		error: dealerId
			? query.isError
				? "Unable to load order"
				: !query.isLoading && !order
					? "Order not found"
					: ""
			: "Dealer ID is missing",
	};
}