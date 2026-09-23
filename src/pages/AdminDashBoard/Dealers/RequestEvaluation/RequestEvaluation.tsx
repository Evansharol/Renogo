import { useParams } from "react-router-dom";
import WorkflowShell from "../../../../components/WorkFlow/WorkFlow";
import { useDealer } from "../../../../hooks/useDealer";

export default function RequestEvaluation() {
	const { dealerId } = useParams();
	const { dealer, isLoading, error } = useDealer(dealerId);

	if (isLoading) return <p>Loading dealer...</p>;
	if (error || !dealer) return <p>{error || "Dealer not found"}</p>;

	return <WorkflowShell title="Request Evaluation" subtitle="Check inventory and production requirements before qualification." dealerLabel={`${dealer.id} · ${dealer.name}`}>
		<section className="workflow-card"><div className="request-summary">
			<div><span>Dealer Name</span><strong>{dealer.name}</strong></div>
			<div><span>Vehicle Model</span><strong>Renault Duster (RXZ Petrol)</strong></div>
			<div><span>Requested Quantity</span><strong>50</strong></div><div>
				<span>Delivery Estimate</span><strong>6 Weeks</strong></div></div></section>
				<div className="workflow-two-column">
					<section className="workflow-card">
						<div className="workflow-card-heading"><div>
							<span className="workflow-section-label">Stock &amp; availability</span>
							<h2>Stock Availability</h2></div></div><div className="metric-grid">
								<article className="metric-green"><span>Yard Stock</span><strong>30</strong><small>Available units</small></article><article className="metric-blue"><span>Production Required</span><strong>20</strong><small>To be manufactured</small></article></div><div className="workflow-progress"><div><span>30 Yard Stock</span><span>20 Production</span><strong>Total 50</strong></div><div className="progress-bar"><span style={{ width: "60%" }} /><i style={{ width: "40%" }} /></div></div></section><section className="workflow-card action-card"><span className="workflow-section-label">Actions</span><button className="primary-action" type="button">Submit Initial Qualification</button><button className="secondary-action" type="button">View Comments</button></section></div><section className="workflow-card"><div className="workflow-card-heading"><div><span className="workflow-section-label">Payment review</span><h2>Advance Deposit Details</h2></div></div><div className="payment-rows"><div><span>Previous Advance Payments</span><strong>₹ 10,00,000</strong><small>12 Apr 2026</small></div><div><span>Latest Payment</span><strong>₹ 5,00,000</strong><small>28 May 2026</small></div><div><span>Total Available</span><strong>₹ 10,00,000</strong><small>Ready for allocation</small></div></div></section></WorkflowShell>;
}
