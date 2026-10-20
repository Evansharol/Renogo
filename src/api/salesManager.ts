import type { StatCardData } from "../components/SalesManagerStatCards";
import type { ApprovalBreakdown } from "../components/RequestApprovalGauge";
import type { DisplayRequest } from "../components/RecentDealerRequestsTable";
import type { ActionItem } from "../components/SalesManagerQuickActions";

export type SalesManagerDashboardData = {
  stats: StatCardData[];
  monthlyTrend: { month: string; requests: number }[];
  approvalRate: ApprovalBreakdown;
  recentRequests: DisplayRequest[];
  quickActions: ActionItem[];
};

export async function getSalesManagerDashboardData(): Promise<SalesManagerDashboardData> {
  try {
    const response = await fetch("/api/sales-manager-dashboard.json");
    if (!response.ok) {
      // Fallback for static dev without backend proxy
      const staticRes = await fetch("/api/sales-manager-dashboard.json");
      if (!staticRes.ok) throw new Error("Failed to fetch dashboard data");
      return (await staticRes.json()) as SalesManagerDashboardData;
    }
    return (await response.json()) as SalesManagerDashboardData;
  } catch (error) {
    console.warn("Using inline fallback data for Sales Manager Dashboard:", error);
    return {
      stats: [
        { id: "total", title: "Total Requests", value: 152, trend: "+12% from last month", trendType: "up", icon: "total" },
        { id: "approved", title: "Approved Requests", value: 104, trend: "+22% from last month", trendType: "up", icon: "approved" },
        { id: "pending", title: "Pending Requests", value: 24, trend: "-8% from last month", trendType: "down", icon: "pending" },
        { id: "rejected", title: "Rejected Requests", value: 6, trend: "-2% from last month", trendType: "down", icon: "rejected" }
      ],
      monthlyTrend: [
        { month: "Jan", requests: 45 },
        { month: "Feb", requests: 62 },
        { month: "Mar", requests: 58 },
        { month: "Apr", requests: 75 },
        { month: "May", requests: 90 },
        { month: "Jun", requests: 78 },
        { month: "Jul", requests: 65 },
        { month: "Aug", requests: 72 },
        { month: "Sep", requests: 68 },
        { month: "Oct", requests: 80 },
        { month: "Nov", requests: 76 },
        { month: "Dec", requests: 85 }
      ],
      approvalRate: { approved: 104, pending: 24, rejected: 6, ratePercentage: 82, trendText: "+6% from last month" },
      recentRequests: [
        { requestId: "REQ-1001", dealerName: "Trident Motors Pvt. Ltd.", requestedVehicles: 100, status: "New", receivedOn: "10 Jan 2025" },
        { requestId: "REQ-1002", dealerName: "Alliance Renault", requestedVehicles: 50, status: "Pending Approval", receivedOn: "09 Jan 2025" },
        { requestId: "REQ-1003", dealerName: "Metro Auto Corp", requestedVehicles: 75, status: "Under Review", receivedOn: "08 Jan 2025" },
        { requestId: "REQ-1004", dealerName: "Southern Renault", requestedVehicles: 30, status: "Pending Approval", receivedOn: "08 Jan 2025" },
        { requestId: "REQ-1005", dealerName: "Westside Motors", requestedVehicles: 60, status: "Approved", receivedOn: "07 Jan 2025" }
      ],
      quickActions: [
        { id: "process_request", title: "Process Pending Requests", subtitle: "Review and process dealer request", type: "primary", icon: "add" },
        { id: "view_pending", title: "View Pending Requests", subtitle: "Review and process dealer requests", type: "secondary", icon: "pending" },
        { id: "manage_approvals", title: "Manage Request Approvals", subtitle: "Track and update request status", type: "secondary", icon: "manage" },
        { id: "generate_reports", title: "Generate Reports", subtitle: "Sales performance and insights", type: "secondary", icon: "reports" }
      ]
    };
  }
}
