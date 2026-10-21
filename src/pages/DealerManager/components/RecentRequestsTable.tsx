import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { DmRequest } from "../types";
import RequestDetailsModal from "./RequestDetailsModal/RequestDetailsModal";

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

type RecentRequestsTableProps = {
    requests: DmRequest[];
    title?: string;
    showViewAll?: boolean;
};

export default function RecentRequestsTable({
    requests,
    title = "Recent Requests",
    showViewAll = true,
}: RecentRequestsTableProps) {
    const navigate = useNavigate();
    const [selectedRequest, setSelectedRequest] = useState<DmRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenDetails = (req: DmRequest) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    const handleRequestUpdated = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    return (
        <>
            <Card
                elevation={0}
                sx={{
                    border: "1px solid #eef1f5",
                    borderRadius: "14px",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
                    transition: "box-shadow 0.2s ease",
                    "&:hover": {
                        boxShadow: "0 8px 26px rgba(15, 23, 42, 0.12)",
                    },
                    mt: 3,
                }}
            >
                <CardContent sx={{ p: "20px !important" }}>
                    {/* Header */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", fontSize: "16px" }}>
                            {title}
                        </Typography>
                        {showViewAll && (
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => navigate("/dealermanager/requests")}
                                sx={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#2563eb",
                                    textTransform: "none",
                                    p: 0,
                                    minWidth: 0,
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                View All
                            </Button>
                        )}
                    </Box>

                    <TableContainer sx={{ borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                        <Table size="small" aria-label="Recent Requests">
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
                                            <TableCell sx={{ color: "#374151", fontSize: "12.5px", fontWeight: 600 }}>{req.totalQuantity}</TableCell>
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
                                                    onClick={() => handleOpenDetails(req)}
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
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Request Details & Payment Modal */}
            <RequestDetailsModal
                open={isModalOpen}
                onClose={handleCloseDetails}
                request={selectedRequest}
                onRequestUpdated={handleRequestUpdated}
            />
        </>
    );
}
