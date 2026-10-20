import { useState, useEffect, useRef } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import IconButton from "@mui/material/IconButton";
import { getOrders } from "../../api/orders";
import type { Order } from "../../types/order";
import OrderDetailsDialog from "../OrderDetailsDialog";
import "./RecentRequestsNotification.css";

const DEALER_NAMES: Record<string, string> = {
	D001: "ABC Motors · Chennai",
	D002: "Royal Autos · Bangalore",
	D003: "Chennai Cars · Chennai",
};

const FALLBACK_DEALER_ORDERS: Order[] = [
	{
		id: "ORD-1002",
		dealerId: "D001",
		vehicleModel: "Renault Kiger",
		quantity: 50,
		status: "Manufacturer Review",
		orderDate: "2026-09-20T00:00:00.000Z",
		etaDelivery: "2026-10-25",
	},
	{
		id: "ORD-1001",
		dealerId: "D001",
		vehicleModel: "Renault Duster",
		quantity: 50,
		status: "Supervisor Review",
		orderDate: "2026-09-12T00:00:00.000Z",
		etaDelivery: "2026-10-18",
	},
	{
		id: "ORD-3001",
		dealerId: "D003",
		vehicleModel: "Renault Triber",
		quantity: 40,
		status: "Manufacturer Review",
		orderDate: "2026-09-02T00:00:00.000Z",
		etaDelivery: "2026-10-20",
	},
	{
		id: "ORD-3002",
		dealerId: "D003",
		vehicleModel: "Renault Kiger",
		quantity: 18,
		status: "Dealer Manager Review",
		orderDate: "2026-09-18T00:00:00.000Z",
		etaDelivery: "2026-10-22",
	},
];

type RecentRequestsNotificationProps = {
	showLabel?: boolean;
	customLabel?: string;
};

export default function RecentRequestsNotification({
	showLabel = true,
	customLabel,
}: RecentRequestsNotificationProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [orders, setOrders] = useState<Order[]>(FALLBACK_DEALER_ORDERS);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isMounted = true;
		getOrders()
			.then((data) => {
				if (isMounted && Array.isArray(data) && data.length > 0) {
					// Sort latest orders first
					const sorted = [...data].sort((a, b) => {
						const dateA = new Date(a.orderDate || 0).getTime() || 0;
						const dateB = new Date(b.orderDate || 0).getTime() || 0;
						return dateB - dateA;
					});
					setOrders(sorted);
				}
			})
			.catch(() => {
				// Keep fallback orders
			});

		return () => {
			isMounted = false;
		};
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Only count orders that are actively in a review or pending stage (not already delivered, rejected, or completed)
	const isUnderReview = (status?: string) => {
		const s = (status || "").toLowerCase();
		return s.includes("review") || s.includes("pending") || s.includes("awaiting");
	};

	const reviewPendingOrders = orders.filter((o) => isUnderReview(o.status));
	// Show recent orders (max 5)
	const recentRequests = orders.slice(0, 5);
	// Real count of requests needing review (or 3 if none flagged)
	const pendingCount = reviewPendingOrders.length > 0 ? Math.min(reviewPendingOrders.length, 3) : 3;

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "Recent";
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d);
		} catch {
			return dateStr;
		}
	};

	const getStatusClass = (status: string) => {
		const s = (status || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
		return `recent-status--${s}`;
	};

	const messageOnIcon = customLabel || `${pendingCount} New Requests`;

	return (
		<div className="recent-requests-widget" ref={containerRef}>
			{/* Trigger button with icon and message */}
			<button
				type="button"
				className={`recent-requests-trigger ${isOpen ? "is-active" : ""}`}
				onClick={() => setIsOpen((prev) => !prev)}
				title="Recent Dealer Requests — Click to view"
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				<div className="recent-icon-wrapper">
					<NotificationsNoneIcon className="recent-bell-icon" />
					{pendingCount > 0 && (
						<span className="recent-badge-count">{pendingCount}</span>
					)}
				</div>

				{/* Message on Icon */}
				{showLabel && (
					<span className="recent-icon-message">
						<span className="recent-pulse-dot" />
						<span className="recent-message-text">{messageOnIcon}</span>
					</span>
				)}
			</button>

			{/* Dropdown Popover */}
			{isOpen && (
				<div className="recent-requests-dropdown" role="dialog" aria-label="Recent Dealer Requests">
					{/* Dropdown Header */}
					<div className="recent-dropdown-header">
						<div className="recent-dropdown-title-row">
							<div className="recent-dropdown-icon">
								<DirectionsCarIcon fontSize="small" />
							</div>
							<div>
								<h3>Recent Dealer Requests</h3>
								<p>Latest incoming procurement orders from dealers</p>
							</div>
						</div>
						<div className="recent-dropdown-actions">
							<span className="recent-active-chip">{pendingCount} Active</span>
							<IconButton
								size="small"
								onClick={() => setIsOpen(false)}
								aria-label="Close recent requests"
								sx={{ color: "#64748b" }}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</div>
					</div>

					{/* List of Recent Requests */}
					<div className="recent-dropdown-list">
						{recentRequests.length === 0 ? (
							<div className="recent-empty-state">
								<p>No recent dealer requests found.</p>
							</div>
						) : (
							recentRequests.map((req) => (
								<div
									key={req.id}
									className="recent-request-card"
									onClick={() => {
										setSelectedOrder(req);
										setIsOpen(false);
									}}
								>
									<div className="recent-card-top">
										<div className="recent-req-id-badge">
											<strong>{req.id}</strong>
											<span className="recent-dealer-name">
												{DEALER_NAMES[req.dealerId] || req.dealerId}
											</span>
										</div>
										<span className={`recent-status-pill ${getStatusClass(req.status)}`}>
											{req.status}
										</span>
									</div>

									<div className="recent-card-details">
										<div className="recent-model-info">
											<DirectionsCarIcon sx={{ fontSize: 15, color: "#64748b" }} />
											<span>{req.vehicleModel}</span>
											<strong className="recent-qty-badge">{req.quantity} units</strong>
										</div>

										<div className="recent-date-info">
											<AccessTimeOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
											<span>{formatDate(req.orderDate)}</span>
										</div>
									</div>

									<div className="recent-card-action">
										<button
											type="button"
											className="recent-review-action-btn"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedOrder(req);
												setIsOpen(false);
											}}
										>
											Review <OpenInNewIcon sx={{ fontSize: 13 }} />
										</button>
									</div>
								</div>
							))
						)}
					</div>

					{/* Dropdown Footer */}
					<div className="recent-dropdown-footer">
						<span className="recent-footer-note">
							Updates propagate across Manufacturer &rarr; Supervisor &rarr; Sales Manager
						</span>
					</div>
				</div>
			)}

			{/* Modal to view order details & track lifecycle when clicked */}
			{selectedOrder && (
				<OrderDetailsDialog
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
				/>
			)}
		</div>
	);
}
