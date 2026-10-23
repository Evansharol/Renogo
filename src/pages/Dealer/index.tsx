/**
 * Dealer/index.tsx — Main Dealer Portal Orchestrator
 *
 * Owns:  dealer identity, orders list, active tab, dialog state
 * Renders: Sidebar + Navbar shell, then delegates each tab to its own component
 */
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import OrderDetailsDialog from "../../components/OrderDetailsDialog";
import { useGetDealerOrdersQuery } from "../../features/orders/ordersApi";
import type { Order } from "../../types/order";
import { getOrderDisplayNumber } from "../../utils/orderDisplay";

import CreateRequestDialog from "./CreateRequest";

import "./Dealer.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type LoginState = {
  name?: string;
  userId?: string;
  dealerId?: string;
  location?: string;
};

export type DealerOutletContext = {
  dealerName: string;
  dealerId: string;
  dealerLocation: string;
  orders: Order[];
  openRequest: (vehicleName?: string) => void;
  onViewOrder: (order: Order) => void;
  onOrderSubmitted?: (order: Order) => void;
  isOrdersLoading: boolean;
  ordersError: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DealerPortal() {
  const location = useLocation();

  // Resolve dealer identity: route state → localStorage → defaults
  const stored     = localStorage.getItem("loginState");
  const loginState = (location.state as LoginState | null) ?? (stored ? JSON.parse(stored) as LoginState : null);
  const dealerName     = loginState?.name     ?? "Dinesh Kumar";
  const dealerId       = loginState?.dealerId ?? "D001";
  const dealerLocation = loginState?.location ?? "Chennai, TN";

  const { data: orders = [], isLoading: isOrdersLoading, isError: isOrdersError } = useGetDealerOrdersQuery(dealerId);
  const [selectedOrder,  setSelectedOrder]  = useState<Order | null>(null);
  const [requestVehicle, setRequestVehicle] = useState("");
  const [isRequestOpen,  setIsRequestOpen]  = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");

  const openRequest = (vehicleName = "") => {
    setRequestVehicle(vehicleName);
    setIsRequestOpen(true);
  };

  const handleOrderSubmitted = (order: Order) => {
    setIsRequestOpen(false);
    setSuccessMsg(`Request ${getOrderDisplayNumber(order)} sent to Finance Head for approval.`);
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
          role="Dealer"
          dealerLocation={dealerLocation}
        />

        <main className="dealer-main-scroll">
          {successMsg && (
            <div className="dealer-banner-toast" role="status">
              <CheckCircleOutlinedIcon />
              <span>{successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg("")} aria-label="Dismiss">×</button>
            </div>
          )}

          {isOrdersLoading
            ? <p role="status">Loading your requests...</p>
            : isOrdersError
              ? <p role="alert">Unable to load your requests. Please try again.</p>
              : <Outlet context={{ dealerName, dealerId, dealerLocation, orders, openRequest, onViewOrder: setSelectedOrder, onOrderSubmitted: handleOrderSubmitted, isOrdersLoading, ordersError: "" } satisfies DealerOutletContext} />
          }
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
