import { useEffect, useState } from "react";
import { getDealerById } from "../api/dealers";
import { getUsers } from "../api/users";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetDealerOrdersQuery } from "../features/orders/ordersApi";
import type { Dealer } from "../types/dealer";

export function useDealer(dealerId?: string) {
	const [result, setResult] = useState<{ dealerId: string; dealer: Dealer | null; error: string } | null>(null);
	const ordersQuery = useGetDealerOrdersQuery(dealerId ?? skipToken);

	useEffect(() => {
		if (!dealerId) return;

		let isActive = true;

		const loadDealer = async () => {
			try {
				const existingDealer = await getDealerById(dealerId);
				if (isActive) setResult({ dealerId, dealer: existingDealer, error: "" });
				return;
			} catch {
				if (ordersQuery.isLoading) return;
				if (ordersQuery.isError || !ordersQuery.data?.length) {
					throw new Error("Dealer and dealer orders were not found.");
				}

				const users = await getUsers().catch(() => []);
				const dealerUser = users.find((user) => user.id === dealerId && user.role.toLowerCase() === "dealer");
				const derivedDealer: Dealer = {
					id: dealerId,
					name: dealerUser?.name ?? `Dealer ${dealerId}`,
					location: "Location not provided",
					orders: ordersQuery.data.length,
					status: ordersQuery.data[0]?.status ?? "Pending Approval",
				};
				if (isActive) setResult({ dealerId, dealer: derivedDealer, error: "" });
			}
		};

		loadDealer()
			.catch((loadError: unknown) => {
				if (isActive) setResult({
					dealerId,
					dealer: null,
					error: loadError instanceof Error ? loadError.message : "Unable to load dealer",
				});
			});

		return () => {
			isActive = false;
		};
	}, [dealerId, ordersQuery.data, ordersQuery.isError, ordersQuery.isLoading]);

	const currentResult = result?.dealerId === dealerId ? result : null;
	return {
		dealer: currentResult?.dealer ?? null,
		isLoading: Boolean(dealerId) && !currentResult,
		error: dealerId ? currentResult?.error ?? "" : "Dealer ID is missing",
	};
}