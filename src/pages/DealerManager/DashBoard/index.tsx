import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import KpiCards from "./components/KpiCards";
import RequestOverviewChart from "./components/OverviewChart";
import RecentNotifications from "./components/NotificationsCard";
import RecentRequestsTable from "../components/RecentRequestsTable";
import { DM_KPI, DM_NOTIFICATIONS, CHART_DATA, type DmRequest } from "../types";
import { getDmRequests } from "../../../api/dmRequests";
import "../DealerManager.css";

export default function DealerManagerDashboard() {
    const [requests, setRequests] = useState<DmRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getDmRequests()
            .then(setRequests)
            .catch(() => setError("Unable to load requests."))
            .finally(() => setLoading(false));
    }, []);

    const kpi = useMemo(() => ({
        ...DM_KPI,
        totalRequests: requests.length,
        awaitingAcknowledgement: requests.filter((r) => r.status === "Awaiting Acknowledgement").length,
        paymentPending: requests.filter((r) => r.paymentStatus === "Pending").length,
        paymentCompleted: requests.filter((r) => r.paymentStatus === "Completed").length,
        ordersConfirmed: requests.filter((r) => r.status === "Completed").length,
    }), [requests]);

    const notifications = useMemo(() => DM_NOTIFICATIONS, []);
    const chartData = useMemo(() => CHART_DATA, []);

    return (
        <div className="dealer-layout">
            <Sidebar variant="dealermanager" />
            <div className="dealer-content">
                <Navbar adminName="Dealer Manager" showRecentRequests />
                <main className="dealer-main-scroll">
                    {/* ── Page Header ── */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <h1 style={{ margin: 0 }}> Dashboard </h1>
                    </Box>

                    {loading && <Typography sx={{ color: "#64748b", mt: 2 }}>Loading dashboard...</Typography>}
                    {error && <Typography sx={{ color: "#dc2626", mt: 2 }}>{error}</Typography>}

                    {!loading && !error && (
                        <>
                            {/* ── KPI Cards Row ── */}
                            <KpiCards kpi={kpi} />

                            {/* ── Middle Row: Chart + Notifications ── */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 340px",
                                    gap: 3,
                                    alignItems: "stretch",
                                }}
                            >
                                <RequestOverviewChart data={chartData} />
                                <RecentNotifications notifications={notifications} />
                            </Box>

                            {/* ── Recent Requests Table ── */}
                            <RecentRequestsTable requests={requests} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}