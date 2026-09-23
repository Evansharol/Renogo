import { useEffect, useState } from "react";
import { getDealerById } from "../api/dealers";
import type { Dealer } from "../types/dealer";

export function useDealer(dealerId?: string) {
	const [dealer, setDealer] = useState<Dealer | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!dealerId) {
			return;
		}

		getDealerById(dealerId)
			.then(setDealer)
			.catch(() => setError("Unable to load dealer"))
			.finally(() => setIsLoading(false));
	}, [dealerId]);

	return {
		dealer,
		isLoading: dealerId ? isLoading : false,
		error: dealerId ? error : "Dealer ID is missing",
	};
}