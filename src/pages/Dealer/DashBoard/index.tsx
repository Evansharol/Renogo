import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Sidebar from "../../../components/Sidebar";
import { createOrder, getOrdersByDealerId } from "../../../api/orders";
import type { Order } from "../../../types/order";
import OrderDetailsDialog from "../../../components/OrderDetailsDialog";
import "./DealerDashboard.css";

type LoginState = { name?: string; userId?: string; dealerId?: string };

export default function ViewOrder() {
	const location = useLocation();
	const loginState = location.state as LoginState | null;
	const [orders, setOrders] = useState<Order[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isLoading, setIsLoading] = useState(Boolean(loginState?.dealerId));
	const [error, setError] = useState("");
	const [orderIdSearch, setOrderIdSearch] = useState("");
	const [modelFilter, setModelFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showOrderForm, setShowOrderForm] = useState(false);
	const [vehicleModel, setVehicleModel] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [etaDelivery, setEtaDelivery] = useState("");
	const [isCreatingOrder, setIsCreatingOrder] = useState(false);
	const [createOrderError, setCreateOrderError] = useState("");
	const [requestSent, setRequestSent] = useState("");
	const dealerId = loginState?.dealerId;

	useEffect(() => {
		if (!dealerId) return;

		let isActive = true;
		getOrdersByDealerId(dealerId)
			.then((dealerOrders) => {
				if (isActive) setOrders(dealerOrders);
			})
			.catch(() => {
				if (isActive) setError("Unable to load orders");
			})
			.finally(() => {
				if (isActive) setIsLoading(false);
			});
		return () => {
			isActive = false;
		};
	}, [dealerId]);

	async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!dealerId) return;

		setIsCreatingOrder(true);
		setCreateOrderError("");
		setRequestSent("");
		try {
			const newOrder = await createOrder({
				dealerId,
				vehicleModel: vehicleModel.trim(),
				quantity,
				status: "Pending Approval",
				orderDate: new Date().toISOString(),
				etaDelivery: etaDelivery || undefined,
			});
			setOrders((currentOrders) => [...currentOrders, newOrder]);
			setVehicleModel("");
			setQuantity(1);
			setEtaDelivery("");
			setShowOrderForm(false);
			setRequestSent(`Order request ${newOrder.id} was sent to admin for approval.`);
		} catch {
			setCreateOrderError("Unable to create order. Please try again.");
		} finally {
			setIsCreatingOrder(false);
		}
	}

	const pendingOrders = orders.filter((order) => order.status.toLowerCase().includes("pending")).length;
	const deliveredOrders = orders.filter((order) => order.status.toLowerCase().includes("delivered")).length;
	const availableModels = [...new Set(orders.map((order) => order.vehicleModel))].sort();
	const availableStatuses = [...new Set(orders.map((order) => order.status))].sort();
	const orderLoadError = dealerId ? error : "Dealer ID is missing. Please sign in again.";
	const filteredOrders = orders.filter((order) =>
		order.id.toLowerCase().includes(orderIdSearch.trim().toLowerCase()) &&
		(!modelFilter || order.vehicleModel === modelFilter) &&
		(!statusFilter || order.status === statusFilter)
	);
	const formatDate = (value?: string, dateOnly = false) => {
		if (!value) return "-";
		const date = new Date(dateOnly ? `${value}T00:00:00` : value);
		return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
	};

	return (
		<div className="admin-layout">
			<Sidebar variant="dealer" />
			<div className="admin-content">
				<Navbar adminName={loginState?.name ?? "Dealer"} />
				<main className="admin-main">
					<div className="page-heading">
						<div>
							<h1>Dashboard</h1>
						</div>
					</div>

					<section className="summary-grid" aria-label="Dashboard summary">
                        <article className="summary-card">
                            <span className="summary-label"><ShoppingCartIcon /> Total Orders</span>
							<strong>{orders.length}</strong>
                        </article>
                        <article className="summary-card">
                            <span className="summary-label"><PendingActionsIcon /> Pending Orders</span>
							<strong>{pendingOrders}</strong>
                        </article>
						<article className="summary-card">
							<span className="summary-label"><LocalShippingIcon /> Delivered Orders</span>
							<strong>{deliveredOrders}</strong>
                        </article>
                    </section>

					<section className="dealer-orders" aria-labelledby="dealer-orders-heading">
						<div className="dealer-orders-heading">
							<h2 id="dealer-orders-heading">My Orders</h2>
							<button className="order-view-button" type="button" onClick={() => { setRequestSent(""); setShowOrderForm(true); }}>
								Add Order
							</button>
						</div>
						{requestSent && <p className="order-request-success" role="status">{requestSent}</p>}
						<Dialog open={showOrderForm} onClose={() => !isCreatingOrder && setShowOrderForm(false)} fullWidth maxWidth="sm" aria-labelledby="request-order-title">
							<DialogTitle className="request-order-title" id="request-order-title">
								Request an order
								<IconButton aria-label="Close request order dialog" onClick={() => setShowOrderForm(false)} disabled={isCreatingOrder}>
									<CloseIcon />
								</IconButton>
							</DialogTitle>
							<DialogContent className="request-order-content">
								<p className="request-order-description">Submit the order details for admin approval.</p>
								<form id="request-order-form" className="new-order-form" onSubmit={handleCreateOrder}>
									<label>
										Order model
										<input
											autoFocus
											required
											value={vehicleModel}
											onChange={(event) => setVehicleModel(event.target.value)}
											placeholder="e.g. Renault Kiger"
										/>
									</label>
									<label>
										Quantity
										<input
											type="number"
											min="1"
											required
											value={quantity}
											onChange={(event) => setQuantity(Number(event.target.value))}
										/>
									</label>
									<label>
										Expected delivery date
										<input
											type="date"
											required
											min={new Date().toISOString().slice(0, 10)}
											value={etaDelivery}
											onChange={(event) => setEtaDelivery(event.target.value)}
										/>
									</label>
									{createOrderError && <p className="orders-message" role="alert">{createOrderError}</p>}
								</form>
							</DialogContent>
							<DialogActions className="request-order-actions">
								<button className="order-view-button" type="submit" form="request-order-form" disabled={isCreatingOrder}>
									{isCreatingOrder ? "Sending request..." : "Request Order"}
								</button>
							</DialogActions>
						</Dialog>
						{isLoading ? (
							<p className="orders-message">Loading orders...</p>
						) : orderLoadError ? (
							<p className="orders-message" role="alert">{orderLoadError}</p>
						) : (
							<>
								<div className="order-filters" role="search" aria-label="Filter orders">
									<label className="order-search-field">
										<SearchIcon aria-hidden="true" />
										<span className="visually-hidden">Search by order ID</span>
										<input
											aria-label="Search by order ID"
											placeholder="Search by order ID"
											value={orderIdSearch}
											onChange={(event) => setOrderIdSearch(event.target.value)}
										/>
									</label>
									<label className="order-filter-select">
										<span className="visually-hidden">Filter by model</span>
										<select aria-label="Filter by model" value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
											<option value="">All models</option>
											{availableModels.map((model) => <option key={model} value={model}>{model}</option>)}
										</select>
									</label>
									<label className="order-filter-select">
										<span className="visually-hidden">Filter by status</span>
										<select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
											<option value="">All statuses</option>
											{availableStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
										</select>
									</label>
								</div>
								{orders.length === 0 ? (
							<p className="orders-message">No orders found.</p>
									) : filteredOrders.length === 0 ? (
										<p className="orders-message">No orders match these filters.</p>
									) : (
									<div className="orders-table-wrap">
								<table className="orders-table">
									<thead>
										<tr>
											<th scope="col">Order ID</th>
											<th scope="col">Order Date</th>
											<th scope="col">Quantity</th>
											<th scope="col">Order Status</th>
											<th scope="col">ETA / Delivery</th>
											<th scope="col">Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredOrders.map((order) => (
											<tr key={order.id}>
												<td>{order.id}</td>
												<td><time className="orders-date" dateTime={order.orderDate}>{formatDate(order.orderDate)}</time></td>
												<td>{order.quantity}</td>
												<td><span className={`order-status order-status--${order.status.toLowerCase().replace(/\s+/g, "-")}`}>{order.status}</span></td>
												<td><time className="orders-date" dateTime={order.etaDelivery}>{formatDate(order.etaDelivery, true)}</time></td>
												<td>
													<button
														className="order-view-button"
														type="button"
														onClick={() => setSelectedOrder(order)}
													>
														View
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
								)}
							</>
						)}
					</section>
					<OrderDetailsDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />
				</main>
			</div>
		</div>
	);
}
