import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import type { DmRequest } from "../../types";
import type { Quotation } from "../../../../types/quotation";
import { getQuotationByOrderId } from "../../../../api/quotations";
import { ordersToDmRequests } from "../../../../api/dmRequests";
import { getOrderQuotation } from "../../utils/orderQuotation";
import { applyWorkflowTransition, useGetOrdersQuery, useUpdateOrderMutation } from "../../../../features/orders/ordersApi";
import { getOrderDisplayNumber } from "../../../../utils/orderDisplay";

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
    const { data: orders = [], isError: ordersError, isLoading: ordersLoading } = useGetOrdersQuery();
    const [updateOrder] = useUpdateOrderMutation();
    const requestId = request?.id ?? "";
    const selectedOrder = orders.find((candidate) => candidate.id === requestId);
    const activeRequest = selectedOrder ? ordersToDmRequests([selectedOrder])[0] ?? request : request;
    const [acknowledging, setAcknowledging] = useState(false);
    const [actionError, setActionError] = useState({ requestId: "", message: "" });
    const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [quotationState, setQuotationState] = useState<{
        orderId: string;
        quotation: Quotation | null;
        error: string;
    }>({ orderId: "", quotation: null, error: "" });

    const displayRequestId = request ? getOrderDisplayNumber(request) : requestId;
    const quotation = quotationState.orderId === selectedOrder?.id ? quotationState.quotation : null;
    const selectedOrderId = selectedOrder?.id;
    const quotationLoading = Boolean(open && (ordersLoading || (selectedOrderId && quotationState.orderId !== selectedOrderId)));
    const quotationTotals = getOrderQuotation(quotation);
    const acknowledged = Boolean(activeRequest && activeRequest.status !== "Awaiting Acknowledgement");
    const paymentSubmitted = activeRequest?.paymentStatus === "Submitted" || activeRequest?.paymentStatus === "Completed";
    const orderConfirmed = activeRequest?.status === "Completed";

    useEffect(() => {
        if (!open || !selectedOrderId) return;

        let isCurrent = true;
        getQuotationByOrderId(selectedOrderId)
            .then((loadedQuotation) => {
                if (isCurrent) {
                    setQuotationState({
                        orderId: selectedOrderId,
                        quotation: loadedQuotation,
                        error: "",
                    });
                }
            })
            .catch((error: unknown) => {
                if (isCurrent) {
                    setQuotationState({
                        orderId: selectedOrderId,
                        quotation: null,
                        error: error instanceof Error ? error.message : "Unable to load the quotation.",
                    });
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [open, selectedOrderId]);
    const handleAcknowledge = async () => {
        setAcknowledging(true);
        setActionError({ requestId, message: "" });
        try {
            if (ordersError) throw new Error("Unable to load orders. Please try again.");
            const order = orders.find((candidate) => candidate.id === requestId);
            if (!order) throw new Error("The request could not be found.");
            const updatedOrder = applyWorkflowTransition(order, {
                status: "Awaiting Payment",
                owner: "Dealer Manager",
                remarks: "Dealer Manager acknowledged the quotation and terms.",
            });
            await updateOrder(updatedOrder).unwrap();
        } catch (error) {
            setActionError({ requestId, message: error instanceof Error ? error.message : "Unable to acknowledge the request." });
        } finally {
            setAcknowledging(false);
        }
    };

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
                        {ordersError && <Alert severity="error">Unable to load the selected request. Please try again.</Alert>}
                        {!ordersLoading && !ordersError && request && !selectedOrder && (
                            <Alert severity="warning">This request could not be found in the current order data.</Alert>
                        )}
                        <ModalHeaderBanner
                            requestId={displayRequestId}
                            request={activeRequest}
                            quotation={quotation}
                        />

                        {/* 2. Top 4 Metric Info Cards */}
                        <ModalMetricCards request={activeRequest} order={selectedOrder} quotation={quotation} />

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
                            <RequestSummarySection request={activeRequest} order={selectedOrder} />
                            <ManufacturerBankDetails
                                requestId={displayRequestId}
                                quotation={quotation}
                                onViewExactDetails={() => setIsBankDetailsOpen(true)}
                            />
                        </Box>

                        {/* 5. Final Quotation */}
                        <FinalQuotationSection
                            requestId={displayRequestId}
                            request={activeRequest}
                            order={selectedOrder}
                            quotation={quotation}
                            isLoading={quotationLoading}
                            quotationNo={quotation?.id}
                        />

                        {/* 6. Recent Activity */}
                        <RecentActivitySection order={selectedOrder} />

                        {/* 7. Dealer Manager Actions Bar (Horizontal) */}
                        <ManagerActionsBar
                            acknowledged={acknowledged || paymentSubmitted}
                            acknowledging={acknowledging}
                            onAcknowledge={() => void handleAcknowledge()}
                            onViewPaymentDetails={() => setIsBankDetailsOpen(true)}
                            onUploadPaymentProof={() => setIsUploadModalOpen(true)}
                            paymentSubmitted={paymentSubmitted}
                            canUploadPayment={Boolean(quotationTotals) && !quotationLoading}
                        />
                        {quotationState.error && quotationState.orderId === selectedOrder?.id && (
                            <Typography role="status" sx={{ color: "#64748b", fontSize: "13px" }}>
                                Quotation could not be loaded: {quotationState.error}
                            </Typography>
                        )}
                        {actionError.requestId === requestId && actionError.message && (
                            <Typography role="alert" sx={{ color: "#dc2626", fontSize: "13px" }}>{actionError.message}</Typography>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>

            {/* ── Exact Bank Details Popup Modal ── */}
            <ExactBankDetailsModal
                key={requestId}
                open={isBankDetailsOpen}
                onClose={() => setIsBankDetailsOpen(false)}
                requestId={displayRequestId}
                quotation={quotation}
                onProceedToUpload={() => setIsUploadModalOpen(true)}
            />

            {/* ── Upload Payment Proof & Receipt Modal ── */}
            <UploadPaymentProofModal
                key={`${requestId}-${quotationTotals?.advanceAmount ?? "unquoted"}`}
                open={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                requestId={displayRequestId}
                defaultAmount={quotationTotals?.advanceAmount.toLocaleString("en-IN")}
                onSuccess={async (details) => {
                    if (ordersError) throw new Error("Unable to load orders. Please try again.");
                    const order = orders.find((candidate) => candidate.id === requestId);
                    if (!order) throw new Error("The request could not be found.");
                    const transitionedOrder = applyWorkflowTransition(order, {
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
                    }).unwrap();
                    setActionError({ requestId, message: "" });
                    onRequestUpdated?.(requestId);
                }}
            />
        </>
    );
}
