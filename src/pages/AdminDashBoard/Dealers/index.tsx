import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DealerForm from "../../../components/Form/Admin_DealerForm";
import Navbar from "../../../components/Navbar";
import PeopleIcon from '@mui/icons-material/People';
import Sidebar from "../../../components/Sidebar";
import { createDealer, getDealers } from "../../../api/dealers";
import { useGetOrdersQuery } from "../../../features/orders/ordersApi";
import type { Dealer } from "../../../types/dealer";
import type { Order } from "../../../types/order";
import { getOrderDisplayNumber } from "../../../utils/orderDisplay";
import "./Dealers.css";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingIcon from '@mui/icons-material/Pending';
import DealerDetails from "./DealersDetails";
import ApprovalProduction from "./ApprovalProduction";

type LoginState = { name?: string };
type WorkflowView = "details" | "approval";

const confirmedOrderStatuses = new Set(["In Production", "Completed"]);

export default function Dealers() {
	const location = useLocation();
	const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useGetOrdersQuery();
	const [dealerList, setDealerList] = useState<Dealer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedOrderByDealer, setSelectedOrderByDealer] = useState<Record<string, string>>({});
	const [workflowView, setWorkflowView] = useState<{ type: WorkflowView; dealerId: string; orderId?: string } | null>(null);
	const loginState = location.state as LoginState | null;
	const ordersByDealer = useMemo(() => orders.reduce<Record<string, Order[]>>((grouped, order) => {
		grouped[order.dealerId] = [...(grouped[order.dealerId] ?? []), order];
		return grouped;
	}, {}), [orders]);
	const visibleDealers = useMemo(() => {
		const knownDealerIds = new Set(dealerList.map((dealer) => dealer.id));
		const requestDealers: Dealer[] = Object.entries(ordersByDealer)
			.filter(([dealerId]) => !knownDealerIds.has(dealerId))
			.map(([dealerId, dealerOrders]) => ({
				id: dealerId,
				name: `Dealer ${dealerId}`,
				location: "Location not provided",
				orders: dealerOrders.length,
				status: dealerOrders.some((order) => !confirmedOrderStatuses.has(order.status)) ? "Pending Approval" : "Order Confirmed",
			}));
		return [...dealerList, ...requestDealers].map((dealer) => ({
			...dealer,
			orders: ordersByDealer[dealer.id]?.length ?? dealer.orders,
		}));
	}, [dealerList, ordersByDealer]);
	const selectedOrderIds = useMemo(() => Object.fromEntries(Object.entries(ordersByDealer).map(([dealerId, dealerOrders]) => [
		dealerId,
		selectedOrderByDealer[dealerId] && dealerOrders.some((order) => order.id === selectedOrderByDealer[dealerId])
			? selectedOrderByDealer[dealerId]
			: dealerOrders[0]?.id ?? "",
	])), [ordersByDealer, selectedOrderByDealer]);
	const totalOrders = orders.length;
	const visibleDealerList = visibleDealers.filter((dealer) => (ordersByDealer[dealer.id] ?? []).length > 0);
	const pendingRequests = visibleDealerList.filter((dealer) => {
		const selectedOrder = (ordersByDealer[dealer.id] ?? []).find((order) => order.id === selectedOrderIds[dealer.id]);
		return selectedOrder ? !confirmedOrderStatuses.has(selectedOrder.status) : true;
	}).length;

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

	const closeWorkflowView = () => setWorkflowView(null);
	const openWorkflowView = (type: WorkflowView, dealerId: string) => {
		setWorkflowView({ type, dealerId, orderId: selectedOrderIds[dealerId] });
	};

	if (isLoading || ordersLoading) return <div className="admin-layout"><Sidebar /><div className="admin-content"><Navbar adminName={loginState?.name ?? "Amelia Martin"} role="Administrator" /><main className="admin-main dealers-main"><p>Loading dealers...</p></main></div></div>;
	if (error || ordersError) return <div className="admin-layout"><Sidebar /><div className="admin-content"><Navbar adminName={loginState?.name ?? "Amelia Martin"} role="Administrator" /><main className="admin-main dealers-main"><p role="alert">{error || "Unable to load orders."}</p></main></div></div>;

	return (
		<div className="admin-layout">
			<Sidebar />
			<div className="admin-content">
				<Navbar adminName={loginState?.name ?? "Amelia Martin"} role="Administrator" />
				<main className="admin-main dealers-main">
					<div className="page-heading"><div><h1>Dealer Management</h1><p>Manage dealers and move their orders through the fleet workflow.</p></div></div>
					<section className="dealer-summary-grid" aria-label="Dealer summary">
						<article className="dealer-summary-card"><span><PeopleIcon /> Total Dealers</span><strong>{dealerList.length}</strong></article>
					<article className="dealer-summary-card"><span><ShoppingCartIcon /> Total Orders</span><strong>{totalOrders}</strong></article>
					<article className="dealer-summary-card"><span><PendingIcon /> Pending Requests</span><strong>{pendingRequests}</strong></article></section>
					<section className="dealers-table-card" aria-label="Dealer workflow table">
						<div className="table-scroll-wrapper">
							<table className="dealers-table">
								<thead>
									<tr>
										<th>Dealer ID</th>
										<th>Dealer Name</th>
										<th>Orders</th>
										<th>Status</th>
										<th>Dealer Details</th>
										<th>Track Request</th>
										</tr>
									</thead>
							<tbody>{visibleDealerList.map((dealer) => { const dealerOrders = ordersByDealer[dealer.id] ?? [];
								const selectedOrder = dealerOrders.find((order) => order.id === selectedOrderIds[dealer.id]);
									const isOrderConfirmed = selectedOrder ? confirmedOrderStatuses.has(selectedOrder.status) : false;
									return <tr key={dealer.id}>
										<td className="dealer-id">{dealer.id}</td>
										<td><strong>{dealer.name}</strong>
										<span className="dealer-location">{dealer.location}</span></td>
										<td><select className="order-select" aria-label={`Select order for ${dealer.name}`} value={selectedOrderIds[dealer.id] ?? ""} onChange={(event) => setSelectedOrderByDealer((current) => ({ ...current, [dealer.id]: event.target.value }))}>
											<option value="">No orders</option>{dealerOrders.map((order) => <option value={order.id} key={order.id}>{getOrderDisplayNumber(order)} · {order.vehicleModel}</option>)}</select></td>
											<td>
												<span className={`request-status ${isOrderConfirmed ? "approved" : "pending"}`}>
													<span aria-hidden="true">{isOrderConfirmed ? "✓" : "!"}</span>
													{isOrderConfirmed ? "Order Confirmed" : "Pending"}
												</span>
											</td>
											<td>
												<button className="workflow-link details-link" type="button" disabled={!selectedOrderIds[dealer.id]} onClick={() => openWorkflowView("details", dealer.id)}>
												<span>View</span><small>Profile &amp; orders</small></button></td>
												<td><button className="workflow-link approval-link" type="button" disabled={!selectedOrderIds[dealer.id]} onClick={() => openWorkflowView("approval", dealer.id)}>
												<span>View</span><small>Production status</small></button></td></tr>; 
											})}
										</tbody>
							</table></div></section>
					{isFormOpen && <DealerForm onSave={handleAddDealer} onClose={() => setIsFormOpen(false)} />}
					{workflowView?.type === "details" && <DealerDetails dealerId={workflowView.dealerId} orderId={workflowView.orderId} isModal onClose={closeWorkflowView} />}
					{workflowView?.type === "approval" && <ApprovalProduction dealerId={workflowView.dealerId} orderId={workflowView.orderId} isModal onClose={closeWorkflowView} />}
				</main>
			</div>
		</div>
	);
}
