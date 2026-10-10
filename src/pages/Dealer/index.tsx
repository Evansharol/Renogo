/**
 * Dealer/index.tsx — Main Dealer Portal Orchestrator
 *
 * Owns:  dealer identity, orders list, active tab, dialog state
 * Renders: Sidebar + Navbar shell, then delegates each tab to its own component
 */
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import OrderDetailsDialog from "../../components/OrderDetailsDialog";
import { getOrdersByDealerId } from "../../api/orders";
import type { Order } from "../../types/order";

import CreateRequestDialog from "./CreateRequest";

import "./Dealer.css";

// ── Types ─────────────────────────────────────────────────────────────────────

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

export type DealerOutletContext = {
  dealerName: string;
  dealerId: string;
  dealerLocation: string;
  orders: Order[];
  openRequest: (vehicleName?: string) => void;
  onViewOrder: (order: Order) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DealerPortal() {
  const location = useLocation();

  // Resolve dealer identity: route state → localStorage → defaults
  const stored     = localStorage.getItem("loginState");
  const loginState = (location.state as LoginState | null) ?? (stored ? JSON.parse(stored) as LoginState : null);
  const dealerName     = loginState?.name     ?? "Demo Dealer";
  const dealerId       = loginState?.dealerId ?? "D001";
  const dealerLocation = loginState?.location ?? "Chennai, TN";

  const [orders,         setOrders]         = useState<Order[]>(SEED_ORDERS);
  const [selectedOrder,  setSelectedOrder]  = useState<Order | null>(null);
  const [requestVehicle, setRequestVehicle] = useState("");
  const [isRequestOpen,  setIsRequestOpen]  = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");

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
      />

      <div className="dealer-content">
        <Navbar
          adminName={dealerName}
        /* variant="dealer"
          dealerLocation={dealerLocation}
          dealerAvatar="DK"
          notificationsCount={3} */
        />

        <main className="dealer-main-scroll">
          {successMsg && (
            <div className="dealer-banner-toast" role="status">
              <CheckCircleOutlinedIcon />
              <span>{successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg("")} aria-label="Dismiss">×</button>
            </div>
          )}

          <Outlet context={{ dealerName, dealerId, dealerLocation, orders, openRequest, onViewOrder: setSelectedOrder } satisfies DealerOutletContext} />
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
