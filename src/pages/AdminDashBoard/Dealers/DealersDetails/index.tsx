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
						<strong>{order.quantity}</strong></div><div><span>Vehicles Built</span>
						<strong>60</strong></div><div><span>Expected Delivery</span>
						<strong>25 Sep 2026</strong></div><div><span>Total Orders</span>
						<strong>{dealer.orders}</strong></div></div></section></WorkflowShell>;
}
