import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import { POPULAR_MODELS } from "./types";
import { formatDate, statusBadgeClass, deriveStats } from "../utils";
import type { Order } from "../../../types/order";
import type { TabType } from "./types";
import heroBannerImg from "../../../assets/dealer/hero_banner.jpg";
import fleetPromoImg from "../../../assets/dealer/fleet_promo.jpg";
import "../Dealer.css";
import "./DashBoard.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  dealerName: string;
  orders: Order[];
  onTabChange: (tab: TabType) => void;
  onNewRequest: (vehicleName?: string) => void;
  onViewOrder: (order: Order) => void;
};

// ── StatCard sub-component ────────────────────────────────────────────────────

type StatCardProps = {
  icon: React.ReactNode;
  color: string;
  value: number;
  label: string;
  linkLabel?: string;
  onClick: () => void;
};

function StatCard({ icon, color, value, label, linkLabel = "View", onClick }: StatCardProps) {
  return (
    <article className="dealer-stat-card" onClick={onClick} role="button" tabIndex={0}>
      <div className={`stat-icon-wrapper stat-icon-${color}`}>{icon}</div>
      <div className="stat-data">
        <span className="stat-number">{value}</span>
        <span className="stat-label">{label}</span>
        <span className="stat-link-action">{linkLabel} <ArrowForwardIcon /></span>
      </div>
    </article>
  );
}

// ── DashboardHome ─────────────────────────────────────────────────────────────

export default function DashboardHome({ dealerName, orders, onTabChange, onNewRequest, onViewOrder }: Props) {
  const stats = deriveStats(orders);

  const quickActions = [
    { cls: "action-yellow", icon: <AddIcon />, circle: "black", title: "Create New Request", sub: "Request vehicles for your fleet", action: () => onNewRequest(POPULAR_MODELS[0].name) },
    { cls: "action-white", icon: <DirectionsCarOutlinedIcon />, circle: "gray", title: "Browse Vehicle Catalog", sub: "Explore Renault\u2019s full range", action: () => onTabChange("catalog") },
    { cls: "action-white", icon: <AssignmentOutlinedIcon />, circle: "gray", title: "View My Requests", sub: "Track the status of your requests", action: () => onTabChange("my-requests") },
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
        <StatCard icon={<DescriptionOutlinedIcon />} color="blue" value={stats.total} label="Total Requests" linkLabel="View All" onClick={() => onTabChange("my-requests")} />
        <StatCard icon={<AccessTimeOutlinedIcon />} color="yellow" value={stats.pending} label="Pending" onClick={() => onTabChange("my-requests")} />
        <StatCard icon={<CheckCircleOutlinedIcon />} color="green" value={stats.approved} label="Approved" onClick={() => onTabChange("my-requests")} />
        <StatCard icon={<CancelOutlinedIcon />} color="red" value={stats.rejected} label="Rejected" onClick={() => onTabChange("my-requests")} />
      </section>

      {/* ── Two-column grid ── */}
      <div className="dealer-grid-layout">

        {/* LEFT: Popular Models + Recent Requests */}
        <div className="dealer-primary-col">

          <section className="dealer-card-panel" aria-labelledby="popular-models-title">
            <header className="panel-header">
              <h2 id="popular-models-title">Popular Renault Models</h2>
              <button type="button" className="panel-view-all" onClick={() => onTabChange("catalog")}>
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
                    <button type="button" className="vehicle-view-details-btn" onClick={() => onTabChange("catalog")}>
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="dealer-card-panel" aria-labelledby="recent-requests-title">
            <header className="panel-header">
              <h2 id="recent-requests-title">Recent Requests</h2>
              <button type="button" className="panel-view-all" onClick={() => onTabChange("my-requests")}>
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
                  {orders.slice(0, 4).map((req) => (
                    <tr key={req.id}>
                      <td className="req-id-cell">{req.id}</td>
                      <td className="req-model-cell">{req.vehicleModel}</td>
                      <td>{req.quantity}</td>
                      <td className="req-date-cell">{formatDate(req.orderDate)}</td>
                      <td><span className={`req-status-pill ${statusBadgeClass(req.status)}`}>{req.status}</span></td>
                      <td><button type="button" className="req-view-link" onClick={() => onViewOrder(req)}>View</button></td>
                    </tr>
                  ))}
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
