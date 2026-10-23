import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { sectionCardStyle, tableHeadStyle, tableBodyStyle } from "../modalStyles";
import type { DmRequest } from "../../../types";
import type { Order } from "../../../../../types/order";
import type { Quotation } from "../../../../../types/quotation";
import { getOrderQuotation } from "../../../utils/orderQuotation";
import { formatInr } from "../../../utils/generateQuotationPdf";

type FinalQuotationSectionProps = {
    requestId?: string;
    request?: DmRequest | null;
    order?: Order;
    quotation?: Quotation | null;
    isLoading?: boolean;
    quotationNo?: string;
    date?: string;
};

export default function FinalQuotationSection({
    requestId = "",
    request,
    order,
    quotation,
    isLoading = false,
    quotationNo,
    date,
}: FinalQuotationSectionProps) {
    const effectiveQuotationNo = quotationNo || request?.quotationNo || (quotation ? `QTN-${requestId}` : "Not available");

    const formatDate = (isoString?: string) => {
        if (!isoString) return "—";
        const d = new Date(isoString);
        return isNaN(d.getTime())
            ? isoString
            : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const effectiveDate = date || formatDate(order?.orderDate ?? request?.orderDate);

    const totals = getOrderQuotation(quotation ?? null);
    const quotationRows = totals?.items.map((item) => ({
        ...item,
        total: item.qty * item.unitPrice,
    })) ?? [];
    const formatAmount = (amount: number | undefined) => amount === undefined ? "—" : formatInr(amount);
    const formatPercentage = (value: number | undefined) => value === undefined ? "—" : `${value}%`;

    return (
        <Box sx={sectionCardStyle}>
            {/* ── Top Header: Final Quotation + Quotation No & Date ── */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.5,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            backgroundColor: "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2563eb",
                        }}
                    >
                        <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                            Final Quotation
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b", mt: 0.3 }}>
                            Official vehicle quotation with itemized pricing &amp; tax breakdown
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                            Quotation No.
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                            {effectiveQuotationNo}
                        </Typography>
                    </Box>
                    <Box sx={{ width: "1px", height: "30px", backgroundColor: "#e2e8f0" }} />
                    <Box sx={{ textAlign: "left" }}>
                        <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                            Date
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                            {effectiveDate}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>
            ) : !quotation ? (
                <Alert severity="info" sx={{ mb: 2 }}>No quotation is available for this request.</Alert>
            ) : null}

            {/* ── Vehicle Quotation Table ── */}
            <TableContainer sx={{ border: "1px solid #f1f5f9", borderRadius: "10px", mb: 2.5 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                            <TableCell sx={{ ...tableHeadStyle, width: 48, pl: 2 }}>#</TableCell>
                            <TableCell sx={tableHeadStyle}>Model</TableCell>
                            <TableCell sx={tableHeadStyle}>Variant</TableCell>
                            <TableCell align="center" sx={tableHeadStyle}>Quantity</TableCell>
                            <TableCell align="right" sx={tableHeadStyle}>Unit Price (INR)</TableCell>
                            <TableCell align="right" sx={{ ...tableHeadStyle, pr: 2 }}>Total (INR)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {quotationRows.map((row) => (
                            <TableRow key={row.id} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                                <TableCell sx={{ ...tableBodyStyle, pl: 2, color: "#64748b" }}>{row.id}</TableCell>
                                <TableCell sx={{ ...tableBodyStyle, fontWeight: 700, color: "#0f172a" }}>
                                    {row.model}
                                </TableCell>
                                <TableCell sx={tableBodyStyle}>{row.variant}</TableCell>
                                <TableCell align="center" sx={tableBodyStyle}>{row.qty}</TableCell>
                                <TableCell align="right" sx={tableBodyStyle}>{formatInr(row.unitPrice)}</TableCell>
                                <TableCell align="right" sx={{ ...tableBodyStyle, fontWeight: 800, color: "#0f172a", pr: 2 }}>
                                    {formatInr(row.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── 4 Summary Cards Grid: Advance, Balance, Total Amount, Cost Breakdown ── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "1fr 1fr 1.15fr 1.35fr" },
                    gap: 2,
                }}
            >
                {/* 1. Advance Payment Card */}
                <Box
                    sx={{
                        p: 2.2,
                        borderRadius: "14px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: "#e8fdf2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1.5,
                        }}
                    >
                        <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 20, color: "#10b981" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                            Advance Payment
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                            ({formatPercentage(totals?.advanceRate)} of Final Total)
                        </Typography>
                        <Typography sx={{ fontSize: "21px", fontWeight: 900, color: "#0f172a", mt: 1 }}>
                            {formatAmount(totals?.advanceAmount)}
                        </Typography>
                    </Box>
                </Box>

                {/* 2. Balance Payable Card */}
                <Box
                    sx={{
                        p: 2.2,
                        borderRadius: "14px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: "#f3e8ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1.5,
                        }}
                    >
                        <ReceiptOutlinedIcon sx={{ fontSize: 20, color: "#9333ea" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                            Balance Payable
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                            ({totals ? `${100 - totals.advanceRate}%` : "—"} upon dispatch)
                        </Typography>
                        <Typography sx={{ fontSize: "21px", fontWeight: 900, color: "#0f172a", mt: 1 }}>
                            {formatAmount(totals?.balanceAmount)}
                        </Typography>
                    </Box>
                </Box>

                {/* 3. Total Quotation Amount (Solid Highlight Card) */}
                <Box
                    sx={{
                        p: 2.2,
                        borderRadius: "14px",
                        backgroundColor: "#0f2b5c",
                        color: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 6px 16px rgba(15, 43, 92, 0.25)",
                    }}
                >
                    <Box
                        sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1.5,
                        }}
                    >
                        <PaidOutlinedIcon sx={{ fontSize: 20, color: "#ffffff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", opacity: 0.95 }}>
                            Final Quotation Total
                        </Typography>
                        <Typography sx={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", mt: 0.5 }}>
                            {formatAmount(totals?.finalTotal)}
                        </Typography>
                    </Box>
                </Box>

                {/* 4. Cost Breakdown Card */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: "14px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <Box
                            sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                backgroundColor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BarChartOutlinedIcon sx={{ fontSize: 16, color: "#2563eb" }} />
                        </Box>
                        <Typography sx={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a" }}>
                            Pricing Breakdown
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>Gross Subtotal</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                                {formatAmount(totals?.grossSubtotal)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>Fleet Discount</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#16a34a" }}>
                                - {formatInr(0)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>Taxable Amount</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                                {formatAmount(totals?.taxableAmount)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>GST ({formatPercentage(totals?.taxRate)})</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                                {formatAmount(totals?.taxAmount)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mt: 1.2,
                            p: 1,
                            px: 1.2,
                            borderRadius: "8px",
                            backgroundColor: "#eff6ff",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563eb" }}>
                            Net Final Total
                        </Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 900, color: "#2563eb" }}>
                            {formatAmount(totals?.finalTotal)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
