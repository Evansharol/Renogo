import type { Dealer, NewDealer } from "../types/dealer";
import { apiFetch } from "../auth/auth";

const API_URL = "/api";

export async function getDealers(): Promise<Dealer[]> {
	const response = await apiFetch(`${API_URL}/dealers`);

	if (!response.ok) {
		throw new Error("Failed to load dealers");
	}

	return (await response.json()) as Dealer[];
}

export async function getDealerById(id: string): Promise<Dealer> {
	const response = await apiFetch(`${API_URL}/dealers/${id}`);

	if (!response.ok) {
		throw new Error("Dealer not found");
	}

	return (await response.json()) as Dealer;
}

export async function createDealer(dealer: NewDealer): Promise<Dealer> {
	const response = await apiFetch(`${API_URL}/dealers`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ...dealer, orders: dealer.orders ?? 0 }),
	});

	if (!response.ok) {
		throw new Error("Failed to create dealer");
	}

	return (await response.json()) as Dealer;
}
