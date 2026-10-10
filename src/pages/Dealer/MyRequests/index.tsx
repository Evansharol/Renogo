import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { formatDate, statusBadgeClass } from "../utils";
import type { DealerOutletContext } from "../index";
import "../../Dealer/Dealer.css";
import "./MyRequests.css";

export default function DealerMyRequests() {
  const { orders, onViewOrder } = useOutletContext<DealerOutletContext>();
  const [search,  setSearch]  = useState("");
  const [model,   setModel]   = useState("all");
  const [status,  setStatus]  = useState("all");

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(q) || o.vehicleModel.toLowerCase().includes(q);
    const matchModel  = model  === "all" || o.vehicleModel.toLowerCase().includes(model.toLowerCase());
    const matchStatus = status === "all" || o.status.toLowerCase().replace(/\s+/g, "") === status.replace(/\s+/g, "");
    return matchSearch && matchModel && matchStatus;
  });

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
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
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
                <tr key={o.id}>
                  <td className="id-font"><strong>{o.id}</strong></td>
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
