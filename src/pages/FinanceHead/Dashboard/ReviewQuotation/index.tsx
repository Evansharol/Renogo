import { useMemo, useState } from "react";
import { createQuotation, updateQuotation } from "../../../../api/quotations";
import type { Order } from "../../../../types/order";
import type { Quotation } from "../../../../types/quotation";
import AvailabilityProgressBar from "../../../../components/AvailabilityProgressBar";
import { generateFinanceHeadQuotationPdf } from "../../utils/generateQuotationPdf";
import { applyWorkflowTransition, useUpdateOrderMutation } from "../../../../features/orders/ordersApi";
import { getOrderDisplayNumber } from "../../../../utils/orderDisplay";
import { parseCatalogPrice } from "../../../../utils/vehiclePricing";

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
    onOrderStatusChange: (order: Order) => void;
    onClose: () => void;
};

export default function ReviewQuotation({ order, quotation, manufacturerRequest, vehicleStock, onQuotationChange, onOrderStatusChange, onClose }: ReviewQuotationProps) {
    const catalogUnitPrice = useMemo(() => {
        const items = order.items ?? [];
        const pricedItems = items.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice && item.unitPrice > 0
                ? item.unitPrice
                : parseCatalogPrice(item.startingPrice),
        }));
        if (pricedItems.length && pricedItems.every((item) => item.unitPrice !== null && item.unitPrice !== undefined)) {
            const totalQuantity = pricedItems.reduce((total, item) => total + item.quantity, 0);
            if (totalQuantity > 0) {
                return Math.round(pricedItems.reduce(
                    (total, item) => total + item.quantity * (item.unitPrice ?? 0),
                    0,
                ) / totalQuantity);
            }
        }
        return order.quantity > 0 && order.estimatedTotal
            ? Math.round(order.estimatedTotal / order.quantity)
            : 0;
    }, [order]);
    const [updateOrder] = useUpdateOrderMutation();
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [basePriceOverride, setBasePriceOverride] = useState<number | null>(null);
    const [taxRateOverride, setTaxRateOverride] = useState<number | null>(null);
    const [depositRateOverride, setDepositRateOverride] = useState<number | null>(null);
    const [paymentTermsOverride, setPaymentTermsOverride] = useState<string | null>(null);
    const basePrice = basePriceOverride ?? quotation?.basePrice ?? catalogUnitPrice;
    const taxRate = taxRateOverride ?? quotation?.taxRate ?? 18;
    const depositRate = depositRateOverride ?? quotation?.depositRate ?? 20;
    const paymentTerms = paymentTermsOverride ?? quotation?.paymentTerms ?? "30 days from quotation date";
    const normalizeModel = (model: string) => model.replace(/^Renault\s+/i, "").trim().toLowerCase();
    const requestedModels = order.items?.map((item) => normalizeModel(item.model)) ?? [normalizeModel(order.vehicleModel)];
    const matchingVehicleStock = vehicleStock.filter((vehicle) => requestedModels.includes(normalizeModel(vehicle.name)));
    const requestedQuantity = order.quantity;
    const manufacturerStock = manufacturerRequest
        ? Object.values(manufacturerRequest.stockBreakdown).reduce((total, value) => total + value, 0)
        : 0;
    const colorStock = manufacturerStock > 0
        ? manufacturerStock
        : matchingVehicleStock.reduce((total, vehicle) => total + vehicle.quantity, 0);
    const availableStock = Math.min(colorStock, requestedQuantity);
    const toManufacture = Math.max(0, requestedQuantity - availableStock);
    const stockPercentage = requestedQuantity ? Math.round((availableStock / requestedQuantity) * 100) : 0;
    const activeBasePrice = quotation && !isEditingPrice ? quotation.basePrice : basePrice;
    const activeTaxRate = quotation && !isEditingPrice ? quotation.taxRate : taxRate;
    const activeDepositRate = quotation && !isEditingPrice ? quotation.depositRate : depositRate;
    const totalPrice = activeBasePrice * requestedQuantity;
    const taxAmount = totalPrice * activeTaxRate / 100;
    const quotationTotal = totalPrice + taxAmount;
    const advancePayment = quotationTotal * activeDepositRate / 100;
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

    const saveQuotation = async () => {
        if (!basePrice || basePrice <= 0) {
            setActionMessage("Enter a valid unit price before continuing.");
            return;
        }
        try {
            const saved = quotation
                ? await updateQuotation(quotation.id, { basePrice, taxRate, depositRate, paymentTerms })
                : await createQuotation({
                    id: `QUO-${Date.now()}`,
                    dealerId: order.dealerId,
                    orderId: order.id,
                    vehicleModel: order.vehicleModel,
                    quantity: order.quantity,
                    basePrice,
                    taxRate,
                    depositRate,
                    gstNumber: "GST-PENDING",
                    paymentTerms,
                    bankDetails: {
                        beneficiaryName: "Renault India Private Limited",
                        accountNumber: "Finance account details pending",
                        ifscCode: "IFSC-PENDING",
                        bankBranch: "Renault India Commercial Banking",
                    },
                    status: "Draft",
                });
            onQuotationChange(saved);
            setIsEditingPrice(false);
            setActionMessage("Quotation amount saved.");
        } catch {
            setActionMessage("Unable to save quotation amount.");
        }
    };

    const sendToSalesManager = async () => {
        if (!quotation) return;
        try {
            const updatedQuotation = await updateQuotation(quotation.id, { status: "Quotation Sent" });
            onQuotationChange(updatedQuotation);
            const updatedOrder = applyWorkflowTransition(order, {
                status: "Pending Sales Manager Approval",
                owner: "Sales Manager",
                remarks: "Quotation generated and sent for sales manager approval.",
            });
            await updateOrder(updatedOrder).unwrap();
            onOrderStatusChange(updatedOrder);
            setActionMessage("Quotation sent to Sales Manager.");
        } catch {
            setActionMessage("Unable to send quotation to Sales Manager.");
        }
    };

    const generatePdf = async () => {
        if (!quotation) return;
        setIsGeneratingPdf(true);
        try {
            const dealerNames: Record<string, { name: string; location: string }> = {
                D001: { name: "ABC Motors", location: "Chennai" },
                D002: { name: "Royal Autos", location: "Bangalore" },
                D003: { name: "Chennai Cars", location: "Chennai" },
            };
            const dealer = dealerNames[order.dealerId] ?? { name: `Dealer ${order.dealerId}`, location: "India" };
            await generateFinanceHeadQuotationPdf({
                order,
                quotation,
                dealer,
                manufacturerRequest,
                vehicleStock,
            });
            setActionMessage("Quotation PDF downloaded successfully.");
        } catch (error) {
            setActionMessage(error instanceof Error ? error.message : "Unable to generate quotation PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="financehead-drawer-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="financehead-drawer" role="dialog" aria-modal="true" aria-labelledby="financehead-review-title">
                <header className="financehead-drawer-header">
                    <div><p>Dealer Finance Head View</p><h2 id="financehead-review-title">Quotation Preparation</h2></div>
                    <button type="button" className="financehead-modal-close" onClick={onClose} aria-label="Close review">×</button>
                </header>
                <div className="financehead-drawer-body">
                    <h3 className="financehead-section-title">Dealer &amp; Request Details</h3>
                    <div className="financehead-details">
                        <span>Dealer ID<strong>{order.dealerId}</strong></span>
                        <span>Order ID<strong>{getOrderDisplayNumber(order)}</strong></span>
                        <span>Vehicle Model<strong>{order.vehicleModel}</strong></span>
                        <span>Quantity<strong>{order.quantity}</strong></span>
                    </div>
                    <section className="financehead-drawer-card financehead-breakdown-card">
                        <div className="financehead-card-heading"><div><h3>Vehicle Breakdown</h3><p>Detailed breakdown for the selected dealer request.</p></div></div>
                        <div className="financehead-breakdown-wrapper">
                            <table className="financehead-breakdown-table">
                                <thead><tr><th>#</th><th>Vehicle / Variant / Description</th><th>Quantity</th><th>Unit Price</th><th>Total Price</th></tr></thead>
                                <tbody><tr><td>1</td><td><strong>{quotation?.vehicleModel ?? order.vehicleModel}</strong><span>{description}</span></td><td>{order.quantity}</td><td>{activeBasePrice > 0 ? formatCurrency(activeBasePrice) : "Not available"}</td><td>{totalPrice > 0 ? formatCurrency(totalPrice) : "Not available"}</td></tr></tbody>
                                {activeBasePrice > 0 && <tfoot><tr><th colSpan={4}>Total Vehicle Price</th><th>{formatCurrency(totalPrice)}</th></tr></tfoot>}
                            </table>
                        </div>
                    </section>
                    <section className="financehead-drawer-card">
                        <div className="financehead-card-heading"><div><h3>Stock Availability</h3><p>Current availability for this vehicle request.</p></div><strong>{stockPercentage}% Available</strong></div>
                        <AvailabilityProgressBar
                            available={availableStock}
                            manufacturing={toManufacture}
                            total={requestedQuantity}
                        />
                        <div className="financehead-stock-summary"><span>Available stock<strong>{availableStock} units</strong></span><span>To manufacture<strong>{toManufacture} units</strong></span></div>
                        <div className="financehead-allocation-costs"><span>Available stock cost<strong>{formatCurrency(quotation ? availableStock * quotation.basePrice : 0)}</strong></span><span>Manufacturing cost<strong>{formatCurrency(quotation ? toManufacture * quotation.basePrice : 0)}</strong></span></div>
                    </section>
                    <section className="financehead-drawer-card">
                        <div className="financehead-card-heading">
                            <div><h3>Pricing &amp; Finance</h3>{quotation && <p>Review or adjust the saved finance quotation.</p>}</div>
                            {quotation && !isEditingPrice && <button type="button" className="financehead-link-button" onClick={() => setIsEditingPrice(true)}>Edit Pricing</button>}
                        </div>
                        {(!quotation || isEditingPrice) && <div className="financehead-quote-editor">
                            <p className="financehead-quote-editor-note">
                                {catalogUnitPrice > 0
                                    ? `Catalog unit price: ${formatCurrency(catalogUnitPrice)}. Edit the amount if needed.`
                                    : "Catalog price is unavailable for this request. Enter a unit amount to prepare the quotation."}
                            </p>
                            <label>Unit price per vehicle<input type="number" min="1" value={basePrice || ""} onChange={(event) => setBasePriceOverride(Number(event.target.value))} /></label>
                            <label>Tax %<input type="number" min="0" value={taxRate} onChange={(event) => setTaxRateOverride(Number(event.target.value))} /></label>
                            <label>Advance %<input type="number" min="0" max="100" value={depositRate} onChange={(event) => setDepositRateOverride(Number(event.target.value))} /></label>
                            <label>Payment terms<input value={paymentTerms} onChange={(event) => setPaymentTermsOverride(event.target.value)} /></label>
                            <div className="financehead-quote-editor-actions">
                                <button type="button" className="financehead-save-button" onClick={saveQuotation}>
                                    {quotation ? "Save Pricing Changes" : "Create Finance Quotation"}
                                </button>
                                {quotation && <button type="button" className="financehead-secondary-button" onClick={() => {
                                    setBasePriceOverride(null);
                                    setTaxRateOverride(null);
                                    setDepositRateOverride(null);
                                    setPaymentTermsOverride(null);
                                    setIsEditingPrice(false);
                                }}>Cancel</button>}
                            </div>
                        </div>}
                        {quotation && !isEditingPrice && <div className="financehead-quote">
                            <span>Unit price<strong>{formatCurrency(quotation.basePrice)}</strong></span><span>Vehicle total<strong>{formatCurrency(totalPrice)}</strong></span><span>Tax ({quotation.taxRate}%)<strong>{formatCurrency(taxAmount)}</strong></span><span>Total quotation<strong>{formatCurrency(quotationTotal)}</strong></span><span>Advance ({quotation.depositRate}%)<strong>{formatCurrency(advancePayment)}</strong></span><span>Payment terms<strong>{quotation.paymentTerms}</strong></span><span>GST number<strong>{quotation.gstNumber}</strong></span>
                        </div>}
                        {!quotation && <p className="financehead-no-quote">No quotation has been provided for this order yet.</p>}
                    </section>
                    {quotation && <>
                        <div className="financehead-summary-grid">
                            <div className="financehead-summary-card financehead-summary-card--blue"><span>Total Quotation Amount</span><strong>{formatCurrency(quotationTotal)}</strong><small>Inclusive of taxes and duties</small></div>
                            <div className="financehead-summary-card financehead-summary-card--green"><span>Advance Payment</span><strong>{formatCurrency(advancePayment)}</strong><small>{quotation.depositRate}% of total quotation</small></div>
                        </div>
                        <section className="financehead-drawer-card">
                            <div className="financehead-card-heading"><div><h3>Bank Details</h3><p>Payment account for this quotation.</p></div><button type="button" className="financehead-link-button" onClick={() => setIsEditingBank((value) => !value)}>{isEditingBank ? "Save" : "View / Edit"}</button></div>
                            {quotation.bankDetails ? <div className="financehead-bank-grid">
                                <label>Beneficiary Name<input readOnly={!isEditingBank} value={quotation.bankDetails.beneficiaryName} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, beneficiaryName: event.target.value } })} /></label>
                                <label>Account Number<input readOnly={!isEditingBank} value={quotation.bankDetails.accountNumber} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, accountNumber: event.target.value } })} /></label>
                                <label>IFSC Code<input readOnly={!isEditingBank} value={quotation.bankDetails.ifscCode} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, ifscCode: event.target.value } })} /></label>
                                <label>Bank &amp; Branch<input readOnly={!isEditingBank} value={quotation.bankDetails.bankBranch} onChange={(event) => onQuotationChange({ ...quotation, bankDetails: { ...quotation.bankDetails!, bankBranch: event.target.value } })} /></label>
                            </div> : <p className="financehead-no-quote">Bank details are not available.</p>}
                            {isEditingBank && quotation.bankDetails && <button type="button" className="financehead-save-button" onClick={saveBankDetails}>Save Bank Details</button>}
                        </section>
                    </>}
                    {actionMessage && <p className="financehead-action-message" role="status">{actionMessage}</p>}
                </div>
                <footer className="financehead-drawer-footer">
                    <button type="button" className="financehead-secondary-button" onClick={onClose}>Close</button>
                    {quotation && <button type="button" className="financehead-secondary-button" onClick={generatePdf} disabled={isGeneratingPdf}>{isGeneratingPdf ? "Generating PDF..." : "Generate Quotation PDF"}</button>}
                    {quotation && <button type="button" className="financehead-quotation-button" onClick={sendToSalesManager}>Send to Sales Manager</button>}
                </footer>
            </section>
        </div>
    );
}