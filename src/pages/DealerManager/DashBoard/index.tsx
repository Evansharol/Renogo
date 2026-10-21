import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import KpiCards from "./components/KpiCards";
import RequestOverviewChart from "./components/OverviewChart";
import RecentNotifications from "./components/NotificationsCard";
import RequestsTablePanel, { STATUS_TABS } from "./components/RequestsTablePanel";
import RequestDetailsModal from "../components/RequestDetailsModal/RequestDetailsModal";
import { DM_KPI, DM_NOTIFICATIONS, CHART_DATA, type DmRequest } from "../types";
import { getDmRequests } from "../../../api/dmRequests";
import "../DealerManager.css";

type ActiveFilter = "total" | "awaiting" | "payment_completed" | "confirmed" | null;

export default function DealerManagerDashboard() {
    const [requests, setRequests] = useState<DmRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Table panel state
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    // View Details modal state
    const [selectedRequest, setSelectedRequest] = useState<DmRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Handle KPI card click — toggle or switch active table panel
    const handleCardClick = (id: string) => {
        const filterId = id as ActiveFilter;
        if (activeFilter === filterId) {
            setActiveFilter(null);
        } else {
            setActiveFilter(filterId);
            setSearchQuery("");
            // Pre-select matching tab
            if (filterId === "awaiting") setSelectedTab(1); // Awaiting Acknowledgement
            else if (filterId === "payment_completed") setSelectedTab(4); // Completed
            else if (filterId === "confirmed") setSelectedTab(4); // Completed
            else setSelectedTab(0); // All
        }
    };

    const closeTablePanel = () => {
        setActiveFilter(null);
        setSearchQuery("");
        setSelectedTab(0);
    };

    const handleOpenDetails = (req: DmRequest) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleRequestUpdated = async (requestId: string) => {
        const updatedRequests = await getDmRequests();
        setRequests(updatedRequests);
        setSelectedRequest(updatedRequests.find((request) => request.id === requestId) ?? null);
    };

    // Scope requests by KPI card, then by tab, then by search
    const tableRequests = useMemo(() => {
        // Scope by card
        let scoped = requests;
        if (activeFilter === "awaiting") {
            scoped = requests.filter((r) => r.status === "Awaiting Acknowledgement");
        } else if (activeFilter === "payment_completed") {
            scoped = requests.filter((r) => r.paymentStatus === "Completed");
        } else if (activeFilter === "confirmed") {
            scoped = requests.filter((r) => r.status === "Completed");
        }

        // Apply tab
        let filtered = scoped;
        if (selectedTab > 0) {
            filtered = scoped.filter((r) => r.status === STATUS_TABS[selectedTab]);
        }

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (r) =>
                    r.id.toLowerCase().includes(q) ||
                    (r.dealerId && r.dealerId.toLowerCase().includes(q)) ||
                    (r.vehicleModel && r.vehicleModel.toLowerCase().includes(q)) ||
                    r.quotationAmount.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [requests, activeFilter, selectedTab, searchQuery]);

    const getActivePanelLabel = () => {
        switch (activeFilter) {
            case "awaiting": return "Awaiting Acknowledgement";
            case "payment_completed": return "Payment Completed";
            case "confirmed": return "Orders Confirmed";
            default: return "All Requests";
        }
    };

    return (
        <div className="dealer-layout">
            <Sidebar variant="dealermanager" />
            <div className="dealer-content">
                <Navbar role="Dealer Manager" showRecentRequests />
                <main className="dealer-main-scroll">
                    {/* ── Page Header ── */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <h1 style={{ margin: 0 }}> Dashboard </h1>
                    </Box>

                    {loading && <Typography sx={{ color: "#64748b", mt: 2 }}>Loading dashboard...</Typography>}
                    {error && <Typography sx={{ color: "#dc2626", mt: 2 }}>{error}</Typography>}

                    {!loading && !error && (
                        <>
                            {/* ── KPI Cards Row — click any to reveal the full table ── */}
                            <KpiCards
                                kpi={kpi}
                                onCardClick={handleCardClick}
                                activeCardId={activeFilter}
                            />

                            {/* ── Inline Full-Table Panel (shown when a KPI card is clicked) ── */}
                            {activeFilter && (
                                <RequestsTablePanel
                                    panelLabel={getActivePanelLabel()}
                                    requests={tableRequests}
                                    selectedTab={selectedTab}
                                    onTabChange={setSelectedTab}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onClose={closeTablePanel}
                                    onViewDetails={handleOpenDetails}
                                />
                            )}

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
                        </>
                    )}
                </main>
            </div>

            {/* View Details Modal — unchanged */}
            <RequestDetailsModal
                open={isModalOpen}
                onClose={handleCloseDetails}
                request={selectedRequest}
                onRequestUpdated={handleRequestUpdated}
            />
        </div>
    );
}