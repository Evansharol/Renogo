import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DealerForm from "../../../components/Form/DealerForm/DealerForm";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { createDealer, getDealers } from "../../../api/dealers";
import type { Dealer } from "../../../types/dealer";
import "./Dealers.css";

type LoginState = { name?: string };

function getStatusPresentation(status: string) {
	const normalizedStatus = status.toLowerCase();

	if (normalizedStatus === "approved") return { icon: "✓", className: "approved" };
	if (normalizedStatus.includes("pending")) return { icon: "◷", className: "pending" };
	if (normalizedStatus.includes("declin")) return { icon: "✕", className: "declined" };
	return { icon: "•", className: "neutral" };
}

export default function Dealers() {
	const location = useLocation();
	const [dealerList, setDealerList] = useState<Dealer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const loginState = location.state as LoginState | null;
	const totalOrders = dealerList.reduce((total, dealer) => total + dealer.orders, 0);
	const pendingRequests = dealerList.filter((dealer) => dealer.status === "Pending Approval").length;

	useEffect(() => {
		getDealers()
			.then(setDealerList)
			.catch(() => setError("Unable to load dealers. Start JSON Server with npm run server."))
			.finally(() => setIsLoading(false));
	}, []);

	const handleAddDealer = async (dealer: Parameters<typeof createDealer>[0]) => {
		try {
			const newDealer = await createDealer(dealer);
			setDealerList((currentDealers) => [...currentDealers, newDealer]);
			setIsFormOpen(false);
		} catch {
			setError("Unable to save dealer. Check that JSON Server is running.");
		}
	};

	if (isLoading) return <p>Loading dealers...</p>;
	if (error) return <p>{error}</p>;

	return (
		<div className="admin-layout">
			<Sidebar />
			<div className="admin-content">
				<Navbar adminName={loginState?.name ?? "Admin"} />
				<main className="admin-main dealers-main">
					<div className="page-heading"><div><h1>Dealer Management</h1><p>Manage dealers and move their orders through the fleet workflow.</p></div><button className="add-dealer-button" type="button" onClick={() => setIsFormOpen(true)}>+ Add Dealer</button></div>
					<section className="dealer-summary-grid" aria-label="Dealer summary"><article className="dealer-summary-card"><span>🚗 Total Dealers</span><strong>{dealerList.length}</strong></article><article className="dealer-summary-card"><span>📦 Total Orders</span><strong>{totalOrders}</strong></article><article className="dealer-summary-card"><span>⏳ Pending Requests</span><strong>{pendingRequests}</strong></article></section>
					<section className="dealers-table-card" aria-label="Dealer workflow table"><div className="table-scroll-wrapper"><table className="dealers-table"><thead><tr><th>Dealer ID</th><th>Dealer Name</th><th>Request Status</th><th>Dealer Details</th><th>Request Evaluation</th><th>Finance &amp; Quotation</th><th>Approval &amp; Production</th></tr></thead><tbody>{dealerList.map((dealer) => { const statusPresentation = getStatusPresentation(dealer.status); return <tr key={dealer.id}><td className="dealer-id">{dealer.id}</td><td><strong>{dealer.name}</strong><span className="dealer-location">{dealer.location}</span></td><td><span className={`request-status ${statusPresentation.className}`}><span aria-hidden="true">{statusPresentation.icon}</span>{dealer.status}</span></td><td><Link className="workflow-link details-link" to={`/dealers/details/${dealer.id}`}><span>View</span><small>Profile &amp; orders</small></Link></td><td><Link className="workflow-link evaluation-link" to={`/dealers/evaluation/${dealer.id}`}><span>View</span><small>Stock review</small></Link></td><td><Link className="workflow-link finance-link" to={`/dealers/finance/${dealer.id}`}><span>View</span><small>Quotation</small></Link></td><td><Link className="workflow-link approval-link" to={`/dealers/approval/${dealer.id}`}><span>View</span><small>Production status</small></Link></td></tr>; })}</tbody></table></div></section>
					{isFormOpen && <DealerForm onSave={handleAddDealer} onClose={() => setIsFormOpen(false)} />}
				</main>
			</div>
		</div>
	);
}

