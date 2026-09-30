import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DealerForm from "../../../components/Form/DealerForm";
import Navbar from "../../../components/Navbar";
import PeopleIcon from '@mui/icons-material/People';
import Sidebar from "../../../components/Sidebar";
import { createDealer, getDealers } from "../../../api/dealers";
import { getOrders } from "../../../api/orders";
import type { Dealer } from "../../../types/dealer";
import type { Order } from "../../../types/order";
import "./Dealers.css";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingIcon from '@mui/icons-material/Pending';
import DealerDetails from "./DealersDetails";
import FinanceQuotation from "./FinanceQuotation";
import RequestEvaluation from "./RequestEvaluation";
import ApprovalProduction from "./ApprovalProduction";

type LoginState = { name?: string };
type WorkflowView = "details" | "evaluation" | "finance" | "approval";

export default function Dealers() {
	const location = useLocation();
	const [dealerList, setDealerList] = useState<Dealer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [ordersByDealer, setOrdersByDealer] = useState<Record<string, Order[]>>({});
	const [selectedOrderByDealer, setSelectedOrderByDealer] = useState<Record<string, string>>({});
	const [workflowView, setWorkflowView] = useState<{ type: WorkflowView; dealerId: string; orderId?: string } | null>(null);
	const loginState = location.state as LoginState | null;
	const totalOrders = dealerList.reduce((total, dealer) => total + dealer.orders, 0);
	const visibleDealerList = dealerList.filter((dealer) => (ordersByDealer[dealer.id] ?? []).length > 0);
	const pendingRequests = visibleDealerList.filter((dealer) => dealer.status === "Pending Approval").length;

	useEffect(() => {
		Promise.all([getDealers(), getOrders()])
			.then(([dealers, orders]) => {
				setDealerList(dealers);
				const groupedOrders = orders.reduce<Record<string, Order[]>>((grouped, order) => {
					grouped[order.dealerId] = [...(grouped[order.dealerId] ?? []), order];
					return grouped;
				}, {});
				setOrdersByDealer(groupedOrders);
				setSelectedOrderByDealer(Object.fromEntries(Object.entries(groupedOrders).map(([dealerId, dealerOrders]) => [dealerId, dealerOrders[0]?.id ?? ""])));
			})
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

	const closeWorkflowView = () => setWorkflowView(null);
	const openWorkflowView = (type: WorkflowView, dealerId: string) => {
		setWorkflowView({ type, dealerId, orderId: selectedOrderByDealer[dealerId] });
	};

	if (isLoading) return <div className="admin-layout"><Sidebar /><div className="admin-content"><Navbar adminName={loginState?.name ?? "Admin"} /><main className="admin-main dealers-main"><p>Loading dealers...</p></main></div></div>;
	if (error) return <div className="admin-layout"><Sidebar /><div className="admin-content"><Navbar adminName={loginState?.name ?? "Admin"} /><main className="admin-main dealers-main"><p>{error}</p></main></div></div>;

	return (
		<div className="admin-layout">
			<Sidebar />
			<div className="admin-content">
				<Navbar adminName={loginState?.name ?? "Admin"} />
				<main className="admin-main dealers-main">
					<div className="page-heading"><div><h1>Dealer Management</h1><p>Manage dealers and move their orders through the fleet workflow.</p></div></div>
					<section className="dealer-summary-grid" aria-label="Dealer summary">
						<article className="dealer-summary-card"><span><PeopleIcon /> Total Dealers</span><strong>{dealerList.length}</strong></article>
					<article className="dealer-summary-card"><span><ShoppingCartIcon /> Total Orders</span><strong>{totalOrders}</strong></article>
					<article className="dealer-summary-card"><span><PendingIcon /> Pending Requests</span><strong>{pendingRequests}</strong></article></section>
					<section className="dealers-table-card" aria-label="Dealer workflow table"><div className="table-scroll-wrapper"><table className="dealers-table"><thead><tr><th>Dealer ID</th><th>Dealer Name</th><th>Orders</th><th>Dealer Details</th><th>Request Evaluation</th><th>Finance &amp; Quotation</th><th>Approval &amp; Production</th></tr></thead><tbody>{visibleDealerList.map((dealer) => { const dealerOrders = ordersByDealer[dealer.id] ?? []; return <tr key={dealer.id}><td className="dealer-id">{dealer.id}</td><td><strong>{dealer.name}</strong><span className="dealer-location">{dealer.location}</span></td><td><select className="order-select" aria-label={`Select order for ${dealer.name}`} value={selectedOrderByDealer[dealer.id] ?? ""} onChange={(event) => setSelectedOrderByDealer((current) => ({ ...current, [dealer.id]: event.target.value }))}><option value="">No orders</option>{dealerOrders.map((order) => <option value={order.id} key={order.id}>{order.id} · {order.vehicleModel}</option>)}</select></td><td><button className="workflow-link details-link" type="button" disabled={!selectedOrderByDealer[dealer.id]} onClick={() => openWorkflowView("details", dealer.id)}><span>View</span><small>Profile &amp; orders</small></button></td><td><button className="workflow-link evaluation-link" type="button" disabled={!selectedOrderByDealer[dealer.id]} onClick={() => openWorkflowView("evaluation", dealer.id)}><span>View</span><small>Stock review</small></button></td><td><button className="workflow-link finance-link" type="button" disabled={!selectedOrderByDealer[dealer.id]} onClick={() => openWorkflowView("finance", dealer.id)}><span>View</span><small>Quotation</small></button></td><td><button className="workflow-link approval-link" type="button" disabled={!selectedOrderByDealer[dealer.id]} onClick={() => openWorkflowView("approval", dealer.id)}><span>View</span><small>Production status</small></button></td></tr>; })}</tbody></table></div></section>
					{isFormOpen && <DealerForm onSave={handleAddDealer} onClose={() => setIsFormOpen(false)} />}
					{workflowView?.type === "details" && <DealerDetails dealerId={workflowView.dealerId} orderId={workflowView.orderId} isModal onClose={closeWorkflowView} />}
					{workflowView?.type === "evaluation" && <RequestEvaluation dealerId={workflowView.dealerId} orderId={workflowView.orderId} isModal onClose={closeWorkflowView} />}
					{workflowView?.type === "finance" && <FinanceQuotation dealerId={workflowView.dealerId} orderId={workflowView.orderId} isModal onClose={closeWorkflowView} />}
					{workflowView?.type === "approval" && <ApprovalProduction dealerId={workflowView.dealerId} orderId={workflowView.orderId} isModal onClose={closeWorkflowView} />}
				</main>
			</div>
		</div>
	);
}

