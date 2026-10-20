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
import { sectionCardStyle, tableHeadStyle, tableBodyStyle } from "../modalStyles";
import type { DmRequest, VehicleLineItem } from "../../../types";
import { formatInr } from "../../../utils/generateQuotationPdf";

type FinalQuotationSectionProps = {
    requestId?: string;
    request?: DmRequest | null;
    quotationNo?: string;
    date?: string;
};

export default function FinalQuotationSection({
    requestId = "FR-2026-0048",
    request,
    quotationNo,
    date,
}: FinalQuotationSectionProps) {
    const effectiveQuotationNo = quotationNo || request?.quotationNo || `QTN-${requestId}`;

    const formatDate = (isoString?: string) => {
        if (!isoString) {
            return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        }
        const d = new Date(isoString);
        return isNaN(d.getTime())
            ? isoString
            : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    const effectiveDate = date || formatDate(request?.orderDate);

    // Dynamic resolution of items
    let rawItems: VehicleLineItem[] = [];
    if (request?.items && request.items.length > 0) {
        rawItems = request.items;
    } else if (requestId === "ORD-1001") {
        rawItems = [
            { id: 1, model: "Renault Kiger", variant: "RXE MT Petrol", qty: 20, unitPrice: 750000 },
            { id: 2, model: "Renault Triber", variant: "RXZ Easy-R AMT", qty: 15, unitPrice: 650000 },
            { id: 3, model: "Renault Duster", variant: "RXZ Turbo CVT", qty: 15, unitPrice: 800000 },
        ];
    } else if (request) {
        const qty = Math.max(1, request.totalQuantity || 1);
        let price = 800000;
        if (request.quotationAmount) {
            const num = Number(request.quotationAmount.replace(/[^0-9]/g, ""));
            if (num > 0) {
                price = Math.round((num / 1.18) / qty);
            }
        }
        rawItems = [
            {
                id: 1,
                model: request.vehicleModel || "Renault Vehicle",
                variant: "Standard Fleet Trim",
                qty: qty,
                unitPrice: price,
            },
        ];
    } else {
        rawItems = [
            { id: 1, model: "Renault Kiger", variant: "RXE MT Petrol", qty: 20, unitPrice: 750000 },
            { id: 2, model: "Renault Triber", variant: "RXZ Easy-R AMT", qty: 15, unitPrice: 650000 },
            { id: 3, model: "Renault Duster", variant: "RXZ Turbo CVT", qty: 15, unitPrice: 800000 },
        ];
    }

    const quotationRows = rawItems.map((item, idx) => {
        const qty = Math.max(0, Number(item.qty) || 0);
        const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
        const total = Math.round(qty * unitPrice);
        return {
            id: item.id || idx + 1,
            model: item.model,
            variant: item.variant || "Standard Trim",
            qty,
            unitPrice,
            total,
        };
    });

    const grossSubtotal = quotationRows.reduce((sum, r) => sum + r.total, 0);
    const discount = Math.min(
        grossSubtotal,
        Math.max(0, request?.discountAmount !== undefined ? request.discountAmount : (requestId === "ORD-1001" ? 1750000 : 0))
    );
    const taxableAmount = Math.max(0, grossSubtotal - discount);
    const taxRate = request?.taxRate ?? 18;
    const gstAmount = Math.round(taxableAmount * (taxRate / 100));
    const finalTotal = taxableAmount + gstAmount;

    const advanceRate = request?.depositRate ?? 20;
    const advanceAmount = Math.round(finalTotal * (advanceRate / 100));
    const balanceAmount = finalTotal - advanceAmount;

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
                            ({advanceRate}% of Final Total)
                        </Typography>
                        <Typography sx={{ fontSize: "21px", fontWeight: 900, color: "#0f172a", mt: 1 }}>
                            {formatInr(advanceAmount)}
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
                            ({100 - advanceRate}% upon dispatch)
                        </Typography>
                        <Typography sx={{ fontSize: "21px", fontWeight: 900, color: "#0f172a", mt: 1 }}>
                            {formatInr(balanceAmount)}
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
                            {formatInr(finalTotal)}
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
                                {formatInr(grossSubtotal)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>Fleet Discount</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#16a34a" }}>
                                - {formatInr(discount)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>Taxable Amount</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                                {formatInr(taxableAmount)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ fontSize: "12px", color: "#64748b" }}>GST ({taxRate}%)</Typography>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                                {formatInr(gstAmount)}
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
                            {formatInr(finalTotal)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
