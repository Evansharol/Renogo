import { useParams } from "react-router-dom";
import WorkflowShell from "../../../../components/WorkFlow/WorkFlow";
import { useEffect, useState } from "react";
import { getQuotationByDealerId } from "../../../../api/quotations";
import { useDealer } from "../../../../hooks/useDealer";
import type { Quotation } from "../../../../types/quotation";

export default function FinanceQuotation() {
	const { dealerId } = useParams();
	const { dealer, isLoading, error } = useDealer(dealerId);
	const [quotation, setQuotation] = useState<Quotation | null>(null);
	const [quotationLoading, setQuotationLoading] = useState(true);
	const [quotationError, setQuotationError] = useState("");

	useEffect(() => {
		if (!dealerId) return;

		getQuotationByDealerId(dealerId)
			.then(setQuotation)
			.catch(() => setQuotationError("Unable to load quotation"))
			.finally(() => setQuotationLoading(false));
	}, [dealerId]);

	if (isLoading || quotationLoading) return <p>Loading finance details...</p>;
	if (error || !dealer) return <p>{error || "Dealer not found"}</p>;
	if (quotationError || !quotation) return <p>{quotationError || "Quotation not found"}</p>;

	const subtotal = quotation.basePrice * quotation.quantity;
	const taxAmount = subtotal * quotation.taxRate / 100;
	const finalCost = subtotal + taxAmount;
	const depositAmount = finalCost * quotation.depositRate / 100;
	const formatCurrency = (amount: number) => `₹ ${amount.toLocaleString("en-IN")}`;

	return <WorkflowShell title="Finance & Quotation" subtitle="Calculate pricing, taxes, and generate the official quotation." dealerLabel={`${dealer.id} · ${dealer.name}`}>
		<section className="workflow-card">
			<div className="request-summary"><div>
				<span>Request ID</span><strong>{quotation.id}</strong></div>
			<div><span>Dealer Name</span>
			<strong>{dealer.name}</strong></div>
			<div><span>Vehicle Model</span>
			<strong>{quotation.vehicleModel}</strong></div>
			<div><span>Quantity</span><strong>{quotation.quantity}</strong></div></div></section>
			<section className="workflow-card finance-card">
				<div className="workflow-card-heading"><div>
					<span className="workflow-section-label">Commercial review</span>
					<h2>Financial Details</h2></div>
					<button className="secondary-action compact-action" type="button">Edit</button></div>
					<div className="finance-rows"><div>
						<span>Base Price / Vehicle</span><strong>{formatCurrency(quotation.basePrice)}</strong></div>
					<div><span>Quantity</span><strong>{quotation.quantity}</strong></div>
					<div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
					<div><span>GST / Tax</span><strong>{quotation.taxRate}% ({formatCurrency(taxAmount)})</strong></div>
					<div className="final-row"><span>Final Cost</span>
					<strong>{formatCurrency(finalCost)}</strong></div>
					<div><span>Required Deposit</span><strong>{quotation.depositRate}%</strong></div>
					<div><span>Required Deposit Amount</span><strong>{formatCurrency(depositAmount)}</strong></div></div>
					<button className="primary-action finance-action" type="button">Generate &amp; Send Official Quotation</button></section>
					<section className="workflow-card"><div className="workflow-card-heading">
						<div><span className="workflow-section-label">Additional information</span>
						<h2>Payment Terms</h2></div></div><div className="info-grid">
							<div><span>GST Number</span><strong>{quotation.gstNumber}</strong></div>
							<div><span>Payment Terms</span><strong>{quotation.paymentTerms}</strong>
							</div></div>
							</section>
							</WorkflowShell>;
}
