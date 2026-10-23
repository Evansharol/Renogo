import type { Quotation } from "../../../types/quotation";

export function getOrderQuotation(quotation: Quotation | null) {
	if (!quotation) return null;

	const grossSubtotal = quotation.quantity * quotation.basePrice;
	const taxAmount = Math.round(grossSubtotal * quotation.taxRate / 100);
	const finalTotal = grossSubtotal + taxAmount;
	const advanceAmount = Math.round(finalTotal * quotation.depositRate / 100);

	return {
		items: [{
			id: 1,
			model: quotation.vehicleModel,
			variant: "—",
			qty: quotation.quantity,
			unitPrice: quotation.basePrice,
		}],
		grossSubtotal,
		discount: 0,
		taxableAmount: grossSubtotal,
		taxRate: quotation.taxRate,
		taxAmount,
		finalTotal,
		advanceRate: quotation.depositRate,
		advanceAmount,
		balanceAmount: finalTotal - advanceAmount,
	};
}
