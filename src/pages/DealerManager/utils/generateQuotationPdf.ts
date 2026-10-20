import jsPDF from "jspdf";
import type { DmRequest, VehicleLineItem, BankSettlementDetails } from "../types";

export interface QuotationPdfOptions {
    requestId: string;
    request?: DmRequest | null;
    quotationNo?: string;
    date?: string;
    validityDays?: number;
    items?: VehicleLineItem[];
    discountAmount?: number;
    taxRate?: number;
    advancePercent?: number;
    bankDetails?: BankSettlementDetails;
    approvalStatus?: string;
    verificationStatus?: string;
}

export function formatInr(value: number): string {
    if (isNaN(value)) return "₹ 0";
    return `₹ ${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatPdfCurrency(value: number): string {
    if (isNaN(value)) return "Rs. 0";
    return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

export function generateQuotationPdf(options: QuotationPdfOptions) {
    const { requestId, request } = options;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2; // 186mm

    // ── 1. Dynamic Dates & Metadata Resolution ──
    const formatDisplayDate = (d: Date) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(d.getDate()).padStart(2, "0");
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    };

    let issueDateObj = new Date();
    if (options.date) {
        const parsed = new Date(options.date);
        if (!isNaN(parsed.getTime())) {
            issueDateObj = parsed;
        }
    } else if (request?.orderDate) {
        const parsed = new Date(request.orderDate);
        if (!isNaN(parsed.getTime())) {
            issueDateObj = parsed;
        }
    }
    const issueDateStr = formatDisplayDate(issueDateObj);

    const validityDays = options.validityDays ?? 30;
    const expiryDateObj = new Date(issueDateObj.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const expiryDateStr = formatDisplayDate(expiryDateObj);

    const now = new Date();
    const isExpired = now.getTime() > expiryDateObj.getTime();
    const validityStatus = isExpired ? "Expired" : "Active";

    const effectiveQuotationNo = options.quotationNo || request?.quotationNo || `QTN-${requestId}`;
    const rawDealerName = request?.dealerName || "ABC Motors Pvt. Ltd.";
    const dealerName = rawDealerName.length > 28 ? rawDealerName.slice(0, 26) + "..." : rawDealerName;
    const dealerId = request?.dealerId || "D001";
    const approvalStatus = options.approvalStatus || "Approved by Sales Manager";
    const verificationStatus = options.verificationStatus || "Verification Complete";

    // ── 2. Dynamic Vehicle Items & Calculation Engine ──
    let rawItems: VehicleLineItem[] = [];
    if (options.items && options.items.length > 0) {
        rawItems = options.items;
    } else if (request?.items && request.items.length > 0) {
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

    const resolvedItems = rawItems.map((item, idx) => {
        const qty = Math.max(0, Number(item.qty) || 0);
        const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
        const total = Math.round(qty * unitPrice);
        return {
            id: item.id || idx + 1,
            model: item.model || "Vehicle",
            variant: item.variant || "Standard Fleet Trim",
            qty,
            unitPrice,
            total,
        };
    });

    const totalQty = resolvedItems.reduce((acc, it) => acc + it.qty, 0);
    const grossSubtotal = resolvedItems.reduce((acc, it) => acc + it.total, 0);

    // Fleet Discount (pre-tax deduction)
    let inputDiscount = 0;
    if (options.discountAmount !== undefined) {
        inputDiscount = Number(options.discountAmount) || 0;
    } else if (request?.discountAmount !== undefined) {
        inputDiscount = Number(request.discountAmount) || 0;
    } else if (requestId === "ORD-1001") {
        inputDiscount = 1750000;
    }
    const discount = Math.min(grossSubtotal, Math.max(0, inputDiscount));
    const netTaxableAmount = Math.max(0, grossSubtotal - discount);

    // Tax (GST)
    const taxRate = options.taxRate ?? request?.taxRate ?? 18;
    const gstAmount = Math.round(netTaxableAmount * (taxRate / 100));

    // Final Quotation Total
    const finalTotal = netTaxableAmount + gstAmount;

    // Advance & Balance
    const advanceRate = options.advancePercent ?? request?.depositRate ?? 20;
    const advanceAmount = Math.round(finalTotal * (advanceRate / 100));
    const balanceAmount = finalTotal - advanceAmount;

    // ── 3. Bank Settlement Credentials ──
    const bankDetails = {
        beneficiaryName: options.bankDetails?.beneficiaryName || request?.bankDetails?.beneficiaryName || "Renault India Private Limited",
        bankName: options.bankDetails?.bankName || request?.bankDetails?.bankName || "HDFC Bank Ltd.",
        accountNumber: options.bankDetails?.accountNumber || request?.bankDetails?.accountNumber || "50200088991234",
        ifscCode: options.bankDetails?.ifscCode || request?.bankDetails?.ifscCode || "HDFC0001234",
        accountType: options.bankDetails?.accountType || request?.bankDetails?.accountType || "Corporate Current Account",
        bankBranch: options.bankDetails?.bankBranch || request?.bankDetails?.bankBranch || "DLF Cyber City, Sector 24, Gurgaon - 122002",
        settlementRef: `${requestId} - ADVANCE`,
        acceptedModes: "RTGS / NEFT Inter-Bank Transfer Only",
    };

    // Helper to draw the top header banner on any page
    const drawHeaderBanner = (pageDoc: jsPDF) => {
        pageDoc.setFillColor(15, 23, 42); // Slate 900
        pageDoc.rect(0, 0, pageWidth, 24, "F");

        pageDoc.setTextColor(255, 255, 255);
        pageDoc.setFont("helvetica", "bold");
        pageDoc.setFontSize(15);
        pageDoc.text("RENAULT INDIA PRIVATE LIMITED", margin, 11);

        pageDoc.setFont("helvetica", "normal");
        pageDoc.setFontSize(8);
        pageDoc.setTextColor(203, 213, 225); // Slate 300
        pageDoc.text("COMMERCIAL FLEET & INSTITUTIONAL SALES DIVISION", margin, 17);

        pageDoc.setFont("helvetica", "bold");
        pageDoc.setFontSize(11);
        pageDoc.setTextColor(255, 255, 255);
        pageDoc.text("OFFICIAL FLEET QUOTATION", pageWidth - margin, 11, { align: "right" });

        pageDoc.setFont("helvetica", "normal");
        pageDoc.setFontSize(8);
        pageDoc.setTextColor(203, 213, 225);
        pageDoc.text(`Ref: ${requestId} • ${effectiveQuotationNo}`, pageWidth - margin, 17, { align: "right" });
    };

    // ── Draw Page 1 Header ──
    drawHeaderBanner(doc);

    // ── Metadata & Dealer Information Box ──
    let y = 28;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 23, "FD");

    // Column 1: Quotation Details
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("QUOTATION NUMBER", margin + 4, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(effectiveQuotationNo, margin + 4, y + 11.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Order ID: ${requestId}`, margin + 4, y + 17);

    // Column 2: Dates & Validity
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("DATE OF ISSUE", margin + 46, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(issueDateStr, margin + 46, y + 11.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Valid Until: ${expiryDateStr} (${validityStatus})`, margin + 46, y + 17);

    // Column 3: Dealer Recipient
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("DEALER RECIPIENT", margin + 92, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(dealerName, margin + 92, y + 11.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Dealer ID: ${dealerId}`, margin + 92, y + 17);

    // Column 4: Workflow Approval Status
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("APPROVAL STATUS", margin + 138, y + 5.5);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(approvalStatus, margin + 138, y + 11.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(verificationStatus, margin + 138, y + 17);

    // ── Section 1: Vehicle Fleet Specifications & Line Item Pricing ──
    y = 56;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("1. VEHICLE FLEET SPECIFICATIONS & LINE ITEM PRICING", margin, y);

    y += 3.5;
    // Table Header
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(margin, y, contentWidth, 7.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("#", margin + 4, y + 5);
    doc.text("Vehicle Model Description", margin + 12, y + 5);
    doc.text("Variant / Trim", margin + 74, y + 5);
    doc.text("Qty", margin + 116, y + 5, { align: "center" });
    doc.text("Unit Price (INR)", margin + 150, y + 5, { align: "right" });
    doc.text("Line Total (INR)", margin + contentWidth - 4, y + 5, { align: "right" });

    const tableStartY = y;
    y += 7.5;
    doc.setLineWidth(0.2);

    resolvedItems.forEach((item, idx) => {
        const bg = idx % 2 === 0 ? 255 : 248;
        doc.setFillColor(bg, bg, bg);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 7, "FD");

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(String(item.id), margin + 4, y + 4.8);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(item.model, margin + 12, y + 4.8);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(item.variant, margin + 74, y + 4.8);
        doc.text(String(item.qty), margin + 116, y + 4.8, { align: "center" });

        doc.text(formatPdfCurrency(item.unitPrice), margin + 150, y + 4.8, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(formatPdfCurrency(item.total), margin + contentWidth - 4, y + 4.8, { align: "right" });

        y += 7;
    });

    // Subtotal Row inside Table
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Fleet Total Quantity: ${totalQty} Units`, margin + 12, y + 4.8);
    doc.text("Gross Subtotal:", margin + 140, y + 4.8, { align: "right" });
    doc.text(formatPdfCurrency(grossSubtotal), margin + contentWidth - 4, y + 4.8, { align: "right" });

    // Outer table border
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.3);
    doc.rect(margin, tableStartY, contentWidth, y - tableStartY + 7);

    // ── 4. Commercial Terms & Financial Pricing Summary ──
    // Check if remaining height allows everything on Page 1
    const neededForRemaining = 48 + 34 + 10 + 20 + 15; // ~ 127mm
    if (y + neededForRemaining > pageHeight - margin - 15) {
        doc.addPage();
        drawHeaderBanner(doc);
        y = 30;
    } else {
        y += 11;
    }

    const splitWidth = (contentWidth - 6) / 2; // 90mm each

    // Left Column: Commercial Terms & Timeline
    const termsX = margin;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(termsX, y, splitWidth, 48, "FD");

    // Header bar inside terms
    doc.setFillColor(241, 245, 249);
    doc.rect(termsX, y, splitWidth, 6.5, "FD");
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("COMMERCIAL TERMS & TIMELINE", termsX + 3.5, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(51, 65, 85);

    let termY = y + 11.5;
    const addTermLine = (bullet: string, text: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(bullet, termsX + 3.5, termY);
        doc.setFont("helvetica", "normal");
        doc.text(text, termsX + 7, termY);
        termY += 5.8;
    };

    addTermLine("•", `Total Fleet Allocation: ${totalQty} Commercial Units`);
    addTermLine("•", `Advance Payment (${advanceRate}%): ${formatPdfCurrency(advanceAmount)} for manufacturing slot`);
    addTermLine("•", `Balance Payment (${100 - advanceRate}%): ${formatPdfCurrency(balanceAmount)} prior to vehicle dispatch`);
    addTermLine("•", "Estimated Delivery Schedule: 4-6 Weeks post advance receipt");
    addTermLine("•", "Standard Warranty: 3 Years / 1,00,000 km standard OEM coverage");
    addTermLine("•", "Jurisdiction: Governed by commercial laws of Gurgaon, Haryana");

    // Right Column: Financial Pricing Summary (Calculation Breakdown)
    const summaryX = margin + splitWidth + 6;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.rect(summaryX, y, splitWidth, 48, "FD");

    // Header bar inside summary
    doc.setFillColor(15, 23, 42);
    doc.rect(summaryX, y, splitWidth, 6.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("PRICING & SETTLEMENT SUMMARY", summaryX + 3.5, y + 4.5);

    let sumRowY = y + 11;
    const addSummaryRow = (label: string, value: string, isBold = false, isLarge = false) => {
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(isLarge ? 9 : 7.8);
        doc.setTextColor(isBold ? 15 : 71, isBold ? 23 : 85, isBold ? 42 : 105);
        doc.text(label, summaryX + 3.5, sumRowY);
        doc.text(value, summaryX + splitWidth - 3.5, sumRowY, { align: "right" });
        sumRowY += 5.2;
    };

    addSummaryRow("Gross Subtotal (Line Items):", formatPdfCurrency(grossSubtotal));
    addSummaryRow("Special Fleet Discount:", "- " + formatPdfCurrency(discount));
    addSummaryRow("Net Taxable Amount:", formatPdfCurrency(netTaxableAmount), true);
    addSummaryRow(`Applicable GST (${taxRate}% on Taxable):`, formatPdfCurrency(gstAmount));

    // Divider line
    doc.setDrawColor(203, 213, 225);
    doc.line(summaryX + 3.5, sumRowY - 1.5, summaryX + splitWidth - 3.5, sumRowY - 1.5);

    // Final Total Highlight Box
    doc.setFillColor(241, 245, 249);
    doc.rect(summaryX + 2, sumRowY - 0.5, splitWidth - 4, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("FINAL QUOTATION TOTAL:", summaryX + 3.5, sumRowY + 4);
    doc.text(formatPdfCurrency(finalTotal), summaryX + splitWidth - 3.5, sumRowY + 4, { align: "right" });
    sumRowY += 8.2;

    addSummaryRow(`${advanceRate}% Advance Payable:`, formatPdfCurrency(advanceAmount), true);
    addSummaryRow(`${100 - advanceRate}% Balance Upon Dispatch:`, formatPdfCurrency(balanceAmount), true);

    // ── 5. Official Manufacturer Bank Settlement Credentials ──
    y += 52;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 34, "FD");

    // Header bar inside bank box
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6.5, "FD");
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("2. OFFICIAL MANUFACTURER BANK SETTLEMENT CREDENTIALS (VERIFIED ESCROW ACCOUNT)", margin + 4, y + 4.5);

    const bankCol1 = margin + 4;
    const bankCol2 = margin + 94;
    let bY = y + 11.5;

    const printBankField = (label: string, val: string, x: number, currY: number, highlight = false, valOffset = 30) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(label, x, currY);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.8);
        doc.setTextColor(highlight ? 15 : 30, highlight ? 23 : 41, highlight ? 42 : 59);
        doc.text(val, x + valOffset, currY);
    };

    printBankField("Beneficiary Name:", bankDetails.beneficiaryName, bankCol1, bY, false, 32);
    printBankField("Bank Name:", bankDetails.bankName, bankCol2, bY, false, 28);
    bY += 5.5;
    printBankField("Account Number:", bankDetails.accountNumber, bankCol1, bY, true, 32);
    printBankField("IFSC Code:", bankDetails.ifscCode, bankCol2, bY, true, 28);
    bY += 5.5;
    printBankField("Account Type:", bankDetails.accountType, bankCol1, bY, false, 32);
    printBankField("Bank Branch:", bankDetails.bankBranch, bankCol2, bY, false, 28);
    bY += 5.5;
    printBankField("Settlement Ref:", bankDetails.settlementRef, bankCol1, bY, true, 32);
    printBankField("Accepted Modes:", bankDetails.acceptedModes, bankCol2, bY, false, 28);

    // ── 6. Statutory Tax Note & Disclaimer ──
    y += 37;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(
        `Statutory Tax Treatment: GST @ ${taxRate}% is applied on net taxable value after fleet discount deduction. Verified under applicable Indian GST rules (HSN 8703).`,
        margin,
        y
    );

    // ── 7. Signatures & Commercial Authorization Block ──
    y += 14;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);

    const sigW = 50;
    const sig1X = margin;
    const sig2X = margin + 68;
    const sig3X = margin + 136;

    doc.line(sig1X, y, sig1X + sigW, y);
    doc.line(sig2X, y, sig2X + sigW, y);
    doc.line(sig3X, y, sig3X + sigW, y);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("PREPARED BY", sig1X, y + 4);
    doc.text("REVIEWED & APPROVED", sig2X, y + 4);
    doc.text("AUTHORIZED SIGNATORY", sig3X, y + 4);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Commercial Fleet Team", sig1X, y + 7.5);
    doc.text("Sales Manager, Renault India", sig2X, y + 7.5);
    doc.text("Renault India Private Limited", sig3X, y + 7.5);

    // ── 8. Footers Across All Generated Pages ──
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, 283, pageWidth - margin, 283);

        doc.setFontSize(6.8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(
            "Renault India Pvt Ltd • CIN: U34100TN2005PTC057885 • GSTIN: 29AACDE1234F1Z5 • Computer-Generated Quotation",
            margin,
            288
        );
        doc.text(
            `Page ${p} of ${totalPages} • Strictly Confidential • For Authorized Dealer Use Only`,
            pageWidth - margin,
            288,
            { align: "right" }
        );
    }

    // Save and return
    const filename = `Quotation-${requestId}.pdf`;
    doc.save(filename);
}
