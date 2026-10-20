import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import RecentRequestsTable from "../components/RecentRequestsTable";
import type { DmRequest } from "../types";
import { getDmRequests } from "../../../api/dmRequests";
import "../DealerManager.css";

const STATUS_TABS = [
    "All",
    "Awaiting Acknowledgement",
    "Ready for Payment",
    "Payment Submitted",
    "Completed",
];

export default function ApprovalRequests() {
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [requests, setRequests] = useState<DmRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getDmRequests()
            .then(setRequests)
            .catch(() => setError("Unable to load requests."))
            .finally(() => setLoading(false));
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter((req: DmRequest) => {
            const matchesTab =
                selectedTab === 0 || req.status === STATUS_TABS[selectedTab];
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                req.id.toLowerCase().includes(q) ||
                (req.dealerId && req.dealerId.toLowerCase().includes(q)) ||
                (req.vehicleModel && req.vehicleModel.toLowerCase().includes(q)) ||
                req.quotationAmount.toLowerCase().includes(q);
            return matchesTab && matchesSearch;
        });
    }, [requests, selectedTab, searchQuery]);

    return (
        <div className="dealer-layout">
            <Sidebar variant="dealermanager" />
            <div className="dealer-content">
                <Navbar role="Dealer Manager" showRecentRequests />
                <main className="dealer-main-scroll">
                    {/* ── Page Header ── */}
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 800, color: "#111827", fontSize: "24px", mb: 0.5 }}
                        >
                            Approval &amp; Request
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: "14px" }}>
                            Review dealer fleet requests, accept manufacturer quotations, and manage payment settlements.
                        </Typography>
                    </Box>

                    {/* ── Filter & Search Toolbar ── */}
                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            border: "1px solid #eef1f5",
                            p: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 2,
                            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                        }}
                    >
                        {/* Tabs */}
                        <Tabs
                            value={selectedTab}
                            onChange={(_, val) => setSelectedTab(val)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: "36px",
                                "& .MuiTab-root": {
                                    minHeight: "36px",
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    px: 2,
                                    py: 0.5,
                                    color: "#64748b",
                                    "&.Mui-selected": { color: "#2563eb" },
                                },
                                "& .MuiTabs-indicator": {
                                    backgroundColor: "#2563eb",
                                    height: "2.5px",
                                    borderRadius: "2px",
                                },
                            }}
                        >
                            {STATUS_TABS.map((tab) => (
                                <Tab key={tab} label={tab} />
                            ))}
                        </Tabs>

                        {/* Search Input */}
                        <TextField
                            size="small"
                            placeholder="Search requests, models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                width: { xs: "100%", sm: "260px" },
                                "& .MuiOutlinedInput-root": {
                                    fontSize: "12.5px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f8fafc",
                                    "& fieldset": { borderColor: "#e2e8f0" },
                                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                                    "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                                },
                            }}
                        />
                    </Box>

                    {loading && (
                        <Typography sx={{ color: "#64748b", mt: 3, fontSize: "14px" }}>
                            Loading requests...
                        </Typography>
                    )}

                    {error && (
                        <Typography sx={{ color: "#dc2626", mt: 3, fontSize: "14px" }}>
                            {error}
                        </Typography>
                    )}

                    {/* ── Requests Table with Popup Integration ── */}
                    {!loading && !error && (
                        <RecentRequestsTable
                            requests={filteredRequests}
                            title={`Requests List (${filteredRequests.length})`}
                            showViewAll={false}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
