import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import type { Order } from "../../types/order";
import "./OrderDetailsDialog.css";

type OrderDetailsDialogProps = {
	order: Order | null;
	onClose: () => void;
};

export default function OrderDetailsDialog({ order, onClose }: OrderDetailsDialogProps) {
	if (!order) {
		return <Drawer anchor="right" open={false} onClose={onClose} />;
	}

	const normalizedStatus = order.status.toLowerCase();
	const statusClass = normalizedStatus.replace(/\s+/g, "-");
	const progressLabels = ["Order placed", "Approved", "In production", "In transit", "Delivered"];
	const activeStep = normalizedStatus.includes("deliver")
		? 4
		: normalizedStatus.includes("transit")
			? 3
			: normalizedStatus.includes("production")
				? 2
				: normalizedStatus.includes("approv")
					? 1
					: 0;
	const formatDate = (value?: string, dateOnly = false) => {
		if (!value) return "Not available";
		const date = new Date(dateOnly ? `${value}T00:00:00` : value);
		return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
	};

	return (
		<Drawer
			anchor="right"
			open={Boolean(order)}
			onClose={onClose}
			slotProps={{
				paper: {
					className: "order-dialog-panel",
					role: "dialog",
					"aria-modal": true,
					"aria-labelledby": "order-dialog-title",
				},
			}}
		>
			<div className="order-dialog-content">
				<header className="order-dialog-header">
					<div>
						<p className="order-dialog-eyebrow">Order details</p>
						<h2 id="order-dialog-title">{order.id}</h2>
					</div>
					<IconButton aria-label="Close order details" onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</header>

				<section className="order-dialog-vehicle" aria-label="Vehicle and order status">
					<div className="order-dialog-vehicle-icon">
						<DirectionsCarIcon />
					</div>
					<div className="order-dialog-vehicle-copy">
						<h3>{order.vehicleModel}</h3>
						<p>Order date: {formatDate(order.orderDate)}</p>
					</div>
					<span className={`order-dialog-status order-dialog-status--${statusClass}`}>
						{order.status}
					</span>
				</section>

				<section className="order-dialog-section" id="order-summary" aria-labelledby="order-summary-heading">
					<h3 id="order-summary-heading">Order summary</h3>
					<div className="order-summary-grid">
						<div className="order-summary-metric">
							<span>Quantity ordered</span>
							<strong>{order.quantity}</strong>
						</div>
						<div className="order-summary-metric">
							<span>Dealer ID</span>
							<strong>{order.dealerId}</strong>
						</div>
						<div className="order-summary-meta">
							<CalendarTodayIcon />
							<div><span>Order date</span><strong>{formatDate(order.orderDate)}</strong></div>
						</div>
						<div className="order-summary-meta">
							<EventAvailableIcon />
							<div><span>Expected delivery</span><strong>{formatDate(order.etaDelivery, true)}</strong></div>
						</div>
					</div>
				</section>

				<section className="order-dialog-section" id="order-progress" aria-labelledby="order-progress-heading">
					<h3 id="order-progress-heading">Vehicle status</h3>
					<ol className="order-progress-list">
						{progressLabels.map((label, index) => (
							<li className={index < activeStep ? "is-complete" : index === activeStep ? "is-current" : ""} key={label}>
								<span className="order-progress-marker">
									{index <= activeStep ? <CheckCircleIcon /> : <span />}
								</span>
								<span className="order-progress-label">{label}</span>
							</li>
						))}
					</ol>
				</section>

				<section className="order-dialog-section" id="order-items" aria-labelledby="order-items-heading">
					<h3 id="order-items-heading">Order items</h3>
					<div className="order-items-table-wrap">
						<table className="order-items-table">
							<thead><tr><th>Model</th><th>Quantity</th><th>Status</th></tr></thead>
							<tbody><tr><td>{order.vehicleModel}</td><td>{order.quantity}</td><td><span className={`order-dialog-status order-dialog-status--${statusClass}`}>{order.status}</span></td></tr></tbody>
						</table>
					</div>
				</section>

				<aside className="order-dialog-note">
					<InfoOutlinedIcon />
					<p>Order progress and delivery details are updated by the admin team.</p>
				</aside>
			</div>
		</Drawer>
	);
}