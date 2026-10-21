import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NumbersIcon from "@mui/icons-material/Numbers";
import BusinessIcon from "@mui/icons-material/Business";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import type { Order } from "../../types/order";
import "./OrderDetailsDialog.css";

type OrderDetailsDialogProps = {
	order: Order | null;
	onClose: () => void;
};

/**
 * Workflow stages in exact sequential order:
 * 1. Dealer Request
 * 2. Manufacturer
 * 3. Finance Head
 * 4. Sales Manager
 * 5. Dealer Manager
 * 6. Delivered
 */
const WORKFLOW_STEPS = [
	{
		id: "dealer-request",
		title: "Dealer Request",
		role: "Dealer",
		desc: "Fleet order submitted and waiting for manufacturer stock check.",
	},
	{
		id: "manufacturer",
		title: "Manufacturer",
		role: "Manufacturer",
		desc: "Checking vehicle stock availability and allocation.",
	},
	{
		id: "finance-head",
		title: "Finance Head",
		role: "Finance Head",
		desc: "Preparing financial quotation and pricing review.",
	},
	{
		id: "sales-manager",
		title: "Sales Manager",
		role: "Sales Manager",
		desc: "Reviewing quotation and authorizing final order approval.",
	},
	{
		id: "dealer-manager",
		title: "Dealer Manager",
		role: "Dealer Manager",
		desc: "Acknowledging approved order and scheduling dispatch.",
	},
	{
		id: "delivered",
		title: "Delivered",
		role: "Logistics",
		desc: "Fleet vehicles fulfilled and delivered to dealership.",
	},
];

function getActiveStep(status: string): { index: number; isRejected: boolean } {
	const s = (status || "").toLowerCase();
	if (s.includes("reject") || s.includes("decline")) return { index: 3, isRejected: true };
	if (s.includes("deliver")) return { index: 5, isRejected: false };
	if (s.includes("dealer manager")) return { index: 4, isRejected: false };
	if (s.includes("sales manager") || s.includes("approv")) return { index: 3, isRejected: false };
	if (s.includes("financehead") || s.includes("quotation")) return { index: 2, isRejected: false };
	if (s.includes("manufacturer") || s.includes("stock") || s.includes("under review")) return { index: 1, isRejected: false };
	return { index: 0, isRejected: false };
}

export default function OrderDetailsDialog({ order, onClose }: OrderDetailsDialogProps) {
	if (!order) {
		return <Drawer anchor="right" open={false} onClose={onClose} />;
	}

	const normalizedStatus = (order.status || "").toLowerCase();
	const statusSlug = normalizedStatus.replace(/[^a-z0-9]+/g, "-");
	const { index: activeStep, isRejected } = getActiveStep(order.status || "");
	const currentStepInfo = WORKFLOW_STEPS[isRejected ? 3 : activeStep] ?? WORKFLOW_STEPS[0];

	const formatDate = (value?: string, dateOnly = false) => {
		if (!value) return "Not available";
		try {
			const date = new Date(dateOnly ? `${value}T00:00:00` : value);
			if (isNaN(date.getTime())) return value;
			return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
		} catch {
			return value;
		}
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
				{/* Header */}
				<header className="order-dialog-header">
					<div>
						<div className="order-dialog-eyebrow-row">
							<span className="order-dialog-eyebrow">Fleet Order Details</span>
							<span className={`order-dialog-badge order-dialog-badge--${statusSlug}`}>
								{order.status}
							</span>
						</div>
						<h2 id="order-dialog-title">{order.requestNumber ?? order.id}</h2>
					</div>
					<IconButton aria-label="Close order details" onClick={onClose} size="small">
						<CloseIcon fontSize="small" />
					</IconButton>
				</header>

				{/* Primary Vehicle Banner */}
				<section className="order-dialog-vehicle" aria-label="Vehicle and order status">
					<div className="order-dialog-vehicle-icon">
						<DirectionsCarIcon />
					</div>
					<div className="order-dialog-vehicle-copy">
						<h3>
							{order.items && order.items.length > 1
								? `Fleet Procurement · ${order.items.length} Car Models`
								: order.vehicleModel}
						</h3>
						<p>Submitted on {formatDate(order.orderDate)} · Dealer ID: <strong>{order.dealerId}</strong></p>
					</div>
					<div className="order-dialog-vehicle-total">
						<span>Total Units</span>
						<strong>{order.quantity}</strong>
					</div>
				</section>

				{/* Summary Metrics */}
				<section className="order-dialog-section">
					<div className="order-dialog-section-header">
						<h3>Order Summary</h3>
					</div>
					<div className="order-summary-grid">
						<div className="order-summary-card">
							<div className="order-summary-card-icon"><NumbersIcon fontSize="small" /></div>
							<div>
								<span>Quantity Ordered</span>
								<strong>{order.quantity} units</strong>
							</div>
						</div>
						<div className="order-summary-card">
							<div className="order-summary-card-icon"><BusinessIcon fontSize="small" /></div>
							<div>
								<span>Dealer Account</span>
								<strong>{order.dealerId}</strong>
							</div>
						</div>
						<div className="order-summary-card">
							<div className="order-summary-card-icon"><CalendarTodayIcon fontSize="small" /></div>
							<div>
								<span>Order Date</span>
								<strong>{formatDate(order.orderDate)}</strong>
							</div>
						</div>
						<div className="order-summary-card">
							<div className="order-summary-card-icon"><EventAvailableIcon fontSize="small" /></div>
							<div>
								<span>Expected Delivery</span>
								<strong>{formatDate(order.etaDelivery, true)}</strong>
							</div>
						</div>
					</div>
				</section>

				{/* 6-Stage Tracking Section */}
				<section className="order-dialog-section order-dialog-tracking-section">
					<div className="order-dialog-section-header">
						<div>
							<h3>Order Lifecycle Tracker</h3>
							<p className="order-section-subtitle">Real-time status across multi-department workflow</p>
						</div>
					</div>

					{/* Stepper Bar */}
					<div className="order-stepper-wrapper">
						<div className="order-stepper-track">
							{WORKFLOW_STEPS.map((step, idx) => {
								const isCompleted = isRejected ? idx < 3 : idx < activeStep;
								const isCurrent = isRejected ? idx === 3 : idx === activeStep;

								let stepStateClass = "is-upcoming";
								let stateLabel = "Pending";
								if (isCompleted) {
									stepStateClass = "is-complete";
									stateLabel = "Completed";
								} else if (isCurrent) {
									stepStateClass = isRejected ? "is-rejected" : "is-current";
									stateLabel = isRejected ? "Rejected" : "In Progress";
								} else if (isRejected && idx > 3) {
									stateLabel = "Skipped";
								}

								return (
									<div className={`order-stepper-node ${stepStateClass}`} key={step.id}>
										{/* Connecting line to the next step */}
										{idx < WORKFLOW_STEPS.length - 1 && (
											<div
												className={`order-stepper-connector ${
													isCompleted && !isRejected ? "is-connector-complete" : ""
												}`}
											/>
										)}

										{/* Circle marker */}
										<div className="order-stepper-circle">
											{isCompleted ? (
												<CheckIcon sx={{ fontSize: 14 }} />
											) : isCurrent && isRejected ? (
												<CloseIcon sx={{ fontSize: 14 }} />
											) : isCurrent ? (
												<span className="current-step-num">{idx + 1}</span>
											) : (
												<span className="upcoming-step-num">{idx + 1}</span>
											)}
										</div>

										{/* Labels */}
										<div className="order-stepper-text">
											<span className="order-stepper-title">{step.title}</span>
											<span className="order-stepper-state">{stateLabel}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Active Stage Callout Card */}
					<div className={`order-current-stage-card ${isRejected ? "is-rejected-card" : ""}`}>
						<div className="order-current-stage-badge">
							{isRejected ? "REJECTED" : "CURRENT STAGE"}
						</div>
						<div className="order-current-stage-body">
							<h4>
								{isRejected ? "Order Rejected by Sales Manager" : `${currentStepInfo.title} (${currentStepInfo.role})`}
							</h4>
							<p>
								{isRejected
									? "This order was declined during the Sales Manager review phase. Contact sales administration for revisions."
									: currentStepInfo.desc}
							</p>
						</div>
						{activeStep < 5 && !isRejected && (
							<div className="order-next-stage-hint">
								<span>Next: </span>
								<strong>{WORKFLOW_STEPS[activeStep + 1]?.title}</strong>
							</div>
						)}
					</div>
				</section>

				{/* Order Items Table */}
				<section className="order-dialog-section">
					<div className="order-dialog-section-header">
						<h3>
							Order Items {order.items && order.items.length > 0 ? `(${order.items.length} Models)` : ""}
						</h3>
					</div>

					<div className="order-items-table-wrap">
						{order.items && order.items.length > 0 ? (
							<table className="order-items-table">
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
											<td>
												<strong className="item-model-name">{item.model}</strong>
											</td>
											<td>
												<span className="item-variant-chip">{item.variant}</span>
											</td>
											<td>
												{item.color ? (
													<span className="item-color-chip">
														<span
															className="item-color-swatch"
															style={{ backgroundColor: item.colorHex || "#888" }}
														/>
														<span>{item.color}</span>
													</span>
												) : (
													<span style={{ color: "#94a3b8" }}>—</span>
												)}
											</td>
											<td>
												<span className="item-specs-text">
													{[item.specs?.engine, item.specs?.fuel, item.specs?.transmission]
														.filter(Boolean)
														.join(" · ") || "Standard"}
												</span>
											</td>
											<td style={{ textAlign: "right" }}>
												<strong className="item-qty-text">{item.quantity}</strong> units
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<table className="order-items-table">
								<thead>
									<tr>
										<th>Model</th>
										<th>Variant</th>
										<th>Quantity</th>
										<th>Status</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td><strong>{order.vehicleModel}</strong></td>
										<td><span className="item-variant-chip">Standard Fleet</span></td>
										<td><strong className="item-qty-text">{order.quantity}</strong> units</td>
										<td>
											<span className={`order-dialog-badge order-dialog-badge--${statusSlug}`}>
												{order.status}
											</span>
										</td>
									</tr>
								</tbody>
							</table>
						)}
					</div>
				</section>

				{/* Workflow Note Footer */}
				<aside className="order-dialog-note">
					<InfoOutlinedIcon />
					<div>
						<strong>Department Lifecycle Protocol:</strong>
						<p>
							Orders advance through: Dealer Request → Manufacturer (stock check) → Finance Head (quotation) → Sales Manager (approval) → Dealer Manager (dispatch) → Delivered.
						</p>
					</div>
				</aside>
			</div>
		</Drawer>
	);
}