/**
 * Manufacturer dashboard overview.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import KpiCard from "../../../components/KpiCard";
import ModelCard from "../../../components/ModelCard";
import DealerRequestTable from "../../../components/DealerRequestTable";
import kwidImage from "../../../assets/dealer/kwid.jpg";
import kigerImage from "../../../assets/dealer/kiger.jpg";
import triberImage from "../../../assets/dealer/triber.jpg";
import dusterImage from "../../../assets/dealer/duster.jpg";
import rafaleImage from "../../../assets/rafale.png";
import zoeImage from "../../../assets/zoe.jpg";
import clioImage from "../../../assets/clio.jpg";
import twingoImage from "../../../assets/twingo.jpg";
import meganeImage from "../../../assets/megane.jpg";
import etechImage from "../../../assets/etech.jpg";
import type { DealerRequest } from "../../../components/DealerRequestTable";

import "../../Dealer/Dealer.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type LoginState = {
  name?: string;
};

type DashboardData = {
  kpis: Array<{
    label: string;
    value: number;
    subtitle: string;
    icon: "orders" | "pending" | "allocated" | "supervisor";
    variant: "blue" | "orange" | "green" | "purple";
  }>;
  models: Array<{
    name: string;
    image: "kwid" | "kiger" | "triber" | "duster" | "rafale" | "zoe" | "clio" | "twingo" | "megane" | "etech";
    units: number;
    stockLevel: number;
    availability: "available" | "low";
  }>;
  dealerRequests: DealerRequest[];
};

const dashboardImages = { 
  kwid: kwidImage, 
  rafale: rafaleImage,
  zoe: zoeImage,
  clio: clioImage,
  twingo: twingoImage,
  megane: meganeImage,
  etech: etechImage,
  kiger: kigerImage, 
  triber: triberImage, 
  duster: dusterImage 
};
const dashboardIcons = {
  orders: <ShoppingCartOutlinedIcon />,
  pending: <AccessTimeOutlinedIcon />,
  allocated: <CheckCircleOutlinedIcon />,
  supervisor: <ArrowForwardOutlinedIcon />,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DealerPortal() {
  const location = useLocation();

  // Resolve dealer identity: route state → localStorage → defaults
  const stored     = localStorage.getItem("loginState");
  const loginState = (location.state as LoginState | null) ?? (stored ? JSON.parse(stored) as LoginState : null);
  const dealerName     = loginState?.name     ?? "Demo Dealer";
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    fetch("/api/manufacturer-dashboard.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load dashboard data (${response.status})`);
        return response.json() as Promise<DashboardData>;
      })
      .then(setDashboardData)
      .catch((error: unknown) => {
        setDashboardError(error instanceof Error ? error.message : "Unable to load dashboard data");
      });
  }, []);

  return (
    <div className="dealer-layout">
      <Sidebar variant="manufacturer" />

      <div className="dealer-content">
        <Navbar
          adminName={dealerName}
        />

        <main className="dealer-main-scroll">
          {dashboardError && <p role="alert">{dashboardError}</p>}
          {!dashboardData && !dashboardError && <p>Loading dashboard...</p>}
          {dashboardData && (
            <>
          <div className="dealer-page-title-row">
            <div>
              <h1>Manufacturer Dashboard</h1>
              <p>Overview of fleet requests and allocation progress</p>
            </div>
          </div>

          <section className="manufacturer-kpi-grid" aria-label="Fleet request summary">
            {dashboardData.kpis.map((card) => (
              <KpiCard key={card.label} {...card} icon={dashboardIcons[card.icon]} />
            ))}
          </section>

          <section className="manufacturer-models-section" aria-labelledby="available-models-title">
            <div className="manufacturer-section-heading">
              <h2 id="available-models-title">Available Models</h2>
              <Link className="manufacturer-view-all-link" to="/manufacturer/stocks">
                View All
              </Link>
            </div>
            <div className="manufacturer-model-grid">
              {dashboardData.models.slice(0, 4).map((model) => (
                <ModelCard key={model.name} {...model} image={dashboardImages[model.image]} />
              ))}
            </div>
          </section>

          <DealerRequestTable requests={dashboardData.dealerRequests} />
            </>
          )}
        </main>

    </div>
    </div>
  );
}
