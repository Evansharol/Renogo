import { useLocation, useParams } from "react-router-dom";
import WorkflowShell from "./WorkflowShell";
import { getDealer, type Dealer } from "./dealerWorkflowData";

type LocationState = { dealer?: Dealer; name?: string };

export default function DealerDetails() {
	const { dealerId } = useParams();
	const location = useLocation();
	const state = location.state as LocationState | null;
	const dealer = getDealer(dealerId, state?.dealer);

	return <WorkflowShell title="Dealer Details" subtitle="Review the dealer profile and current order context." dealerLabel={`${dealer.id} · ${dealer.name}`}><section className="workflow-card"><div className="workflow-card-heading"><div><span className="workflow-section-label">Dealer profile</span><h2>Dealer Information</h2></div><span className="status-badge approved">{dealer.status}</span></div><div className="info-grid"><div><span>Dealer ID</span><strong>{dealer.id}</strong></div><div><span>Dealer Name</span><strong>{dealer.name}</strong></div><div><span>Location</span><strong>{dealer.location}</strong></div><div><span>Contact Number</span><strong>+91 98765 43210</strong></div><div><span>Registered Date</span><strong>12 Sep 2026</strong></div><div><span>Current Status</span><strong>{dealer.status}</strong></div></div></section><section className="workflow-card"><div className="workflow-card-heading"><div><span className="workflow-section-label">Order lifecycle</span><h2>Order Overview</h2></div></div><div className="info-grid"><div><span>Order ID</span><strong>ORD-1001</strong></div><div><span>Vehicle Model</span><strong>Renault Duster</strong></div><div><span>Requested Quantity</span><strong>100</strong></div><div><span>Vehicles Built</span><strong>60</strong></div><div><span>Expected Delivery</span><strong>25 Sep 2026</strong></div><div><span>Total Orders</span><strong>{dealer.orders}</strong></div></div></section></WorkflowShell>;
}
