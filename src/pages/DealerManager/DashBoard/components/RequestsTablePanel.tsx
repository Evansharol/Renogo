import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { DmRequest } from "../../types";

export const STATUS_TABS = [
    "All",
    "Awaiting Acknowledgement",
    "Ready for Payment",
    "Payment Submitted",
    "Completed",
];

const STATUS_STYLES: Record<DmRequest["status"], { bg: string; color: string }> = {
    "Awaiting Acknowledgement": { bg: "#fef9c3", color: "#854d0e" },
    "Ready for Payment": { bg: "#dcfce7", color: "#15803d" },
    "Payment Submitted": { bg: "#dbeafe", color: "#1d4ed8" },
    "Payment Verified": { bg: "#dcfce7", color: "#15803d" },
    Completed: { bg: "#dcfce7", color: "#15803d" },
};

const PAYMENT_STYLES: Record<DmRequest["paymentStatus"], { bg: string; color: string }> = {
    Pending: { bg: "#fee2e2", color: "#b91c1c" },
    Submitted: { bg: "#dbeafe", color: "#1d4ed8" },
    Completed: { bg: "#dcfce7", color: "#15803d" },
};

interface RequestsTablePanelProps {
    panelLabel: string;
    requests: DmRequest[];
    selectedTab: number;
    onTabChange: (tab: number) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClose: () => void;
    onViewDetails: (req: DmRequest) => void;
}

export default function RequestsTablePanel({
    panelLabel,
    requests,
    selectedTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    onClose,
    onViewDetails,
}: RequestsTablePanelProps) {
    return (
        <Card
            elevation={0}
            sx={{
                border: "1px solid #eef1f5",
                borderRadius: "14px",
                boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
                mb: 3,
                animation: "dm-panel-fade 0.25s ease",
                "@keyframes dm-panel-fade": {
                    from: { opacity: 0, transform: "translateY(-8px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
            }}
        >
            <CardContent sx={{ p: "24px !important" }}>
                {/* Panel Header */}
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "#111827", fontSize: "18px", mb: 0.3 }}
                        >
                            {panelLabel}
                        </Typography>
                        <Typography sx={{ color: "#64748b", fontSize: "13px" }}>
                            Review dealer fleet requests and manage payment settlements.
                        </Typography>
                    </Box>
                    <Button
                        onClick={onClose}
                        size="small"
                        sx={{
                            minWidth: 0,
                            p: "6px",
                            borderRadius: "8px",
                            color: "#64748b",
                            border: "1px solid #e2e8f0",
                            "&:hover": { background: "#f1f5f9", color: "#0f172a" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: "18px" }} />
                    </Button>
                </Box>

                {/* Filter & Search Toolbar */}
                <Box
                    sx={{
                        backgroundColor: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #eef1f5",
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Tabs
                        value={selectedTab}
                        onChange={(_, val) => onTabChange(val)}
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

                    <TextField
                        size="small"
                        placeholder="Search requests, models..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
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
                                backgroundColor: "#ffffff",
                                "& fieldset": { borderColor: "#e2e8f0" },
                                "&:hover fieldset": { borderColor: "#cbd5e1" },
                                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                            },
                        }}
                    />
                </Box>

                {/* Full Requests Table */}
                <TableContainer sx={{ borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                    <Table size="small" aria-label="Filtered Requests">
                        <TableHead>
                            <TableRow sx={{ background: "#f8fafc" }}>
                                {["Order ID", "Dealer ID", "Total Quantity", "Quotation Amount", "Status", "Payment Status", "Action"].map((h) => (
                                    <TableCell
                                        key={h}
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: "#64748b",
                                            borderBottom: "1px solid #f1f5f9",
                                            py: 1.2,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((req) => {
                                const statusStyle = STATUS_STYLES[req.status] ?? { bg: "#f1f5f9", color: "#475569" };
                                const payStyle = PAYMENT_STYLES[req.paymentStatus] ?? { bg: "#f1f5f9", color: "#475569" };
                                return (
                                    <TableRow
                                        key={req.id}
                                        sx={{
                                            "&:last-child td": { borderBottom: 0 },
                                            "&:hover": { background: "#fafbfc" },
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 700, color: "#2563eb", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                                            {req.requestNumber ?? req.id}
                                        </TableCell>
                                        <TableCell sx={{ color: "#374151", fontSize: "12.5px", fontWeight: 600, whiteSpace: "nowrap" }}>
                                            {req.dealerId || "DLR-10024"}
                                        </TableCell>
                                        <TableCell sx={{ color: "#374151", fontSize: "12.5px", fontWeight: 600 }}>
                                            {req.totalQuantity}
                                        </TableCell>
                                        <TableCell sx={{ color: "#111827", fontSize: "12.5px", fontWeight: 700, whiteSpace: "nowrap" }}>
                                            {req.quotationAmount}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={req.status}
                                                size="small"
                                                sx={{
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color,
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    height: "22px",
                                                    borderRadius: "999px",
                                                    "& .MuiChip-label": { px: "9px" },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={req.paymentStatus}
                                                size="small"
                                                sx={{
                                                    background: payStyle.bg,
                                                    color: payStyle.color,
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    height: "22px",
                                                    borderRadius: "999px",
                                                    "& .MuiChip-label": { px: "9px" },
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => onViewDetails(req)}
                                                endIcon={<OpenInNewIcon sx={{ fontSize: "13px !important" }} />}
                                                sx={{
                                                    fontSize: "11px",
                                                    fontWeight: 700,
                                                    textTransform: "none",
                                                    borderColor: "#334155",
                                                    color: "#334155",
                                                    borderRadius: "7px",
                                                    px: 1.2,
                                                    py: 0.4,
                                                    whiteSpace: "nowrap",
                                                    "&:hover": { background: "#334155", color: "#fff", borderColor: "#334155" },
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {requests.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        sx={{ textAlign: "center", py: 5, color: "#94a3b8", fontSize: "14px" }}
                                    >
                                        No requests found matching your filter criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
