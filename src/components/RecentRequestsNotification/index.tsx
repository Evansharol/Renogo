import { useEffect, useMemo, useRef, useState } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import { useGetOrdersQuery } from "../../features/orders/ordersApi";
import type { Order } from "../../types/order";
import { getOrderDisplayNumber } from "../../utils/orderDisplay";
import "./RecentRequestsNotification.css";

type RequestRole = "Dealer" | "Manufacturer" | "Finance Head" | "Sales Manager" | "Dealer Manager";

type RecentRequestsNotificationProps = {
  role: string;
  dealerId?: string;
};

const ROLE_REQUESTS: Record<RequestRole, { statuses: string[]; route: string }> = {
  Dealer: { statuses: [], route: "/dealer/my-requests" },
  Manufacturer: { statuses: ["Pending Manufacturer Review"], route: "/manufacturer/view-requests" },
  "Finance Head": {
    statuses: ["Pending Finance Quotation", "Pending Finance Approval"],
    route: "/financehead/dashboard",
  },
  "Sales Manager": { statuses: ["Pending Sales Manager Approval", "Pending Approval"], route: "/salesmanager/verification-approval" },
  "Dealer Manager": {
    statuses: ["Approved by Sales Manager", "Awaiting Payment", "Payment Submitted"],
    route: "/dealermanager/requests",
  },
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Date unavailable";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const formatAmount = (amount?: number) =>
  amount == null ? "Not available" : `₹${amount.toLocaleString("en-IN")}`;

export default function RecentRequestsNotification({ role, dealerId }: RecentRequestsNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "");
  const requestRole = (Object.keys(ROLE_REQUESTS) as RequestRole[]).find(
    (candidate) => candidate.toLowerCase().replace(/\s+/g, "") === normalizedRole,
  );

  const { data: orders = [], isLoading, isError } = useGetOrdersQuery();
  const roleConfig = requestRole ? ROLE_REQUESTS[requestRole] : null;
  const recentRequests = useMemo(() => {
    if (!requestRole) return [];
    const scopedOrders = requestRole === "Dealer"
      ? orders.filter((order) => order.dealerId === dealerId)
      : orders.filter((order) => roleConfig?.statuses.includes(order.status));
    return [...scopedOrders]
      .sort((first, second) => new Date(second.orderDate ?? 0).getTime() - new Date(first.orderDate ?? 0).getTime())
      .slice(0, 5);
  }, [dealerId, orders, requestRole, roleConfig]);

  const pendingCount = useMemo(() => {
    if (!requestRole || requestRole === "Dealer") return 0;
    return orders.filter((order) => roleConfig?.statuses.includes(order.status)).length;
  }, [orders, requestRole, roleConfig]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!requestRole || !roleConfig) return null;

  const openRoleRequests = (requestId?: string) => {
    setIsOpen(false);
    navigate(requestId ? `${roleConfig.route}?requestId=${encodeURIComponent(requestId)}` : roleConfig.route);
  };

  const getRoleDetails = (order: Order) => {
    switch (requestRole) {
      case "Dealer":
        return (
          <>
            <strong>Workflow progress</strong>
            {(order.workflowHistory ?? []).slice(-3).reverse().map((stage) => (
              <span key={`${stage.status}-${stage.timestamp}`}>{stage.status} · {formatDate(stage.timestamp)}</span>
            ))}
            {order.remarks && <span>Latest update: {order.remarks}</span>}
          </>
        );
      case "Manufacturer":
        return (
          <>
            <span>Allocation: {order.allocation?.manufacturerStatus ?? "Awaiting allocation"}</span>
            <span>Requested units: {order.quantity}</span>
            {order.items?.map((item) => (
              <span key={item.id}>{item.model} · {item.variant} · {item.quantity} units · {item.color ?? "Any color"}</span>
            ))}
          </>
        );
      case "Finance Head":
        return (
          <>
            <span>Estimated total: {formatAmount(order.estimatedTotal)}</span>
            <span>Current owner: {order.currentOwner ?? "Finance Head"}</span>
            {order.remarks && <span>Request note: {order.remarks}</span>}
          </>
        );
      case "Sales Manager":
        return (
          <>
            <span>Allocation: {order.allocation?.manufacturerStatus ?? "Manufacturer allocation recorded"}</span>
            <span>Estimated total: {formatAmount(order.estimatedTotal)}</span>
            {order.remarks && <span>Review note: {order.remarks}</span>}
          </>
        );
      case "Dealer Manager":
        return (
          <>
            <span>Payment status: {order.status === "Approved by Sales Manager" ? "Awaiting acknowledgement" : order.status}</span>
            <span>Quotation total: {formatAmount(order.estimatedTotal)}</span>
            {order.paymentProof && <span>Payment proof: {order.paymentProof.fileName}</span>}
            {order.paymentProof?.remarks && <span>Payment note: {order.paymentProof.remarks}</span>}
          </>
        );
    }
  };

  const title = requestRole === "Dealer" ? "My Recent Requests" : `${requestRole} Requests`;
  const subtitle = requestRole === "Dealer"
    ? "Your latest fleet requests and workflow updates"
    : "Requests currently waiting for your role";

  return (
    <div className="recent-requests-widget" ref={containerRef}>
      <button
        type="button"
        className={`recent-requests-trigger ${isOpen ? "is-active" : ""}`}
        onClick={() => setIsOpen((previous) => !previous)}
        title={`View ${title}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${title}${pendingCount ? `, ${pendingCount} awaiting action` : ""}`}
      >
        <span className="recent-icon-wrapper">
          <NotificationsNoneIcon className="recent-bell-icon" />
          {pendingCount > 0 && <span className="recent-badge-count">{pendingCount > 99 ? "99+" : pendingCount}</span>}
        </span>
      </button>

      {isOpen && (
        <div className="recent-requests-dropdown" role="dialog" aria-label={title}>
          <div className="recent-dropdown-header">
            <div className="recent-dropdown-title-row">
              <div className="recent-dropdown-icon"><DirectionsCarIcon fontSize="small" /></div>
              <div>
                <h3>{title}</h3>
                <p>{subtitle}</p>
              </div>
            </div>
            <div className="recent-dropdown-actions">
              {requestRole !== "Dealer" && <span className="recent-active-chip">{pendingCount} Awaiting</span>}
              <IconButton size="small" onClick={() => setIsOpen(false)} aria-label="Close recent requests" sx={{ color: "#64748b" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className="recent-dropdown-list">
            {isLoading ? (
              <div className="recent-empty-state"><p>Loading requests...</p></div>
            ) : isError ? (
              <div className="recent-empty-state"><p role="alert">Unable to load recent requests.</p></div>
            ) : recentRequests.length === 0 ? (
              <div className="recent-empty-state"><p>No requests need your attention right now.</p></div>
            ) : recentRequests.map((order) => {
              const expanded = expandedRequestId === order.id;
              return (
                <article
                  key={order.id}
                  className="recent-request-card"
                  role="link"
                  tabIndex={0}
                  aria-label={`Show ${getOrderDisplayNumber(order)} in the request table`}
                  onClick={() => openRoleRequests(order.id)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openRoleRequests(order.id);
                    }
                  }}
                >
                  <div className="recent-card-top">
                    <div className="recent-req-id-badge">
                      <strong>{getOrderDisplayNumber(order)}</strong>
                      <span className="recent-dealer-name">{order.dealerId}</span>
                    </div>
                    <span className={`recent-status-pill ${`recent-status--${order.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="recent-card-details">
                    <div className="recent-model-info">
                      <DirectionsCarIcon sx={{ fontSize: 15, color: "#64748b" }} />
                      <span>{order.vehicleModel}</span>
                      <strong className="recent-qty-badge">{order.quantity} units</strong>
                    </div>
                    <div className="recent-date-info">
                      <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                  </div>
                  {expanded && <div className="recent-role-details">{getRoleDetails(order)}</div>}
                  <div className="recent-card-action">
                    <button
                      type="button"
                      className="recent-view-details-action-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedRequestId(expanded ? null : order.id);
                      }}
                      aria-expanded={expanded}
                    >
                      {expanded ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="recent-dropdown-footer">
            <button type="button" className="recent-open-requests-btn" onClick={() => openRoleRequests()}>
              Open {requestRole === "Dealer" ? "My Requests" : "Request Queue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
