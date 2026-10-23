import { useState } from "react";
import { useLocation, useOutletContext, useSearchParams } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { formatDate, getDisplayRequestNumber, statusBadgeClass } from "../utils";
import type { DealerOutletContext } from "../index";
import { getRequestRowDomId, useRequestRowFocus } from "../../../hooks/useRequestRowFocus";
import "../../Dealer/Dealer.css";
import "./MyRequests.css";

export default function DealerMyRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const queryStatus = searchParams.get("status");
  const stateStatus = (location.state as { initialStatus?: string } | null)?.initialStatus;
  const targetRequestId = searchParams.get("requestId") ?? undefined;
  const initialStatus = targetRequestId ? "all" : queryStatus ?? stateStatus ?? "all";

  const { orders, onViewOrder } = useOutletContext<DealerOutletContext>();
  const [search,  setSearch]  = useState(targetRequestId ?? "");
  const [model,   setModel]   = useState("all");
  const status = initialStatus;

  const handleStatusChange = (newStatus: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newStatus === "all") {
        next.delete("status");
      } else {
        next.set("status", newStatus);
      }
      return next;
    });
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const displayRequestNumber = getDisplayRequestNumber(o);
    const matchSearch = displayRequestNumber.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.vehicleModel.toLowerCase().includes(q);
    const matchModel  = model  === "all" || o.vehicleModel.toLowerCase().includes(model.toLowerCase());

    let matchStatus = true;
    if (status !== "all") {
      const s = o.status.toLowerCase();
      if (status === "pending") {
        matchStatus = s.includes("pending") || s.includes("review") || s.includes("quotation");
      } else if (status === "approved") {
        matchStatus = s.includes("approv");
      } else if (status === "rejected") {
        matchStatus = s.includes("reject");
      } else {
        matchStatus = s.includes(status.toLowerCase().trim());
      }
    }
    return matchSearch && matchModel && matchStatus;
  });
  useRequestRowFocus(targetRequestId, filtered.map((order) => order.id));

  return (
    <div className="dealer-my-requests-view">
      {/* Header */}
      <div className="dealer-page-title-row">
        <div>
          <h1>My Requests &amp; Orders</h1>
          <p>Track status through stock verification, quotation approval, and factory dispatch.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="my-requests-filter-bar">
        <div className="filter-search-box">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search by Request ID or Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-select-group">
          <select value={model} onChange={(e) => setModel(e.target.value)} aria-label="Filter by model">
            <option value="all">All Models</option>
            {["Kiger", "Triber", "Duster", "Kwid"].map((m) => (
              <option key={m} value={m}>Renault {m}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => handleStatusChange(e.target.value)} aria-label="Filter by status">
            <option value="all">All Statuses</option>
            {["pending", "under review", "quotation sent", "approved", "rejected"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="my-requests-table-wrapper">
        <table className="my-requests-full-table">
          <thead>
            <tr>
              {["Request ID", "Vehicle Model", "Quantity", "Request Date", "ETA Delivery", "Status", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="no-records-cell">No vehicle requests match the selected filters.</td></tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  id={getRequestRowDomId(o.id)}
                  className={o.id === targetRequestId ? "notification-target-row" : undefined}
                >
                  <td className="id-font"><strong>{getDisplayRequestNumber(o)}</strong></td>
                  <td><strong>{o.vehicleModel}</strong></td>
                  <td>{o.quantity} units</td>
                  <td>{formatDate(o.orderDate)}</td>
                  <td>{formatDate(o.etaDelivery)}</td>
                  <td><span className={`req-status-pill ${statusBadgeClass(o.status)}`}>{o.status}</span></td>
                  <td>
                    <button type="button" className="table-action-track-btn" onClick={() => onViewOrder(o)}>
                      Track Lifecycle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
