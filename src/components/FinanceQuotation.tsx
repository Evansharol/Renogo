import { useLocation, useParams } from "react-router-dom";
import WorkflowShell from "./WorkflowShell";
import { getDealer, type Dealer } from "./dealerWorkflowData";

type LocationState = { dealer?: Dealer; name?: string };

export default function FinanceQuotation() {
	const { dealerId } = useParams();
	const location = useLocation();
	const state = location.state as LocationState | null;
	const dealer = getDealer(dealerId, state?.dealer);

	return <WorkflowShell title="Finance & Quotation" subtitle="Calculate pricing, taxes, and generate the official quotation." dealerLabel={`${dealer.id} · ${dealer.name}`}><section className="workflow-card"><div className="request-summary"><div><span>Request ID</span><strong>FLI-2026-0891</strong></div><div><span>Dealer Name</span><strong>{dealer.name}</strong></div><div><span>Vehicle Model</span><strong>Renault Duster (RXZ Petrol)</strong></div><div><span>Quantity</span><strong>50</strong></div></div></section><section className="workflow-card finance-card"><div className="workflow-card-heading"><div><span className="workflow-section-label">Commercial review</span><h2>Financial Details</h2></div><button className="secondary-action compact-action" type="button">Edit</button></div><div className="finance-rows"><div><span>Base Price / Vehicle</span><strong>₹ 12,00,000</strong></div><div><span>Quantity</span><strong>50</strong></div><div><span>Subtotal</span><strong>₹ 6,00,00,000</strong></div><div><span>GST / Tax</span><strong>18% (₹ 1,08,00,000)</strong></div><div className="final-row"><span>Final Cost</span><strong>₹ 7,08,00,000</strong></div><div><span>Required Deposit</span><strong>5%</strong></div><div><span>Required Deposit Amount</span><strong>₹ 35,40,000</strong></div></div><button className="primary-action finance-action" type="button">Generate &amp; Send Official Quotation</button></section><section className="workflow-card"><div className="workflow-card-heading"><div><span className="workflow-section-label">Additional information</span><h2>Payment Terms</h2></div></div><div className="info-grid"><div><span>GST Number</span><strong>29AACDE1234F1Z5</strong></div><div><span>Payment Terms</span><strong>Within 7 days</strong></div></div></section></WorkflowShell>;
}
