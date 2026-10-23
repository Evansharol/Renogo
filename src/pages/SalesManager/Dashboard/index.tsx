import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import SalesManagerStatCards from "../../../components/SalesManagerStatCards";
import FleetRequestsBarChart from "../../../components/FleetRequestsBarChart";
import RequestApprovalGauge from "../../../components/RequestApprovalGauge";
import RecentDealerRequestsTable from "../../../components/RecentDealerRequestsTable";
import SalesManagerQuickActions from "../../../components/SalesManagerQuickActions";

import { getQuotationByOrderId } from "../../../api/quotations";
import { getSalesManagerDashboardData, type SalesManagerDashboardData } from "../../../api/salesManager";
import type { Order } from "../../../types/order";
import { applyWorkflowTransition, useGetOrdersQuery, useUpdateOrderMutation } from "../../../features/orders/ordersApi";
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
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useGetOrdersQuery();
  const [updateOrder] = useUpdateOrderMutation();
  const [dashboardData, setDashboardData] = useState<SalesManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewQuotation, setReviewQuotation] = useState<Quotation | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getSalesManagerDashboardData().catch(() => null),
      fetch("/api/manufacturer-dashboard.json")
        .then((response) => {
          if (!response.ok) throw new Error("Unable to load manufacturer allocations.");
          return response.json() as Promise<AllocationResponse>;
        })
        .catch(() => ({ dealerRequests: [] })),
    ])
      .then(([loadedDashboardData, allocationData]) => {
        setAllocations(allocationData.dealerRequests || []);
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

  const completeReview = async (action: string) => {
    if (!reviewOrder) return;
    const isRejected = action.startsWith("Declined:");
    try {
      const updatedOrder = applyWorkflowTransition(reviewOrder, {
        status: isRejected ? "Rejected" : "Approved by Sales Manager",
        owner: isRejected ? "Admin" : "Dealer Manager",
        remarks: action.replace(/^(Declined:|Approved and sent to Dealer Manager)\s*/, ""),
      });
      await updateOrder(updatedOrder).unwrap();
      closeReview();
    } catch {
      setError("Unable to save the sales manager decision.");
    }
  };

  const handleKpiCardClick = (id: string) => {
    let filter = "All";
    if (id === "pending_approvals" || id === "pending") filter = "Pending";
    else if (id === "approved_requests" || id === "approved") filter = "Approved";
    else if (id === "orders_confirmed" || id === "confirmed") filter = "Confirmed";
    else if (id === "total_requests" || id === "total") filter = "All";

    navigate("/salesmanager/verification-approval", {
      state: { filter },
    });
  };

  // Keep recent requests few (top 5 most recent orders)
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

  // Dynamic KPI stats based on real orders
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
    <div className="financehead-layout">
      {/* Sidebar Navigation */}
      <Sidebar variant="salesmanager" />

      {/* Main Content Layout */}
      <div className="financehead-content sm-financehead-content">
        {/* Preserved standard Navbar component */}
        <Navbar adminName={salesManagerName} role="Sales Manager" />

        {/* Scrollable Dashboard Container */}
        <main className="financehead-main financehead-dashboard-main sm-main-container">
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

          {(loading || ordersLoading) && <p className="loading-state">Loading dashboard data...</p>}
          {(error || ordersError) && <p className="error-state" role="alert">{error || "Unable to load orders."}</p>}

          {!loading && !ordersLoading && !ordersError && !error && (
            <>
              {/* Top 4 KPI Stat Cards Component */}
              <SalesManagerStatCards
                stats={statCardsData}
                onCardClick={handleKpiCardClick}
              />

              {/* Middle Row: Bar Chart & Request Approval Gauge Components */}
              <div className="sm-middle-grid">
                <FleetRequestsBarChart data={dashboardData?.monthlyTrend} />
                <RequestApprovalGauge data={dashboardData?.approvalRate} />
              </div>

              {/* Bottom Row: Restored Recent Requests Table (kept few) & Quick Actions */}
              <div className="sm-bottom-grid">
                <RecentDealerRequestsTable
                  orders={recentOrders}
                  title="Recent Requests"
                  subTitle="Latest orders allocated by the manufacturer."
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
