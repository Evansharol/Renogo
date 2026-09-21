import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import "./Admindb.css";
import "./Dealers.css";

type Dealer = { id: string; name: string; location: string; orders: number; status: string };
type LoginState = { name?: string };

const dealers: Dealer[] = [
	{ id: "D001", name: "ABC Motors", location: "Chennai", orders: 5, status: "In Production" },
	{ id: "D002", name: "Royal Autos", location: "Bangalore", orders: 3, status: "Approved" },
	{ id: "D003", name: "Chennai Cars", location: "Chennai", orders: 2, status: "Pending Approval" },
];

function getStatusPresentation(status: string) {
	const normalizedStatus = status.toLowerCase();

	if (normalizedStatus === "approved") return { icon: "✓", className: "approved" };
	if (normalizedStatus.includes("pending")) return { icon: "◷", className: "pending" };
	if (normalizedStatus.includes("declin")) return { icon: "✕", className: "declined" };
	return { icon: "•", className: "neutral" };
}

export default function Dealers() {
	const location = useLocation();
	const [dealerList, setDealerList] = useState(dealers);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [form, setForm] = useState({ id: "", name: "", location: "", status: "Pending Approval" });
	const loginState = location.state as LoginState | null;
	const totalOrders = dealerList.reduce((total, dealer) => total + dealer.orders, 0);
	const pendingRequests = dealerList.filter((dealer) => dealer.status === "Pending Approval").length;

	const handleAddDealer = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setDealerList((currentDealers) => [...currentDealers, { ...form, orders: 0 }]);
		setForm({ id: "", name: "", location: "", status: "Pending Approval" });
		setIsFormOpen(false);
	};

	return (
		<div className="admin-layout">
			<Sidebar />
			<div className="admin-content">
				<Navbar adminName={loginState?.name ?? "Admin"} />
				<main className="admin-main dealers-main">
					<div className="page-heading"><div><h1>Dealer Management</h1><p>Manage dealers and move their orders through the fleet workflow.</p></div><button className="add-dealer-button" type="button" onClick={() => setIsFormOpen(true)}>+ Add Dealer</button></div>
					<section className="dealer-summary-grid" aria-label="Dealer summary"><article className="dealer-summary-card"><span>🚗 Total Dealers</span><strong>{dealerList.length}</strong></article><article className="dealer-summary-card"><span>📦 Total Orders</span><strong>{totalOrders}</strong></article><article className="dealer-summary-card"><span>⏳ Pending Requests</span><strong>{pendingRequests}</strong></article></section>
					<section className="dealers-table-card" aria-label="Dealer workflow table"><div className="table-scroll-wrapper"><table className="dealers-table"><thead><tr><th>Dealer ID</th><th>Dealer Name</th><th>Request Status</th><th>Dealer Details</th><th>Request Evaluation</th><th>Finance &amp; Quotation</th><th>Approval &amp; Production</th></tr></thead><tbody>{dealerList.map((dealer) => { const statusPresentation = getStatusPresentation(dealer.status); return <tr key={dealer.id}><td className="dealer-id">{dealer.id}</td><td><strong>{dealer.name}</strong><span className="dealer-location">{dealer.location}</span></td><td><span className={`request-status ${statusPresentation.className}`}><span aria-hidden="true">{statusPresentation.icon}</span>{dealer.status}</span></td><td><Link className="workflow-link details-link" to={`/dealers/details/${dealer.id}`} state={{ dealer }}><span>View</span><small>Profile &amp; orders</small></Link></td><td><Link className="workflow-link evaluation-link" to={`/dealers/evaluation/${dealer.id}`} state={{ dealer }}><span>View</span><small>Stock review</small></Link></td><td><Link className="workflow-link finance-link" to={`/dealers/finance/${dealer.id}`} state={{ dealer }}><span>View</span><small>Quotation</small></Link></td><td><Link className="workflow-link approval-link" to={`/dealers/approval/${dealer.id}`} state={{ dealer }}><span>View</span><small>Production status</small></Link></td></tr>; })}</tbody></table></div></section>
					{isFormOpen && <div className="dealer-form-overlay" role="presentation" onMouseDown={() => setIsFormOpen(false)}><form className="dealer-form" onSubmit={handleAddDealer} onMouseDown={(event) => event.stopPropagation()}><div className="dealer-form-heading"><div><span className="workflow-page-label">Dealer network</span><h2>Add Dealer</h2></div><button type="button" aria-label="Close add dealer form" onClick={() => setIsFormOpen(false)}>×</button></div><div className="dealer-form-fields"><label>Dealer ID<input required placeholder="D004" value={form.id} onChange={(event) => setForm({ ...form, id: event.target.value })} /></label><label>Dealer Name<input required placeholder="Dealer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Location<input required placeholder="City" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Pending Approval</option><option>Approved</option><option>Declined</option><option>In Production</option><option>Ready for Delivery</option></select></label></div><div className="dealer-form-actions"><button type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="dealer-form-save" type="submit">Save Dealer</button></div></form></div>}
				</main>
			</div>
		</div>
	);
}

