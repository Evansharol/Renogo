import { useState } from "react";
import { updateQuotation } from "../../../../api/quotations";
import type { Order } from "../../../../types/order";
import type { Quotation } from "../../../../types/quotation";
import AvailabilityProgressBar from "../../../../components/AvailabilityProgressBar";

export type VehicleStock = {
    name: string;
    variant: string;
    transmission: string;
    quantity: number;
};

type ManufacturerRequest = {
    orderId: string;
    model: string;
    color: string;
    quantity: number;
    stockBreakdown: Record<string, number>;
};

type ReviewQuotationProps = {
    order: Order;
    quotation: Quotation | null;
    manufacturerRequest?: ManufacturerRequest;
    vehicleStock: VehicleStock[];
    onQuotationChange: (quotation: Quotation) => void;
    onClose: () => void;
};

export default function ReviewQuotation({ order, quotation, manufacturerRequest, vehicleStock, onQuotationChange, onClose }: ReviewQuotationProps) {
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const normalizeModel = (model: string) => model.replace(/^Renault\s+/i, "").trim().toLowerCase();
    const matchingVehicleStock = vehicleStock.filter((vehicle) => normalizeModel(vehicle.name) === normalizeModel(order.vehicleModel));
    const requestedQuantity = order.quantity;
    const colorStock = manufacturerRequest
        ? manufacturerRequest.stockBreakdown[manufacturerRequest.color] ?? 0
        : matchingVehicleStock.reduce((total, vehicle) => total + vehicle.quantity, 0);
    const availableStock = Math.min(colorStock, requestedQuantity);
    const toManufacture = Math.max(0, requestedQuantity - availableStock);
    const stockPercentage = requestedQuantity ? Math.round((availableStock / requestedQuantity) * 100) : 0;
    const totalPrice = quotation ? quotation.basePrice * quotation.quantity : 0;
    const taxAmount = quotation ? totalPrice * quotation.taxRate / 100 : 0;
    const quotationTotal = totalPrice + taxAmount;
    const advancePayment = quotation ? quotationTotal * quotation.depositRate / 100 : 0;
    const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
    const description = `${order.status} • ${matchingVehicleStock.map((vehicle) => `${vehicle.variant} ${vehicle.transmission}`).join(", ") || "Vehicle details from order"}`;

    const saveBankDetails = async () => {
        if (!quotation?.bankDetails) return;
        try {
            onQuotationChange(await updateQuotation(quotation.id, { bankDetails: quotation.bankDetails }));
            setIsEditingBank(false);
            setActionMessage("Bank details saved.");
        } catch {
            setActionMessage("Unable to save bank details.");
        }
    };

    const sendToSalesManager = async () => {
        if (!quotation) return;
        try {
            onQuotationChange(await updateQuotation(quotation.id, { status: "Sent to Sales Manager" }));
            setActionMessage("Quotation sent to Sales Manager.");
        } catch {
            setActionMessage("Unable to send quotation to Sales Manager.");
        }
    };

    return (
        <div className="supervisor-drawer-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="supervisor-drawer" role="dialog" aria-modal="true" aria-labelledby="supervisor-review-title">
                <header className="supervisor-drawer-header">
                    <div><p>Dealer Supervisor View</p><h2 id="supervisor-review-title">Quotation Preparation</h2></div>
                    <button type="button" className="supervisor-modal-close" onClick={onClose} aria-label="Close review">×</button>
                </header>
                <div className="supervisor-drawer-body">
                    <h3 className="supervisor-section-title">Dealer &amp; Request Details</h3>
                    <div className="supervisor-details">
                        <span>Dealer ID<strong>{order.dealerId}</strong></span>
                        <span>Order ID<strong>{order.id}</strong></span>
                        <span>Vehicle Model<strong>{order.vehicleModel}</strong></span>
                        <span>Quantity<strong>{order.quantity}</strong></span>
                    </div>
                    <section className="supervisor-drawer-card supervisor-breakdown-card">
                        <div className="supervisor-card-heading"><div><h3>Vehicle Breakdown</h3><p>Detailed breakdown for the selected dealer request.</p></div></div>
                        <div className="supervisor-breakdown-wrapper">
                            <table className="supervisor-breakdown-table">
                                <thead><tr><th>#</th><th>Vehicle / Variant / Description</th><th>Quantity</th><th>Unit Price</th><th>Total Price</th></tr></thead>
                                <tbody><tr><td>1</td><td><strong>{quotation?.vehicleModel ?? order.vehicleModel}</strong><span>{description}</span></td><td>{order.quantity}</td><td>{quotation ? formatCurrency(quotation.basePrice) : "Not available"}</td><td>{quotation ? formatCurrency(totalPrice) : "Not available"}</td></tr></tbody>
                                {quotation && <tfoot><tr><th colSpan={4}>Total Vehicle Price</th><th>{formatCurrency(totalPrice)}</th></tr></tfoot>}
                            </table>
                        </div>
                    </section>
                    <section className="supervisor-drawer-card">
                        <div className="supervisor-card-heading"><div><h3>Stock Availability</h3><p>Current availability for this vehicle request.</p></div><strong>{stockPercentage}% Available</strong></div>
                        <AvailabilityProgressBar
                            available={availableStock}
                            manufacturing={toManufacture}
                            total={requestedQuantity}
                        />
                        <div className="supervisor-stock-summary"><span>Available stock<strong>{availableStock} units</strong></span><span>To manufacture<strong>{toManufacture} units</strong></span></div>
                        <div className="supervisor-allocation-costs"><span>Available stock cost<strong>{formatCurrency(quotation ? availableStock * quotation.basePrice : 0)}</strong></span><span>Manufacturing cost<strong>{formatCurrency(quotation ? toManufacture * quotation.basePrice : 0)}</strong></span></div>
                    </section>
                    <section className="supervisor-drawer-card">
                        <h3>Pricing &amp; Finance</h3>
                        {quotation ? <div className="supervisor-quote">
                            <span>Unit price<strong>{formatCurrency(quotation.basePrice)}</strong></span><span>Vehicle total<strong>{formatCurrency(totalPrice)}</strong></span><span>Tax ({quotation.taxRate}%)<strong>{formatCurrency(taxAmount)}</strong></span><span>Total quotation<strong>{formatCurrency(quotationTotal)}</strong></span><span>Advance ({quotation.depositRate}%)<strong>{formatCurrency(advancePayment)}</strong></span><span>Payment terms<strong>{quotation.paymentTerms}</strong></span><span>GST number<strong>{quotation.gstNumber}</strong></span>
                        </div> : <p className="supervisor-no-quote">No quotation has been provided for this order yet.</p>}
                    </section>
                    {quotation && <>
                        <div className="supervisor-summary-grid">
                            <div className="supervisor-summary-card supervisor-summary-card--blue"><span>Total Quotation Amount</span><strong>{formatCurrency(quotationTotal)}</strong><small>Inclusive of taxes and duties</small></div>
                            <div className="supervisor-summary-card supervisor-summary-card--green"><span>Advance Payment</span><strong>{formatCurrency(advancePayment)}</strong><small>{quotation.depositRate}% of total quotation</small></div>
                        </div>
                        <section className="supervisor-drawer-card">
                            <div className="supervisor-card-heading"><div><h3>Bank Details</h3><p>Payment account for this quotation.</p></div><button type="button" className="supervisor-link-button" onClick={() => setIsEditingBank((value) => !value)}>{isEditingBank ? "Save" : "View / Edit"}</button></div>
                            {quotation.bankDetails ? <div className="supervisor-bank-grid">
                                <label>Beneficiary Name<input readOnly={!isEditingBank} value={quotation.bankDetails.beneficiaryName} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, beneficiaryName: event.target.value } })} /></label>
                                <label>Account Number<input readOnly={!isEditingBank} value={quotation.bankDetails.accountNumber} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, accountNumber: event.target.value } })} /></label>
                                <label>IFSC Code<input readOnly={!isEditingBank} value={quotation.bankDetails.ifscCode} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, ifscCode: event.target.value } })} /></label>
                                <label>Bank &amp; Branch<input readOnly={!isEditingBank} value={quotation.bankDetails.bankBranch} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, bankBranch: event.target.value } })} /></label>
                            </div> : <p className="supervisor-no-quote">Bank details are not available.</p>}
                            {isEditingBank && quotation.bankDetails && <button type="button" className="supervisor-save-button" onClick={saveBankDetails}>Save Bank Details</button>}
                        </section>
                    </>}
                    {actionMessage && <p className="supervisor-action-message" role="status">{actionMessage}</p>}
                </div>
                <footer className="supervisor-drawer-footer">
                    <button type="button" className="supervisor-secondary-button" onClick={onClose}>Close</button>
                    {quotation && <button type="button" className="supervisor-secondary-button" onClick={() => { window.print(); setActionMessage("Print dialog opened. Choose Save as PDF to generate the quotation PDF."); }}>Generate Quotation PDF</button>}
                    {quotation && <button type="button" className="supervisor-quotation-button" onClick={sendToSalesManager}>Send to Sales Manager</button>}
                </footer>
            </section>
        </div>
    );
}