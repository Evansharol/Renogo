import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { POPULAR_MODELS } from "./types";
import { formatDate, statusBadgeClass, deriveStats } from "../utils";
import type { DealerOutletContext } from "../index";
import heroBannerImg from "../../../assets/dealer/hero_banner.jpg";
import fleetPromoImg from "../../../assets/dealer/fleet_promo.jpg";
import "../Dealer.css";
import "./DashBoard.css";

// ── StatCard sub-component ────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ReactNode;
  color: string;
  value: number;
  label: string;
  linkLabel?: string;
  isActive?: boolean;
  onClick: () => void;
};

function StatCard({ icon, color, value, label, linkLabel = "Filter", isActive, onClick }: StatCardProps) {
  return (
    <article
      className={`dealer-stat-card ${isActive ? "active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`Filter requests by ${label}`}
    >
      <div className={`stat-icon-wrapper stat-icon-${color}`}>{icon}</div>
      <div className="stat-data">
        <span className="stat-number">{value}</span>
        <span className="stat-label">{label}</span>
        <span className="stat-link-action">{isActive ? "Active Filter" : linkLabel} <ArrowForwardIcon /></span>
      </div>
    </article>
  );
}

// ── DashboardHome ─────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { orders, openRequest, onViewOrder } = useOutletContext<DealerOutletContext>();
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const stats = deriveStats(orders);

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "all") return orders;
    return orders.filter((o) => {
      const s = o.status.toLowerCase();
      if (selectedStatus === "pending") return s.includes("pending") || s.includes("review") || s.includes("quotation");
      if (selectedStatus === "approved") return s.includes("approv");
      if (selectedStatus === "rejected") return s.includes("reject");
      return true;
    });
  }, [orders, selectedStatus]);

  const quickActions = [
    { cls: "action-yellow", icon: <AddIcon />, circle: "black", title: "Create New Request", sub: "Request vehicles for your fleet", action: () => openRequest(POPULAR_MODELS[0].name) },
    { cls: "action-white", icon: <DirectionsCarOutlinedIcon />, circle: "gray", title: "Browse Vehicle Catalog", sub: "Explore Renault\u2019s full range", action: () => navigate("/dealer/catalog") },
    { cls: "action-white", icon: <AssignmentOutlinedIcon />, circle: "gray", title: "View My Requests", sub: "Track the status of your requests", action: () => navigate("/dealer/my-requests") },
  ];

  return (
    <div className="dealer-dashboard-view">

      {/* ── Hero Banner ── */}
      <section className="dealer-hero-card" aria-label="Dealer Welcome">
        <div className="dealer-hero-bg" style={{ backgroundImage: `url(${heroBannerImg})` }} />
        <div className="dealer-hero-overlay" />
        <div className="dealer-hero-content">
          <div className="dealer-hero-left">
            <span className="hero-kicker">Welcome back,</span>
            <p className="hero-description">
              Explore Renault&apos;s fleet range, create new requests and track your orders – all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="dealer-stats-row" aria-label="Request Statistics">
        <StatCard
          icon={<DescriptionOutlinedIcon />}
          color="blue"
          value={stats.total}
          label="Total Requests"
          linkLabel="View All"
          onClick={() => navigate("/dealer/my-requests?status=all", { state: { initialStatus: "all" } })}
        />
        <StatCard
          icon={<AccessTimeOutlinedIcon />}
          color="yellow"
          value={stats.pending}
          label="Pending"
          linkLabel="View Pending"
          onClick={() => navigate("/dealer/my-requests?status=pending", { state: { initialStatus: "pending" } })}
        />
        <StatCard
          icon={<CheckCircleOutlinedIcon />}
          color="green"
          value={stats.approved}
          label="Approved"
          linkLabel="View Approved"
          onClick={() => navigate("/dealer/my-requests?status=approved", { state: { initialStatus: "approved" } })}
        />
        <StatCard
          icon={<CancelOutlinedIcon />}
          color="red"
          value={stats.rejected}
          label="Rejected"
          linkLabel="View Rejected"
          onClick={() => navigate("/dealer/my-requests?status=rejected", { state: { initialStatus: "rejected" } })}
        />
      </section>

      {/* ── Two-column grid ── */}
      <div className="dealer-grid-layout">

        {/* LEFT: Popular Models + Recent Requests */}
        <div className="dealer-primary-col">

          <section className="dealer-card-panel" aria-labelledby="popular-models-title">
            <header className="panel-header">
              <h2 id="popular-models-title">Popular Renault Models</h2>
              <button type="button" className="panel-view-all" onClick={() => navigate("/dealer/catalog")}>
                View All Vehicles <ChevronRightIcon />
              </button>
            </header>
            <div className="models-horizontal-grid">
              {POPULAR_MODELS.map((model) => (
                <article key={model.id} className="vehicle-model-card">
                  <div className="vehicle-card-thumb">
                    <img src={model.image} alt={model.name} loading="lazy" />
                  </div>
                  <div className="vehicle-card-info">
                    <h3>{model.name}</h3>
                    <p className="vehicle-tagline">{model.tagline}</p>
                    <button type="button" className="vehicle-view-details-btn" onClick={() => navigate("/dealer/catalog")}>
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dealer-card-panel" aria-labelledby="recent-requests-title">
            <header className="panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 id="recent-requests-title">Recent Requests</h2>
                {selectedStatus !== "all" && (
                  <span className="requests-filter-tag">
                    Filtered by: <strong>{selectedStatus}</strong> ({filteredOrders.length})
                    <button
                      type="button"
                      onClick={() => setSelectedStatus("all")}
                      title="Clear status filter"
                      className="requests-filter-clear-btn"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                type="button"
                className="panel-view-all"
                onClick={() => navigate("/dealer/my-requests", { state: { initialStatus: selectedStatus } })}
              >
                View All <ChevronRightIcon />
              </button>
            </header>
            <div className="requests-table-container">
              <table className="dealer-requests-table">
                <thead>
                  <tr>
                    {["Request ID", "Vehicle Model", "Qty", "Date", "Status", "Action"].map((h) => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                        No requests found with status &quot;{selectedStatus}&quot;.{" "}
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("all")}
                          style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                        >
                          Show All
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.slice(0, 5).map((req) => (
                      <tr key={req.id}>
                        <td className="req-id-cell">{req.requestNumber ?? req.id}</td>
                        <td className="req-model-cell">{req.vehicleModel}</td>
                        <td>{req.quantity}</td>
                        <td className="req-date-cell">{formatDate(req.orderDate)}</td>
                        <td><span className={`req-status-pill ${statusBadgeClass(req.status)}`}>{req.status}</span></td>
                        <td><button type="button" className="req-view-link" onClick={() => onViewOrder(req)}>Track</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT: Quick Actions + Promo */}
        <aside className="dealer-sidebar-col">
          {quickActions.map(({ cls, icon, circle, title, sub, action }) => (
            <div key={title} className={`action-button-card ${cls}`} onClick={action} role="button" tabIndex={0}>
              <div className={`action-icon-circle action-circle-${circle}`}>{icon}</div>
              <div className="action-text">
                <strong>{title}</strong>
                <span>{sub}</span>
              </div>
              <ChevronRightIcon className="action-chevron" />
            </div>
          ))}

          <div className="dealer-promo-banner-card">
            <img src={fleetPromoImg} alt="Renault Fleet Solutions" className="promo-bg-img" />
            <div className="promo-dark-overlay" />
            <div className="promo-text-wrap">
              <span className="promo-subtitle">BUILT FOR BUSINESSES THAT MOVE THE WORLD</span>
              <div className="promo-footer">
                <strong>RENAULT</strong>
                <span>FLEET SOLUTIONS</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
