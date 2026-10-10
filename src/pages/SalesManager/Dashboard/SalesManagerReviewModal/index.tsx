import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import type { Order } from "../../../../types/order";
import type { Quotation } from "../../../../types/quotation";
import AvailabilityProgressBar from "../../../../components/AvailabilityProgressBar";

type Allocation = {
    dealerId?: string;
    dealerName?: string;
    color?: string;
    stockBreakdown?: Record<string, number>;
};

type SalesManagerReviewModalProps = {
    order: Order;
    allocation?: Allocation;
    quotation: Quotation | null;
    onClose: () => void;
    onAction: (status: string) => void;
};

export default function SalesManagerReviewModal({
    order,
    allocation,
    quotation,
    onClose,
    onAction,
}: SalesManagerReviewModalProps) {
    const [note, setNote] = useState("");
    const [declineReason, setDeclineReason] = useState("");
    const [isDeclineReasonOpen, setIsDeclineReasonOpen] = useState(false);
    const colorStock = allocation?.stockBreakdown?.[allocation.color ?? ""] ?? 0;
    const available = Math.min(colorStock, order.quantity);
    const manufacturing = Math.max(0, order.quantity - available);
    const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
    const vehicleTotal = quotation ? quotation.basePrice * quotation.quantity : 0;
    const tax = quotation ? vehicleTotal * quotation.taxRate / 100 : 0;
    const quotationTotal = vehicleTotal + tax;
    const canDecline = declineReason.trim().length > 0;

    return (
        <div className="sales-manager-review-overlay" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="sales-manager-review-modal" role="dialog" aria-modal="true" aria-labelledby="sales-manager-review-title">
                <header className="sales-manager-review-header">
                    <div><p>Sales Manager Review</p><h2 id="sales-manager-review-title">Review Request</h2><span>{order.id} · {order.vehicleModel}</span></div>
                    <button type="button" onClick={onClose} aria-label="Close review"><CloseIcon /></button>
                </header>
                <div className="sales-manager-review-body">
                    <section className="sales-manager-review-card">
                        <h3>Dealer &amp; Order Details</h3>
                        <div className="sales-manager-detail-grid">
                            <span>Dealer ID<strong>{order.dealerId}</strong></span>
                            <span>Dealer Name<strong>{allocation?.dealerName ?? "Dealer account"}</strong></span>
                            <span>Order ID<strong>{order.id}</strong></span>
                            <span>Vehicle Model<strong>{order.vehicleModel}</strong></span>
                            <span>Quantity<strong>{order.quantity} Units</strong></span>
                            <span>Order Status<strong>{order.status}</strong></span>
                        </div>
                    </section>

                    <section className="sales-manager-review-card">
                        <h3>Stock Availability</h3>
                        <AvailabilityProgressBar available={available} manufacturing={manufacturing} total={order.quantity} />
                        <div className="sales-manager-stock-summary">
                            <span>Available stock<strong>{available} Units</strong></span>
                            <span>To manufacture<strong>{manufacturing} Units</strong></span>
                        </div>
                    </section>

                    <section className="sales-manager-review-card">
                        <h3>Finance &amp; Quotation</h3>
                        {quotation ? (
                            <div className="sales-manager-finance-grid">
                                <span>Unit price<strong>{formatCurrency(quotation.basePrice)}</strong></span>
                                <span>Vehicle total<strong>{formatCurrency(vehicleTotal)}</strong></span>
                                <span>Tax ({quotation.taxRate}%)<strong>{formatCurrency(tax)}</strong></span>
                                <span>Total quotation<strong>{formatCurrency(quotationTotal)}</strong></span>
                                <span>Advance ({quotation.depositRate}%)<strong>{formatCurrency(quotationTotal * quotation.depositRate / 100)}</strong></span>
                                <span>Payment terms<strong>{quotation.paymentTerms}</strong></span>
                            </div>
                        ) : <p>No quotation is available for this order.</p>}
                    </section>

                    <section className="sales-manager-review-card">
                        <h3>Bank Details</h3>
                        {quotation?.bankDetails ? (
                            <div className="sales-manager-finance-grid">
                                <span>Beneficiary<strong>{quotation.bankDetails.beneficiaryName}</strong></span>
                                <span>Account number<strong>{quotation.bankDetails.accountNumber}</strong></span>
                                <span>IFSC code<strong>{quotation.bankDetails.ifscCode}</strong></span>
                                <span>Bank branch<strong>{quotation.bankDetails.bankBranch}</strong></span>
                            </div>
                        ) : <p>Bank details are not available.</p>}
                    </section>

                    <section className="sales-manager-review-card">
                        <label className="sales-manager-field">Add note
                            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal review note..." />
                        </label>
                        {isDeclineReasonOpen && (
                            <label className="sales-manager-field">Reason for decline
                                <textarea
                                    autoFocus
                                    value={declineReason}
                                    onChange={(event) => setDeclineReason(event.target.value)}
                                    placeholder="Enter the reason for declining..."
                                    required
                                />
                            </label>
                        )}
                    </section>
                </div>
                <footer className="sales-manager-review-footer">
                    <button type="button" className="sales-manager-secondary" onClick={onClose}>Cancel</button>
                    <div>
                        {!isDeclineReasonOpen ? (
                            <button type="button" className="sales-manager-danger" onClick={() => setIsDeclineReasonOpen(true)}>Decline</button>
                        ) : (
                            <button type="button" className="sales-manager-danger" disabled={!canDecline} onClick={() => onAction(`Declined: ${declineReason}${note ? ` — ${note}` : ""}`)}>Confirm Decline</button>
                        )}
                        <button type="button" className="sales-manager-primary" onClick={() => onAction(`Approved and sent to Dealer Manager${note ? ` — ${note}` : ""}`)}>Approve &amp; Send to Dealer Manager</button>
                    </div>
                </footer>
            </section>
        </div>
    );
}
