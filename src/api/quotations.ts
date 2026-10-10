import type { Quotation } from "../types/quotation";

const API_URL = "/api";

export async function getQuotationByDealerId(dealerId: string): Promise<Quotation> {
	const response = await fetch(`${API_URL}/quotations?dealerId=${encodeURIComponent(dealerId)}`);

	if (!response.ok) {
		throw new Error("Failed to load quotation");
	}

	const quotations = (await response.json()) as Quotation[];
	const quotation = quotations[0];

	if (!quotation) {
		throw new Error("Quotation not found");
	}

	return quotation;
}

export async function getQuotationByOrderId(orderId: string): Promise<Quotation> {
	const response = await fetch(`${API_URL}/quotations?orderId=${encodeURIComponent(orderId)}`);

	if (!response.ok) {
		throw new Error("Failed to load quotation");
	}

	const quotations = (await response.json()) as Quotation[];
	const quotation = quotations[0];

	if (!quotation) {
		throw new Error("Quotation not found");
	}

	return quotation;
}

export async function updateQuotation(id: string, changes: Partial<Quotation>): Promise<Quotation> {
	const response = await fetch(`${API_URL}/quotations/${encodeURIComponent(id)}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(changes),
	});

	if (!response.ok) {
		throw new Error("Failed to update quotation");
	}

	return (await response.json()) as Quotation;
}
