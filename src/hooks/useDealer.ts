import { useEffect, useState } from "react";
import { getDealerById } from "../api/dealers";
import { getOrdersByDealerId } from "../api/orders";
import { getUsers } from "../api/users";
import type { Dealer } from "../types/dealer";
import type { Order } from "../types/order";

export function useDealer(dealerId?: string) {
	const [dealer, setDealer] = useState<Dealer | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!dealerId) {
			setDealer(null);
			setIsLoading(false);
			return;
		}

		let isActive = true;
		setIsLoading(true);
		setError("");

		const loadDealer = async () => {
			try {
				const existingDealer = await getDealerById(dealerId);
				if (isActive) setDealer(existingDealer);
				return;
			} catch {
				const [ordersResult, usersResult] = await Promise.allSettled([
					getOrdersByDealerId(dealerId),
					getUsers(),
				]);
				if (ordersResult.status !== "fulfilled" || ordersResult.value.length === 0) {
					throw new Error("Dealer and dealer orders were not found.");
				}

				const dealerUser = usersResult.status === "fulfilled"
					? usersResult.value.find((user) => user.id === dealerId && user.role.toLowerCase() === "dealer")
					: undefined;
				const dealerOrders: Order[] = ordersResult.value;
				const derivedDealer: Dealer = {
					id: dealerId,
					name: dealerUser?.name ?? `Dealer ${dealerId}`,
					location: "Location not provided",
					orders: dealerOrders.length,
					status: dealerOrders[0]?.status ?? "Pending Approval",
				};
				if (isActive) setDealer(derivedDealer);
			}
		};

		loadDealer()
			.catch((loadError: unknown) => {
				if (isActive) {
					setDealer(null);
					setError(loadError instanceof Error ? loadError.message : "Unable to load dealer");
				}
			})
			.finally(() => {
				if (isActive) setIsLoading(false);
			});

		return () => {
			isActive = false;
		};
	}, [dealerId]);

	return {
		dealer,
		isLoading: dealerId ? isLoading : false,
		error: dealerId ? error : "Dealer ID is missing",
	};
}