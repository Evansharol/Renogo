import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import SalesManagerReviewModal from "../Dashboard/SalesManagerReviewModal";
import { getOrders } from "../../../api/orders";
import { getQuotationByOrderId } from "../../../api/quotations";
import type { Order } from "../../../types/order";
import type { Quotation } from "../../../types/quotation";
import "./VerificationApproval.css";

type LoginState = { name?: string };

type Allocation = {
  orderId: string;
  dealerName?: string;
  color?: string;
  stockBreakdown?: Record<string, number>;
  manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};

type AllocationResponse = { dealerRequests: Allocation[] };

export default function SalesManagerVerificationApproval() {
  const location = useLocation();
  const salesManagerName = (location.state as LoginState | null)?.name ?? "Rajesh Kumar";

  const [orders, setOrders] = useState<Order[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    Promise.all([
      getOrders(),
      fetch("/api/manufacturer-dashboard.json").then((res) => {
        if (!res.ok) throw new Error("Unable to load manufacturer allocations.");
        return res.json() as Promise<AllocationResponse>;
      }),
    ])
      .then(([loadedOrders, allocationData]) => {
        setAllocations(allocationData.dealerRequests || []);
        setOrders(loadedOrders);
      })
      .catch(() => setError("Unable to load requests for verification."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const stateFilter = (location.state as { filter?: string } | null)?.filter;
    if (stateFilter) {
      if (stateFilter === "Pending" || stateFilter === "pending_approvals" || stateFilter === "pending") {
        setStatusFilter("Pending");
      } else if (stateFilter === "Approved" || stateFilter === "approved_requests" || stateFilter === "approved") {
        setStatusFilter("Approved");
      } else if (stateFilter === "Confirmed" || stateFilter === "orders_confirmed" || stateFilter === "confirmed") {
        setStatusFilter("Confirmed");
      } else {
        setStatusFilter("All");
      }
    }
  }, [location.state]);

  const openReview = async (order: Order) => {
    setSelectedOrder(order);
    setQuotation(null);
    setReviewLoading(true);
    try {
      setQuotation(await getQuotationByOrderId(order.id));
    } catch {
      setQuotation(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setSelectedOrder(null);
    setQuotation(null);
  };

  const completeReview = (status: string) => {
    if (!selectedOrder) return;
    setOrders((current) =>
      current.map((order) => (order.id === selectedOrder.id ? { ...order, status } : order))
    );
    closeReview();
  };

  // KPI stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => ["Pending", "Pending Approval"].includes(o.status)).length,
      approved: orders.filter((o) => o.status === "Approved" || o.status.includes("Approved")).length,
      confirmed: orders.filter((o) => ["In Production", "Completed"].includes(o.status)).length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.dealerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Pending" && ["Pending", "Pending Approval"].includes(order.status)) ||
        (statusFilter === "Approved" && (order.status === "Approved" || order.status.includes("Approved"))) ||
        (statusFilter === "Confirmed" && ["In Production", "Completed"].includes(order.status));

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pending")) return "sm-va-badge sm-va-badge--pending";
    if (s.includes("approved")) return "sm-va-badge sm-va-badge--approved";
    if (s.includes("declined") || s.includes("rejected")) return "sm-va-badge sm-va-badge--declined";
    if (s.includes("production") || s.includes("completed")) return "sm-va-badge sm-va-badge--completed";
    return "sm-va-badge sm-va-badge--default";
  };

  return (
    <div className="financehead-layout">
      <Sidebar variant="salesmanager" />
      <div className="financehead-content sm-financehead-content">
        <Navbar adminName={salesManagerName} role="Sales Manager" />

        <main className="financehead-main sm-main-container">
          {/* Header */}
          <div className="sm-va-header">
            <div>
              <span className="sm-section-tag">SALES MANAGER</span>
              <h1 className="sm-page-title">Verification &amp; Approval</h1>
              <p className="sm-page-desc">
                Review allocated fleet requests, verify stock availability, and approve or decline dealer orders.
              </p>
            </div>
          </div>

          {/* Quick Stats Banner - Clickable to filter table */}
          <div className="sm-va-stats-bar">
            <div
              className={`sm-va-stat-item ${statusFilter === "All" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("All")}
              role="button"
              tabIndex={0}
              title="Click to view all requests"
            >
              <AssignmentTurnedInOutlinedIcon className="sm-va-stat-icon sm-va-stat-icon--blue" />
              <div>
                <strong>{stats.total}</strong>
                <span>Total Fleet Requests</span>
              </div>
            </div>
            <div
              className={`sm-va-stat-item ${statusFilter === "Pending" ? "is-active" : ""}`}
              onClick={() => setStatusFilter((prev) => (prev === "Pending" ? "All" : "Pending"))}
              role="button"
              tabIndex={0}
              title="Click to filter pending approvals"
            >
              <HourglassEmptyIcon className="sm-va-stat-icon sm-va-stat-icon--yellow" />
              <div>
                <strong>{stats.pending}</strong>
                <span>Pending Approvals</span>
              </div>
            </div>
            <div
              className={`sm-va-stat-item ${statusFilter === "Approved" ? "is-active" : ""}`}
              onClick={() => setStatusFilter((prev) => (prev === "Approved" ? "All" : "Approved"))}
              role="button"
              tabIndex={0}
              title="Click to filter approved requests"
            >
              <CheckCircleOutlinedIcon className="sm-va-stat-icon sm-va-stat-icon--green" />
              <div>
                <strong>{stats.approved}</strong>
                <span>Approved Requests</span>
              </div>
            </div>
            <div
              className={`sm-va-stat-item ${statusFilter === "Confirmed" ? "is-active" : ""}`}
              onClick={() => setStatusFilter((prev) => (prev === "Confirmed" ? "All" : "Confirmed"))}
              role="button"
              tabIndex={0}
              title="Click to filter orders confirmed"
            >
              <LocalShippingOutlinedIcon className="sm-va-stat-icon sm-va-stat-icon--purple" />
              <div>
                <strong>{stats.confirmed}</strong>
                <span>Orders Confirmed</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="sm-va-toolbar">
            <div className="sm-va-search">
              <SearchIcon className="sm-va-search-icon" />
              <input
                type="text"
                placeholder="Search by Order ID, Dealer ID, or Vehicle Model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sm-va-filter-tabs">
              <FilterListIcon className="sm-va-filter-icon" />
              <button
                type="button"
                className={`sm-va-tab ${statusFilter === "All" ? "sm-va-tab--active" : ""}`}
                onClick={() => setStatusFilter("All")}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                className={`sm-va-tab ${statusFilter === "Pending" ? "sm-va-tab--active" : ""}`}
                onClick={() => setStatusFilter("Pending")}
              >
                Pending ({stats.pending})
              </button>
              <button
                type="button"
                className={`sm-va-tab ${statusFilter === "Approved" ? "sm-va-tab--active" : ""}`}
                onClick={() => setStatusFilter("Approved")}
              >
                Approved ({stats.approved})
              </button>
              <button
                type="button"
                className={`sm-va-tab ${statusFilter === "Confirmed" ? "sm-va-tab--active" : ""}`}
                onClick={() => setStatusFilter("Confirmed")}
              >
                Confirmed ({stats.confirmed})
              </button>
            </div>
          </div>

          {loading && <p className="loading-state">Loading verification requests...</p>}
          {error && <p className="error-state" role="alert">{error}</p>}

          {!loading && !error && (
            <div className="sm-va-card">
              <div className="sm-va-table-wrapper">
                <table className="sm-va-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Dealer ID</th>
                      <th>Dealer Name</th>
                      <th>Vehicle Model</th>
                      <th>Quantity</th>
                      <th>Allocation Status</th>
                      <th>Order Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const alloc = allocations.find((a) => a.orderId === order.id);
                      return (
                        <tr key={order.id}>
                          <td><strong>{order.requestNumber ?? order.id}</strong></td>
                          <td>{order.dealerId}</td>
                          <td>{alloc?.dealerName ?? "Dealer Account"}</td>
                          <td>{order.vehicleModel}</td>
                          <td>{order.quantity} Units</td>
                          <td>
                            <span className="sm-va-alloc-tag">
                              {alloc?.manufacturerStatus ?? "Allocated"}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="sm-va-verify-btn"
                              onClick={() => void openReview(order)}
                            >
                              Verify &amp; Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="sm-va-empty">
                          No requests found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Review & Approval Modal */}
      {selectedOrder && !reviewLoading && (
        <SalesManagerReviewModal
          order={selectedOrder}
          allocation={allocations.find((a) => a.orderId === selectedOrder.id)}
          quotation={quotation}
          onClose={closeReview}
          onAction={completeReview}
        />
      )}
    </div>
  );
}
