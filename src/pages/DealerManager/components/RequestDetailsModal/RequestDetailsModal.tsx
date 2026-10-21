import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { DmRequest } from "../../types";
import { getOrders, updateOrder } from "../../../../api/orders";
import { transitionOrder } from "../../../../api/workflow";

// Modular Subcomponents
import ModalHeaderBanner from "./components/ModalHeaderBanner";
import ModalMetricCards from "./components/ModalMetricCards";
import RequestStatusStepper from "./components/RequestStatusStepper";
import RequestSummarySection from "./components/RequestSummarySection";
import ManufacturerBankDetails from "./components/ManufacturerBankDetails";
import FinalQuotationSection from "./components/FinalQuotationSection";
import RecentActivitySection from "./components/RecentActivitySection";
import ManagerActionsBar from "./components/ManagerActionsBar";
import ExactBankDetailsModal from "./components/ExactBankDetailsModal";
import UploadPaymentProofModal from "./components/UploadPaymentProofModal";

type RequestDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    request?: DmRequest | null;
    onRequestUpdated?: (requestId: string) => void;
};

export default function RequestDetailsModal({ open, onClose, request, onRequestUpdated }: RequestDetailsModalProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [paymentSubmitted, setPaymentSubmitted] = useState(
        request?.paymentStatus === "Submitted" || request?.paymentStatus === "Completed"
    );
    const [orderConfirmed, setOrderConfirmed] = useState(request?.status === "Completed");

    const requestId = request?.id || "FR-2026-0048";

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "16px",
                            maxHeight: "92vh",
                            backgroundColor: "#f8fafc",
                            overflow: "hidden",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        },
                    },
                }}
            >
                {/* ── Dialog Header ── */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                    }}
                >
                    <Box>
                        <Typography sx={{ fontSize: "12px", color: "#64748b", fontWeight: 500, mb: 0.3 }}>
                            Approved Requests &gt; <span style={{ color: "#0f172a", fontWeight: 600 }}>Request Details</span>
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "20px" }}>
                            Request Details &amp; Payment
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: "#64748b",
                            "&:hover": { backgroundColor: "#f1f5f9", color: "#0f172a" },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* ── Dialog Scrollable Content ── */}
                <DialogContent sx={{ p: 3, backgroundColor: "#f8fafc" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {/* 1. Request Header Banner */}
                        <ModalHeaderBanner
                            requestId={requestId}
                            request={request}
                        />

                        {/* 2. Top 4 Metric Info Cards */}
                        <ModalMetricCards request={request} />

                        {/* 3. Request Status Stepper */}
                        <RequestStatusStepper
                            acknowledged={acknowledged || paymentSubmitted}
                            orderConfirmed={orderConfirmed}
                        />

                        {/* 4. Request Summary & Bank Details Grid */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
                                gap: 2,
                            }}
                        >
                            <RequestSummarySection request={request} />
                            <ManufacturerBankDetails
                                requestId={requestId}
                                onViewExactDetails={() => setIsBankDetailsOpen(true)}
                            />
                        </Box>

                        {/* 5. Final Quotation */}
                        <FinalQuotationSection
                            requestId={requestId}
                            request={request}
                            quotationNo={`QTN-${requestId}`}
                        />

                        {/* 6. Recent Activity */}
                        <RecentActivitySection />

                        {/* 7. Dealer Manager Actions Bar (Horizontal) */}
                        <ManagerActionsBar
                            acknowledged={acknowledged || paymentSubmitted}
                            onAcknowledge={() => setAcknowledged(true)}
                            onViewPaymentDetails={() => setIsBankDetailsOpen(true)}
                            onUploadPaymentProof={() => setIsUploadModalOpen(true)}
                            paymentSubmitted={paymentSubmitted}
                        />
                    </Box>
                </DialogContent>
            </Dialog>

            {/* ── Exact Bank Details Popup Modal ── */}
            <ExactBankDetailsModal
                open={isBankDetailsOpen}
                onClose={() => setIsBankDetailsOpen(false)}
                requestId={requestId}
                request={request}
                onProceedToUpload={() => setIsUploadModalOpen(true)}
            />

            {/* ── Upload Payment Proof & Receipt Modal ── */}
            <UploadPaymentProofModal
                open={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                requestId={requestId}
                request={request}
                onSuccess={async (details) => {
                    setPaymentSubmitted(true);
                    setAcknowledged(true);
                    const order = (await getOrders()).find((candidate) => candidate.id === requestId);
                    if (order) {
                        const transitionedOrder = await transitionOrder(order, {
                            status: "Completed",
                            owner: "Admin",
                            remarks: `Payment proof ${details.fileName} submitted and acknowledgement completed. UTR: ${details.utr}.`,
                        });
                        await updateOrder({
                            ...transitionedOrder,
                            paymentProof: {
                                fileName: details.fileName,
                                submittedAt: new Date().toISOString(),
                                remarks: `UTR: ${details.utr}; Amount: ${details.amount}`,
                            },
                        });
                        setOrderConfirmed(true);
                        onRequestUpdated?.(requestId);
                    }
                }}
            />
        </>
    );
}
