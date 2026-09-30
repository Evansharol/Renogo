import { useParams } from "react-router-dom";
import WorkflowShell from "../../../../components/WorkFlow";
import { useDealer } from "../../../../hooks/useDealer";
import { useOrder } from "../../../../hooks/useOrder";

const steps = ["Dealer Request", "Finance Approval", "Production Review", "Manufacturing", "Logistics", "Dealer Delivery"];

type ApprovalProductionProps = { dealerId?: string; orderId?: string; isModal?: boolean; onClose?: () => void };

export default function ApprovalProduction({ dealerId: dealerIdProp, orderId, isModal, onClose }: ApprovalProductionProps) {
	const { dealerId: routeDealerId } = useParams();
	const dealerId = dealerIdProp ?? routeDealerId;
	const { dealer, isLoading, error } = useDealer(dealerId);
	const { order, isLoading: orderLoading, error: orderError } = useOrder(dealerId, orderId);

	if (isLoading || orderLoading) return <p>Loading dealer order...</p>;
	if (error || !dealer) return <p>{error || "Dealer not found"}</p>;
	if (orderError || !order) return <p>{orderError || "Order not found"}</p>;

	return <WorkflowShell isModal={isModal} onClose={onClose} title="Approval & Production" subtitle="Track the complete workflow and take necessary actions." dealerLabel={`${dealer.id} · ${dealer.name}`}>
		<section className="workflow-card">
			<div className="request-summary">
				<div><span>Request ID</span><strong>{order.id}</strong>
				</div>
				<div><span>Dealer Name</span><strong>{dealer.name}</strong>
				</div>
				<div><span>Vehicle Model</span><strong>{order.vehicleModel}</strong>
				</div>
				<div><span>Quantity</span><strong>{order.quantity}</strong></div>
				</div>
				</section>
				<section className="workflow-card">
					<div className="workflow-card-heading"><div>
						<span className="workflow-section-label">Lifecycle monitoring</span>
						<h2>Workflow Progress</h2></div></div>
						<div className="approval-tracker">{steps.map((step, index) => <div className={`approval-step ${index < 3 ? "complete" : index === 3 ? "current" : "pending"}`} key={step}>
							<div>{index < 3 ? "✓" : index + 1}</div><strong>{step}</strong>
							<span>{index < 3 ? "Completed" : index === 3 ? "In Progress" : "Pending"}</span></div>)}</div></section>
							<section className="workflow-card current-stage">
								<span className="workflow-section-label">Current stage</span>
								<div><div className="stage-icon">▦</div>
								<div><h2>Manufacturing</h2>
								<p>Vehicle production is in progress at the factory.</p></div>
								<strong>Expected Date<br />20 Sep 2026</strong></div></section>
								<section className="workflow-card approval-actions">
									<span className="workflow-section-label">Actions (Marketing Head)</span>
									<div><button className="primary-action" type="button">Approve Fleet Request</button>
									<button className="secondary-action" type="button">Request Finance Quotation</button></div></section>
									<section className="workflow-card"><div className="workflow-card-heading"><div>
										<span className="workflow-section-label">Audit trail</span>
										<h2>Workflow History</h2></div></div>
										<table className="history-table">
											<thead><tr>
												<th>Date</th>
												<th>Stage</th>
												<th>Status</th>
												<th>Remarks</th>
												</tr></thead>
												<tbody><tr>
													<td>12 Sep 2026</td>
													<td>Dealer Request</td>
													<td>Completed</td>
													<td>Initial request submitted</td>
													</tr><tr>
														<td>14 Sep 2026</td>
														<td>Finance Approval</td>
														<td>Completed</td>
														<td>Quotation generated</td>
													</tr><tr>
														<td>16 Sep 2026</td>
														<td>Manufacturing</td>
														<td>In Progress</td>
														<td>Production started</td>
													</tr>
													</tbody>
												</table>
							</section>
				</WorkflowShell>;
}
