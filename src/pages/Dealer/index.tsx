/**
 * Dealer/index.tsx — Main Dealer Portal Orchestrator
 *
 * Owns:  dealer identity, orders list, active tab, dialog state
 * Renders: Sidebar + Navbar shell, then delegates each tab to its own component
 */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import OrderDetailsDialog from "../../components/OrderDetailsDialog";
import { getOrdersByDealerId } from "../../api/orders";
import type { Order } from "../../types/order";

import DashboardHome from "./DashBoard";
import DealerVehicleCatalog from "./VehicleCatalog";
import DealerMyRequests from "./MyRequests";
import DealerProfile from "./Profile";
import CreateRequestDialog from "./CreateRequest";

import "./Dealer.css";

// ── Types ─────────────────────────────────────────────────────────────────────

import type { TabType } from "./DashBoard/types";
export type { TabType };

type LoginState = {
  name?: string;
  userId?: string;
  dealerId?: string;
  location?: string;
};

// ── Seed orders (shown while backend is offline) ──────────────────────────────

const SEED_ORDERS: Order[] = [
  { id: "REQ001", dealerId: "D001", vehicleModel: "Kiger",  quantity: 50,  status: "Pending",        orderDate: "2024-10-12T00:00:00.000Z", etaDelivery: "2024-11-20" },
  { id: "REQ002", dealerId: "D001", vehicleModel: "Triber", quantity: 100, status: "Under Review",   orderDate: "2024-10-10T00:00:00.000Z", etaDelivery: "2024-11-28" },
  { id: "REQ003", dealerId: "D001", vehicleModel: "Duster", quantity: 30,  status: "Quotation Sent", orderDate: "2024-10-05T00:00:00.000Z", etaDelivery: "2024-11-15" },
  { id: "REQ004", dealerId: "D001", vehicleModel: "Kwid",   quantity: 25,  status: "Approved",       orderDate: "2024-10-01T00:00:00.000Z", etaDelivery: "2024-11-05" },
];

const TAB_ROUTES: Record<TabType, string> = {
  dashboard:       "/dealer/DashBoard",
  catalog:         "/dealer/catalog",
  "order-request": "/dealer/order-request",
  "my-requests":   "/dealer/my-requests",
  profile:         "/dealer/profile",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DealerPortal({ initialTab = "dashboard" }: { initialTab?: TabType }) {
  const location = useLocation();
  const navigate  = useNavigate();

  // Resolve dealer identity: route state → localStorage → defaults
  const stored     = localStorage.getItem("loginState");
  const loginState = (location.state as LoginState | null) ?? (stored ? JSON.parse(stored) as LoginState : null);
  const dealerName     = loginState?.name     ?? "Demo Dealer";
  const dealerId       = loginState?.dealerId ?? "D001";
  const dealerLocation = loginState?.location ?? "Chennai, TN";

  const [activeTab,      setActiveTab]      = useState<TabType>(initialTab);
  const [orders,         setOrders]         = useState<Order[]>(SEED_ORDERS);
  const [selectedOrder,  setSelectedOrder]  = useState<Order | null>(null);
  const [requestVehicle, setRequestVehicle] = useState("");
  const [isRequestOpen,  setIsRequestOpen]  = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");

  // Sync tab when the route changes (e.g. user navigates via browser back/forward)
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  // Merge backend orders with seed data
  useEffect(() => {
    let active = true;
    getOrdersByDealerId(dealerId)
      .then((fetched) => {
        if (!active || !fetched?.length) return;
        setOrders((prev) => {
          const merged = [...fetched];
          prev.forEach((o) => { if (!merged.some((f) => f.id === o.id)) merged.push(o); });
          return merged;
        });
      })
      .catch(() => {/* keep seed data */});
    return () => { active = false; };
  }, [dealerId]);

  const goToTab = (tab: TabType) => {
    setActiveTab(tab);
    navigate(TAB_ROUTES[tab]);
  };

  const openRequest = (vehicleName = "") => {
    setRequestVehicle(vehicleName);
    setIsRequestOpen(true);
  };

  const handleOrderSubmitted = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setIsRequestOpen(false);
    setSuccessMsg(`Request ${order.id} submitted to Renault Fleet Management!`);
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  return (
    <div className="dealer-layout">
      <Sidebar
        variant="dealer"
        activeTab={activeTab}
        onTabSelect={(tab) => goToTab(tab as TabType)}
      />

      <div className="dealer-content">
        <Navbar
          adminName={dealerName}
          variant="dealer"
          dealerLocation={dealerLocation}
          dealerAvatar="DK"
          notificationsCount={3}
        />

        <main className="dealer-main-scroll">
          {successMsg && (
            <div className="dealer-banner-toast" role="status">
              <CheckCircleOutlinedIcon />
              <span>{successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg("")} aria-label="Dismiss">×</button>
            </div>
          )}

          {activeTab === "dashboard"    && <DashboardHome dealerName={dealerName} orders={orders} onTabChange={goToTab} onNewRequest={openRequest} onViewOrder={setSelectedOrder} />}
          {activeTab === "catalog"      && <DealerVehicleCatalog onOrderRequest={openRequest} />}
          {activeTab === "my-requests"  && <DealerMyRequests orders={orders} onNewRequest={() => openRequest()} onTrack={setSelectedOrder} />}
          {activeTab === "profile"      && <DealerProfile dealerName={dealerName} dealerId={dealerId} dealerLocation={dealerLocation} />}
        </main>
      </div>

      <CreateRequestDialog
        open={isRequestOpen}
        initialVehicle={requestVehicle}
        dealerId={dealerId}
        onClose={() => setIsRequestOpen(false)}
        onSubmitted={handleOrderSubmitted}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
