import { useParams } from "react-router-dom";
import WorkflowShell from "../../../../components/WorkFlow";
import { useDealer } from "../../../../hooks/useDealer";
import { useOrder } from "../../../../hooks/useOrder";

type DealerDetailsProps = { dealerId?: string; orderId?: string; isModal?: boolean; onClose?: () => void };

export default function DealerDetails({ dealerId: dealerIdProp, orderId, isModal, onClose }: DealerDetailsProps) {
	const { dealerId: routeDealerId } = useParams();
	const dealerId = dealerIdProp ?? routeDealerId;
	const { dealer, isLoading, error } = useDealer(dealerId);
	const { order, isLoading: orderLoading, error: orderError } = useOrder(dealerId, orderId);

	if (isLoading || orderLoading) return <p>Loading dealer order...</p>;
	if (error || !dealer) return <p>{error || "Dealer not found"}</p>;
	if (orderError || !order) return <p>{orderError || "Order not found"}</p>;

	return <WorkflowShell isModal={isModal} onClose={onClose} title="Dealer Details" subtitle="Review the dealer profile and current order context." dealerLabel={`${dealer.id} · ${dealer.name}`}>
		<section className="workflow-card">
			<div className="workflow-card-heading">
				<div><span className="workflow-section-label">Dealer profile</span>
				<h2>Dealer Information</h2></div>
				<span className="status-badge approved">{dealer.status}</span></div>
				<div className="info-grid"><div><span>Dealer ID</span>
				<strong>{dealer.id}</strong></div>
				<div><span>Dealer Name</span>
				<strong>{dealer.name}</strong></div>
				<div><span>Location</span><strong>{dealer.location}</strong></div>
				<div><span>Contact Number</span><strong>+91 98765 43210</strong></div>
				<div><span>Registered Date</span><strong>12 Sep 2026</strong></div>
				<div><span>Current Status</span><strong>{dealer.status}</strong></div></div></section>
				<section className="workflow-card">
					<div className="workflow-card-heading"><div>
						<span className="workflow-section-label">Order lifecycle</span>
						<h2>Order Overview</h2></div></div>
						<div className="info-grid"><div><span>Order ID</span>
						<strong>{order.id}</strong></div><div><span>Vehicle Model</span>
						<strong>{order.vehicleModel}</strong></div><div><span>Requested Quantity</span>
						<strong>{order.quantity} units</strong></div><div><span>Order Status</span>
						<strong>{order.status}</strong></div><div><span>Expected Delivery</span>
						<strong>25 Sep 2026</strong></div><div><span>Total Dealer Orders</span>
						<strong>{dealer.orders}</strong></div></div></section>
				{order.items && order.items.length > 0 && (
					<section className="workflow-card">
						<div className="workflow-card-heading">
							<div>
								<span className="workflow-section-label">Procurement Package</span>
								<h2>Selected Vehicles Breakdown ({order.items.length} Models)</h2>
							</div>
						</div>
						<table className="history-table" style={{ width: "100%", marginTop: "12px" }}>
							<thead>
								<tr>
									<th>Model</th>
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
										<td style={{ textAlign: "right" }}><strong>{item.quantity}</strong> units</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}
			</WorkflowShell>;
}
