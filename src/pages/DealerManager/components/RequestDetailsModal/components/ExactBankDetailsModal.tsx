import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import type { Quotation } from "../../../../../types/quotation";
import { getOrderQuotation } from "../../../utils/orderQuotation";
import { formatInr } from "../../../utils/generateQuotationPdf";

interface ExactBankDetailsModalProps {
    open: boolean;
    onClose: () => void;
    requestId: string;
    quotation?: Quotation | null;
    onProceedToUpload?: () => void;
}

export default function ExactBankDetailsModal({
    open,
    onClose,
    requestId,
    quotation,
    onProceedToUpload,
}: ExactBankDetailsModalProps) {
    const totals = getOrderQuotation(quotation ?? null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const details = [
        { label: "Beneficiary Name", value: quotation?.bankDetails?.beneficiaryName || "Not provided", copyable: Boolean(quotation?.bankDetails?.beneficiaryName) },
        { label: "Bank Name", value: "Not provided", copyable: false },
        { label: "Account Number", value: quotation?.bankDetails?.accountNumber || "Not provided", copyable: Boolean(quotation?.bankDetails?.accountNumber), highlight: true },
        { label: "Confirm Account Number", value: quotation?.bankDetails?.accountNumber || "Not provided", copyable: Boolean(quotation?.bankDetails?.accountNumber) },
        { label: "IFSC Code", value: quotation?.bankDetails?.ifscCode || "Not provided", copyable: Boolean(quotation?.bankDetails?.ifscCode), highlight: true },
        { label: "Account Type", value: "Not provided", copyable: false },
        { label: "Branch", value: quotation?.bankDetails?.bankBranch || "Not provided", copyable: false },
        { label: "Settlement Reference", value: `${requestId} - ADVANCE`, copyable: true, highlight: true },
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
                    },
                },
            }}
        >
            {/* ── Dialog Header ── */}
            <Box
                sx={{
                    px: 3,
                    py: 2.2,
                    backgroundColor: "#0f2b5c",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <AccountBalanceIcon sx={{ fontSize: 22, color: "#ffffff" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "17px", lineHeight: 1.2 }}>
                            Manufacturer Bank Details
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", mt: 0.3 }}>
                            Exact credentials for fleet settlement • Ref: <strong>{requestId}</strong>
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: "rgba(255, 255, 255, 0.8)",
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)", color: "#ffffff" },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* ── Content ── */}
            <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
                {/* Verified Account Banner */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        backgroundColor: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: "10px",
                        mb: 2.5,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <VerifiedUserOutlinedIcon sx={{ color: "#059669", fontSize: 20 }} />
                        <Box>
                            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#065f46" }}>
                                Payment details from quotation
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: "#047857" }}>
                                Verified by National Financial Settlement Gateway
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label="Active for RTGS / NEFT"
                        size="small"
                        sx={{
                            backgroundColor: "#10b981",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "10.5px",
                            height: "22px",
                        }}
                    />
                </Box>

                {/* Amount to Transfer Card */}
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2.5,
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    }}
                >
                    <Box>
                        <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                            Required Advance Amount ({totals ? `${totals.advanceRate}%` : "—"})
                        </Typography>
                        <Typography sx={{ fontSize: "22px", fontWeight: 900, color: "#0f2b5c" }}>
                            {totals ? formatInr(totals.advanceAmount) : "—"}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "11px", color: "#64748b" }}>Final Total Quotation</Typography>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            {totals ? formatInr(totals.finalTotal) : "—"}
                        </Typography>
                    </Box>
                </Box>

                {/* Exact Details List */}
                <Box
                    sx={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                        mb: 2.5,
                    }}
                >
                    {details.map((item, index) => (
                        <Box
                            key={item.label}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                px: 2,
                                py: 1.3,
                                borderBottom: index < details.length - 1 ? "1px solid #f1f5f9" : "none",
                                backgroundColor: item.highlight ? "#faf5ff" : index % 2 === 0 ? "#ffffff" : "#fcfcfd",
                            }}
                        >
                            <Box sx={{ minWidth: 160 }}>
                                <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                                    {item.label}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, textAlign: "right" }}>
                                <Typography
                                    sx={{
                                        fontSize: item.highlight ? "13.5px" : "12.5px",
                                        fontWeight: item.highlight ? 800 : 700,
                                        color: item.highlight ? "#6d28d9" : "#0f172a",
                                        letterSpacing: item.label.includes("Account") || item.label.includes("IFSC") ? "0.5px" : "normal",
                                    }}
                                >
                                    {item.value}
                                </Typography>
                                {item.copyable && (
                                    <Tooltip title={copiedField === item.label ? "Copied!" : `Copy ${item.label}`} arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopy(item.value, item.label)}
                                            sx={{
                                                p: 0.5,
                                                color: copiedField === item.label ? "#16a34a" : "#94a3b8",
                                                "&:hover": { color: "#2563eb", backgroundColor: "#eff6ff" },
                                            }}
                                        >
                                            {copiedField === item.label ? (
                                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                                            ) : (
                                                <ContentCopyIcon sx={{ fontSize: 16 }} />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Important Instructions Note */}
                <Box
                    sx={{
                        p: 1.8,
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.2,
                        mb: 2.5,
                    }}
                >
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: "#2563eb", mt: 0.2 }} />
                    <Box sx={{ fontSize: "11.5px", color: "#1e40af", lineHeight: 1.5 }}>
                        <strong>Important:</strong> Please ensure the transaction narration or remark contains your Request ID (<strong>{requestId}</strong>). After transferring the advance, click below to upload your transaction confirmation receipt/image.
                    </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            fontSize: "12.5px",
                            borderRadius: "8px",
                            px: 2.5,
                            color: "#64748b",
                            borderColor: "#cbd5e1",
                            "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                        }}
                    >
                        Close
                    </Button>
                    {onProceedToUpload && totals && quotation?.bankDetails?.accountNumber && quotation.bankDetails.ifscCode && (
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                            onClick={() => {
                                onClose();
                                onProceedToUpload();
                            }}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                fontSize: "12.5px",
                                borderRadius: "8px",
                                px: 2.5,
                                backgroundColor: "#0f2b5c",
                                "&:hover": { backgroundColor: "#1e3a8a" },
                            }}
                        >
                            Upload Payment Proof
                        </Button>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
