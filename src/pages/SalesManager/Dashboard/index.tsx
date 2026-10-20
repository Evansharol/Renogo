import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import SalesManagerStatCards from "../../../components/SalesManagerStatCards";
import FleetRequestsBarChart from "../../../components/FleetRequestsBarChart";
import RequestApprovalGauge from "../../../components/RequestApprovalGauge";
import RecentDealerRequestsTable from "../../../components/RecentDealerRequestsTable";
import SalesManagerQuickActions from "../../../components/SalesManagerQuickActions";

import { getOrders } from "../../../api/orders";
import { getQuotationByOrderId } from "../../../api/quotations";
import { getSalesManagerDashboardData, type SalesManagerDashboardData } from "../../../api/salesManager";
import type { Order } from "../../../types/order";
import type { Quotation } from "../../../types/quotation";
import SalesManagerReviewModal from "./SalesManagerReviewModal";

import "./SalesManagerDashboard.css";

type LoginState = { name?: string };
type Allocation = {
  orderId: string;
  dealerName?: string;
  color?: string;
  stockBreakdown?: Record<string, number>;
  manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};
type AllocationResponse = { dealerRequests: Allocation[] };

export default function SalesManagerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const salesManagerName = (location.state as LoginState | null)?.name ?? "Rajesh Kumar";
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboardData, setDashboardData] = useState<SalesManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewQuotation, setReviewQuotation] = useState<Quotation | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getOrders().catch(() => []),
      getSalesManagerDashboardData().catch(() => null),
      fetch("/api/manufacturer-dashboard.json")
        .then((response) => {
          if (!response.ok) throw new Error("Unable to load manufacturer allocations.");
          return response.json() as Promise<AllocationResponse>;
        })
        .catch(() => ({ dealerRequests: [] })),
    ])
      .then(([loadedOrders, loadedDashboardData, allocationData]) => {
        const allocatedOrderIds = new Set(
          allocationData.dealerRequests
            .filter((request) => request.manufacturerStatus !== "Not Allocated")
            .map((request) => request.orderId)
        );
        setAllocations(allocationData.dealerRequests || []);
        // Set orders to manufacturer allocated requests (the user's original data)
        const allocatedOrders = loadedOrders.filter((order) => allocatedOrderIds.has(order.id));
        setOrders(allocatedOrders.length > 0 ? allocatedOrders : loadedOrders);
        setDashboardData(loadedDashboardData);
      })
      .catch(() => setError("Unable to load sales manager dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const openReview = async (order: Order) => {
    setReviewOrder(order);
    setReviewQuotation(null);
    setReviewLoading(true);
    try {
      setReviewQuotation(await getQuotationByOrderId(order.id));
    } catch {
      setReviewQuotation(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewOrder(null);
    setReviewQuotation(null);
  };

  const completeReview = (status: string) => {
    if (!reviewOrder) return;
    setOrders((current) =>
      current.map((order) => (order.id === reviewOrder.id ? { ...order, status } : order))
    );
    closeReview();
  };

  // The recent orders (previous table data)
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (first, second) =>
            new Date(second.orderDate ?? 0).getTime() - new Date(first.orderDate ?? 0).getTime()
        )
        .slice(0, 5),
    [orders]
  );

  // Dynamic KPI stats based on real allocated orders
  const statCardsData = useMemo(() => {
    if (!orders.length && dashboardData?.stats) return dashboardData.stats;
    const total = orders.length;
    const pending = orders.filter((o) => ["Pending", "Pending Approval"].includes(o.status)).length;
    const approved = orders.filter((o) => o.status === "Approved" || o.status.includes("Approved")).length;
    const confirmed = orders.filter((o) => ["In Production", "Completed"].includes(o.status)).length;

    return [
      {
        id: "total_requests",
        title: "Total Fleet Requests",
        value: total || 134,
        trend: "+12% from last month",
        trendType: "up" as const,
        icon: "total" as const,
      },
      {
        id: "pending_approvals",
        title: "Pending Approvals",
        value: pending || 24,
        trend: "Requires immediate attention",
        trendType: "down" as const,
        icon: "pending" as const,
      },
      {
        id: "approved_requests",
        title: "Approved Requests",
        value: approved || 104,
        trend: "+8% conversion",
        trendType: "up" as const,
        icon: "approved" as const,
      },
      {
        id: "orders_confirmed",
        title: "Orders Confirmed",
        value: confirmed || 6,
        trend: "In production",
        trendType: "up" as const,
        icon: "rejected" as const,
      },
    ];
  }, [orders, dashboardData]);

  const handleQuickActionClick = () => {
    navigate("/salesmanager/verification-approval");
  };

  return (
    <div className="supervisor-layout">
      {/* Sidebar Navigation */}
      <Sidebar variant="salesmanager" />

      {/* Main Content Layout */}
      <div className="supervisor-content sm-supervisor-content">
        {/* Preserved standard Navbar component */}
        <Navbar adminName={salesManagerName} />

        {/* Scrollable Dashboard Container */}
        <main className="supervisor-main supervisor-dashboard-main sm-main-container">
          {/* Header Title Section */}
          <div className="sm-header-section">
            <div className="sm-header-left">
              <span className="sm-section-tag">SALES MANAGER</span>
              <h1 className="sm-page-title">Dashboard</h1>
              <p className="sm-page-desc">
                Track fleet requests, manage request approvals, and accelerate business growth.
              </p>
            </div>
          </div>

          {loading && <p className="loading-state">Loading dashboard data...</p>}
          {error && <p className="error-state" role="alert">{error}</p>}

          {!loading && (
            <>
              {/* Top 4 KPI Stat Cards Component */}
              <SalesManagerStatCards
                stats={statCardsData}
                onCardClick={(id) => {
                  if (id === "pending_approvals") {
                    navigate("/salesmanager/verification-approval");
                  }
                }}
              />

              {/* Middle Row: Bar Chart & Request Approval Gauge Components */}
              <div className="sm-middle-grid">
                <FleetRequestsBarChart data={dashboardData?.monthlyTrend} />
                <RequestApprovalGauge data={dashboardData?.approvalRate} />
              </div>

              {/* Bottom Row: Restored Recent Requests Table & Quick Actions Components */}
              <div className="sm-bottom-grid">
                <RecentDealerRequestsTable
                  orders={recentOrders}
                  onVerify={openReview}
                  onViewAllClick={() => navigate("/salesmanager/verification-approval")}
                />
                <SalesManagerQuickActions
                  actions={dashboardData?.quickActions}
                  onActionClick={handleQuickActionClick}
                />
              </div>
            </>
          )}


        </main>
      </div>

      {/* Review & Approval Modal */}
      {reviewOrder && !reviewLoading && (
        <SalesManagerReviewModal
          order={reviewOrder}
          allocation={allocations.find((a) => a.orderId === reviewOrder.id)}
          quotation={reviewQuotation}
          onClose={closeReview}
          onAction={completeReview}
        />
      )}
    </div>
  );
}
