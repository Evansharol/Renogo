import type { Quotation } from "../types/quotation";

const API_URL = "http://localhost:5000";

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
