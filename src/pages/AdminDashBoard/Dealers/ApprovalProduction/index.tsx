import { useParams } from "react-router-dom";
import WorkflowShell from "../../../../components/WorkFlow";
import { useDealer } from "../../../../hooks/useDealer";
import { useOrder } from "../../../../hooks/useOrder";

/**
 * Workflow steps — the correct order flow as defined by the business:
 *
 *   1. Dealer Request     → Dealer submits the order
 *   2. Manufacturer       → Checks stock availability
 *   3. Finance Head       → Finance quotation
 *   4. Sales Manager      → Approval / Rejection
 *   5. Dealer Manager     → Final acknowledgement
 *   6. Order Confirmed    → Payment and acknowledgement completed
 *
 * Admin is an OVERSEER — they can VIEW progress but do NOT approve/reject.
 */
const WORKFLOW_STEPS = [
	"Dealer Request",
	"Manufacturer",
	"Finance Head",
	"Sales Manager",
	"Dealer Manager",
	"Order Confirmed",
];

/** Map an order status string to the active step index (0-based). */
function resolveActiveStep(status: string): number {
	const s = status.toLowerCase();
	if (s.includes("reject") || s.includes("decline"))       return -1; // rejected
	if (s.includes("completed") || s.includes("confirmed") || s.includes("deliver")) return 5;
	if (s.includes("dealer manager") || s.includes("awaiting payment") || s.includes("payment submitted") || s.includes("payment verified") || s.includes("in production")) return 4;
	if (s.includes("approved by sales manager")) return 4;
	if (s.includes("sales manager") || s.includes("quotation sent")) return 3;
	if (s.includes("stock allocated")) return 2;
	if (s.includes("finance head") || s.includes("financehead") || s.includes("pending finance") || s.includes("quotation")) return 2;
	if (s.includes("manufacturer") || s.includes("stock")) return 1;
	return 0; // dealer request / pending
}

/** Human-readable descriptions per step */
const STEP_DESCRIPTIONS: Record<number, { title: string; description: string }> = {
	0: { title: "Dealer Request",    description: "Fleet order submitted by the dealer. Waiting to be picked up by the Manufacturer." },
	1: { title: "Manufacturer",      description: "Manufacturer is verifying stock availability and allocation for the requested vehicles." },
	2: { title: "Finance Head",      description: "Finance Head is reviewing financials and preparing the quotation for this order." },
	3: { title: "Sales Manager",     description: "Sales Manager is reviewing the order for final approval or rejection." },
	4: { title: "Dealer Manager",    description: "Dealer Manager is performing final acknowledgement before delivery." },
	5: { title: "Order Confirmed",   description: "Payment proof and dealer acknowledgement have been completed. The order is confirmed." },
	6: { title: "Order Confirmed",   description: "Payment proof and dealer acknowledgement have been completed. The order is confirmed." },
};

type ApprovalProductionProps = { dealerId?: string; orderId?: string; isModal?: boolean; onClose?: () => void };

export default function ApprovalProduction({ dealerId: dealerIdProp, orderId, isModal, onClose }: ApprovalProductionProps) {
	const { dealerId: routeDealerId } = useParams();
	const dealerId = dealerIdProp ?? routeDealerId;
	const { dealer, isLoading, error } = useDealer(dealerId);
	const { order, isLoading: orderLoading, error: orderError } = useOrder(dealerId, orderId);

	if (isLoading || orderLoading) return <p>Loading dealer order...</p>;
	if (error || !dealer) return <p>{error || "Dealer not found"}</p>;
	if (orderError || !order) return <p>{orderError || "Order not found"}</p>;

	const currentStatus = order.status || "Manufacturer Review";
	const activeStep = resolveActiveStep(currentStatus);
	const isRejected = activeStep === -1;
	const isConfirmed = activeStep === 5 && /completed|confirmed|deliver/i.test(currentStatus);

	const currentStepInfo = STEP_DESCRIPTIONS[isRejected ? 3 : activeStep] ?? STEP_DESCRIPTIONS[0];

	return <WorkflowShell isModal={isModal} onClose={onClose} title="Track Request" subtitle="Admin oversight — track the complete order lifecycle across all departments." dealerLabel={`${dealer.id} · ${dealer.name}`}>
		{/* Order Status Overview (read-only) */}
		<section className="workflow-card">
			<div className="workflow-card-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
				<div>
					<span className="workflow-section-label">Admin Oversight</span>
					<h2>Order Status Overview</h2>
				</div>
				<span className={`status-badge ${currentStatus.toLowerCase().replace(/\s+/g, "-")}`}>
					{currentStatus}
				</span>
			</div>
			<p style={{ fontSize: "13px", color: "#64748b", marginTop: "8px", lineHeight: 1.6 }}>
				This is a <strong>read-only view</strong> for admin oversight. Order approvals flow through: <em>Manufacturer → Finance Head → Sales Manager → Dealer Manager</em>.
			</p>
		</section>

		{/* Multi-Item Order Breakdown if present */}
		{order.items && order.items.length > 0 && (
			<section className="workflow-card">
				<div className="workflow-card-heading">
					<div>
						<span className="workflow-section-label">Procurement Package</span>
						<h2>Order Items ({order.items.length} Car Models)</h2>
					</div>
				</div>
				<table className="history-table" style={{ width: "100%", marginTop: "12px" }}>
					<thead>
						<tr>
							<th>Vehicle Model</th>
							<th>Variant</th>
							<th>Colour</th>
							<th>Specifications</th>
							<th style={{ textAlign: "right" }}>Quantity</th>
						</tr>
					</thead>
					<tbody>
						{order.items.map((item, idx) => (
							<tr key={item.id || idx}>
								<td><strong>{item.model}</strong></td>
								<td>
									<span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>
										{item.variant}
									</span>
								</td>
								<td>
									{item.color ? (
										<span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#334155" }}>
											<span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", backgroundColor: item.colorHex ?? "#888", border: "1.5px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
											{item.color}
										</span>
									) : "—"}
								</td>
								<td>
									{item.specs?.engine && <span>{item.specs.engine}</span>}
									{item.specs?.transmission && <span> • {item.specs.transmission}</span>}
									{item.specs?.fuel && <span> • {item.specs.fuel}</span>}
								</td>
								<td style={{ textAlign: "right" }}>
									<strong style={{ fontSize: "14px" }}>{item.quantity}</strong> units
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		)}

		{/* Request Summary */}
		<section className="workflow-card">
			<div className="request-summary">
				<div><span>Request ID</span><strong>{order.requestNumber ?? order.id}</strong></div>
				<div><span>Dealer Name</span><strong>{dealer.name}</strong></div>
				<div><span>Vehicle Model</span><strong>{order.vehicleModel}</strong></div>
				<div><span>Total Quantity</span><strong>{order.quantity} units</strong></div>
			</div>
		</section>

		{/* Dynamic Workflow Progress Tracker */}
		<section className="workflow-card">
			<div className="workflow-card-heading">
				<div>
					<span className="workflow-section-label">Lifecycle monitoring</span>
					<h2>Workflow Progress</h2>
				</div>
			</div>
			<div className="approval-tracker">
				{WORKFLOW_STEPS.map((step, index) => {
					let stepClass: string;
					let stepLabel: string;
					let stepIcon: string;

					if (isRejected) {
						// If rejected, show steps before Sales Manager as complete, Sales Manager as rejected
						if (index < 3) {
							stepClass = "complete";
							stepLabel = "Completed";
							stepIcon = "✓";
						} else if (index === 3) {
							stepClass = "rejected";
							stepLabel = "Rejected";
							stepIcon = "✕";
						} else {
							stepClass = "pending";
							stepLabel = "Skipped";
							stepIcon = String(index + 1);
						}
					} else if (isConfirmed || index < activeStep) {
						stepClass = "complete";
						stepLabel = "Completed";
						stepIcon = "✓";
					} else if (index === activeStep) {
						stepClass = "current";
						stepLabel = "In Progress";
						stepIcon = String(index + 1);
					} else {
						stepClass = "pending";
						stepLabel = "Pending";
						stepIcon = String(index + 1);
					}

					return (
						<div className={`approval-step ${stepClass}`} key={step}>
							<div>{stepIcon}</div>
							<strong>{step}</strong>
							<span>{stepLabel}</span>
						</div>
					);
				})}
			</div>
		</section>

		{/* Current Stage Card */}
		<section className="workflow-card current-stage">
			<span className="workflow-section-label">Current stage</span>
			<div>
				<div className="stage-icon">{isRejected ? "✕" : activeStep >= 5 ? "✓" : "▦"}</div>
				<div>
					<h2>{isRejected ? "Rejected" : currentStepInfo.title}</h2>
					<p>{isRejected ? "This order was rejected during the Sales Manager review stage." : currentStepInfo.description}</p>
				</div>
				{order.etaDelivery && !isRejected && !isConfirmed && (
					<strong>Expected Delivery<br />{order.etaDelivery}</strong>
				)}
			</div>
		</section>

		{/* Audit Trail */}
		<section className="workflow-card">
			<div className="workflow-card-heading">
				<div>
					<span className="workflow-section-label">Audit trail</span>
					<h2>Workflow History</h2>
				</div>
			</div>
			<table className="history-table">
				<thead>
					<tr>
						<th>Stage</th>
						<th>Role</th>
						<th>Status</th>
						<th>Responsibility</th>
					</tr>
				</thead>
				<tbody>
					<tr className={activeStep >= 0 ? "" : "dimmed"}>
						<td>1. Dealer Request</td>
						<td>Dealer</td>
						<td>{activeStep >= 1 || isRejected || isConfirmed ? "✓ Completed" : activeStep === 0 ? "⏳ In Progress" : "Pending"}</td>
						<td>Submit fleet order request</td>
					</tr>
					<tr className={activeStep >= 1 || isRejected ? "" : "dimmed"}>
						<td>2. Manufacturer</td>
						<td>Manufacturer</td>
						<td>{activeStep >= 2 || isRejected || isConfirmed ? "✓ Completed" : activeStep === 1 ? "⏳ In Progress" : "Pending"}</td>
						<td>Stock availability check &amp; allocation</td>
					</tr>
					<tr className={activeStep >= 2 || isRejected ? "" : "dimmed"}>
						<td>3. Finance Head</td>
						<td>Finance Head</td>
						<td>{activeStep >= 3 || isRejected || isConfirmed ? "✓ Completed" : activeStep === 2 ? "⏳ In Progress" : "Pending"}</td>
						<td>Finance quotation &amp; pricing review</td>
					</tr>
					<tr className={activeStep >= 3 ? "" : "dimmed"}>
						<td>4. Sales Manager</td>
						<td>Sales Manager</td>
						<td>{isRejected ? "✕ Rejected" : activeStep >= 4 || isConfirmed ? "✓ Approved" : activeStep === 3 ? "⏳ In Progress" : "Pending"}</td>
						<td>Order approval or rejection</td>
					</tr>
					<tr className={activeStep >= 4 && !isRejected ? "" : "dimmed"}>
						<td>5. Dealer Manager</td>
						<td>Dealer Manager</td>
						<td>{isConfirmed ? "✓ Completed" : activeStep === 4 ? "⏳ In Progress" : isRejected ? "Skipped" : "Pending"}</td>
						<td>Final acknowledgement &amp; delivery</td>
					</tr>
					<tr className={activeStep >= 5 ? "" : "dimmed"}>
						<td>6. Order Confirmed</td>
						<td>System</td>
						<td>{isConfirmed ? "✓ Confirmed" : isRejected ? "Skipped" : "Pending"}</td>
						<td>Payment proof and dealer acknowledgement completed</td>
					</tr>
				</tbody>
			</table>
		</section>
	</WorkflowShell>;
}