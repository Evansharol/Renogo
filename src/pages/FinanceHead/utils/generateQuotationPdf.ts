import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../../../assets/logo.png";
import type { Order } from "../../../types/order";
import type { Quotation } from "../../../types/quotation";

export type FinanceHeadVehicleStock = {
    name: string;
    variant: string;
    transmission: string;
    quantity: number;
};

export type FinanceHeadDealerDetails = {
    name: string;
    location?: string;
    address?: string;
};

type QuotationPdfInput = {
    order: Order;
    quotation: Quotation;
    dealer: FinanceHeadDealerDetails;
    manufacturerRequest?: {
        color: string;
        stockBreakdown: Record<string, number>;
    };
    vehicleStock: FinanceHeadVehicleStock[];
};

const pageWidth = 210;
const pageHeight = 297;
const margin = 14;
const contentWidth = pageWidth - margin * 2;
const navy: [number, number, number] = [15, 23, 42];
const blue: [number, number, number] = [37, 99, 235];
const slate: [number, number, number] = [71, 85, 105];
const lightBorder: [number, number, number] = [203, 213, 225];
type AutoTableDocument = jsPDF & { lastAutoTable: { finalY: number } };

const currency = (value: number) => `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
const displayDate = (value: string | undefined) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime())
        ? "21 Oct 2026"
        : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

async function loadLogoDataUrl(): Promise<string> {
    const response = await fetch(logoUrl);
    if (!response.ok) throw new Error("Unable to load the company logo for the quotation.");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Unable to prepare the company logo for the quotation."));
                return;
            }
            resolve(reader.result);
        };
        reader.onerror = () => reject(new Error("Unable to prepare the company logo for the quotation."));
        reader.readAsDataURL(blob);
    });
}

export async function generateFinanceHeadQuotationPdf(input: QuotationPdfInput): Promise<void> {
    const { order, quotation, dealer, manufacturerRequest, vehicleStock } = input;
    const logoDataUrl = await loadLogoDataUrl();
    const document = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const vehicleRows = vehicleStock
        .filter((vehicle) => vehicle.name.toLowerCase().includes(order.vehicleModel.replace(/^Renault\s+/i, "").toLowerCase()))
        .map((vehicle) => `${vehicle.variant} ${vehicle.transmission}`.trim());
    const availableStock = Math.min(
        manufacturerRequest?.stockBreakdown[manufacturerRequest.color] ?? vehicleStock
            .filter((vehicle) => vehicle.name.toLowerCase() === order.vehicleModel.toLowerCase())
            .reduce((total, vehicle) => total + vehicle.quantity, 0),
        order.quantity,
    );
    const manufacturingQuantity = Math.max(0, order.quantity - availableStock);
    const vehicleTotal = quotation.basePrice * quotation.quantity;
    const taxAmount = vehicleTotal * quotation.taxRate / 100;
    const total = vehicleTotal + taxAmount;
    const advance = total * quotation.depositRate / 100;

    document.setProperties({
        title: `Quotation ${quotation.id}`,
        subject: `Official quotation for ${dealer.name}`,
        author: "Renault India Private Limited",
    });

    const drawHeader = (pdf: jsPDF) => {
        pdf.setFillColor(...navy);
        pdf.rect(0, 0, pageWidth, 29, "F");
        pdf.addImage(logoDataUrl, "PNG", margin, 5, 17, 17);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        pdf.text("RENAULT INDIA PRIVATE LIMITED", margin + 22, 11);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(203, 213, 225);
        pdf.text("Commercial Fleet & Institutional Sales Division", margin + 22, 17);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(255, 255, 255);
        pdf.text("OFFICIAL QUOTATION", pageWidth - margin, 11, { align: "right" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(203, 213, 225);
        pdf.text("Computer-generated document", pageWidth - margin, 17, { align: "right" });
    };

    const drawFooter = (pdf: jsPDF) => {
        const page = pdf.getCurrentPageInfo().pageNumber;
        pdf.setDrawColor(...lightBorder);
        pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.setTextColor(...slate);
        pdf.text("Renault India Private Limited | GSTIN: 29AACDE1234F1Z5 | Confidential commercial document", margin, pageHeight - 8);
        pdf.text(`Page ${page}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    };

    const sectionTitle = (title: string, y: number) => {
        document.setFillColor(...blue);
        document.rect(margin, y, 3, 6, "F");
        document.setFont("helvetica", "bold");
        document.setFontSize(10);
        document.setTextColor(...navy);
        document.text(title, margin + 6, y + 4.5);
    };

    const tableDocument = document as AutoTableDocument;

    const infoTable = (startY: number, rows: string[][]) => {
        autoTable(document, {
            startY,
            body: rows,
            theme: "grid",
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            styles: { font: "helvetica", fontSize: 8, cellPadding: 3, textColor: slate, lineColor: lightBorder, lineWidth: 0.2 },
            columnStyles: { 0: { fontStyle: "bold", textColor: navy, cellWidth: 35 }, 2: { fontStyle: "bold", textColor: navy, cellWidth: 35 } },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        return tableDocument.lastAutoTable.finalY;
    };

    const tableEnd = () => tableDocument.lastAutoTable.finalY;

    drawHeader(document);
    sectionTitle("Quotation and dealer details", 37);
    let y = infoTable(42, [
        ["Quotation No.", quotation.id, "Issue Date", displayDate(order.orderDate)],
        ["Order ID", order.id, "Valid Until", displayDate(new Date(Date.now() + 30 * 86400000).toISOString())],
        ["Dealer", dealer.name, "Dealer ID", order.dealerId],
        ["Location", dealer.location ?? "India", "GSTIN", quotation.gstNumber],
        ["Address", dealer.address ?? "Authorised Renault dealer", "Status", quotation.status ?? "Quotation Generated"],
    ]);

    sectionTitle("Vehicle details and pricing", y + 8);
    y = y + 13;
    autoTable(document, {
        startY: y,
        head: [["#", "Vehicle / variant / description", "Qty", "Unit price", "Line total"]],
        body: [[
            "1",
            `${quotation.vehicleModel}\n${vehicleRows.join(", ") || "Fleet specification as per order"}\nColour: ${manufacturerRequest?.color ?? "As selected by dealer"}`,
            String(quotation.quantity),
            currency(quotation.basePrice),
            currency(vehicleTotal),
        ]],
        foot: [["", "Vehicle subtotal", "", "", currency(vehicleTotal)]],
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        headStyles: { fillColor: navy, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: slate, cellPadding: 4, lineColor: lightBorder },
        footStyles: { fillColor: [241, 245, 249], textColor: navy, fontStyle: "bold", fontSize: 8 },
        columnStyles: { 0: { cellWidth: 10, halign: "center" }, 1: { cellWidth: 83 }, 2: { cellWidth: 18, halign: "center" }, 3: { cellWidth: 36, halign: "right" }, 4: { cellWidth: 39, halign: "right" } },
    });
    y = tableEnd();

    sectionTitle("Stock and manufacturing summary", y + 8);
    y = infoTable(y + 13, [
        ["Requested quantity", `${order.quantity} units`, "Available stock", `${availableStock} units`],
        ["To manufacture", `${manufacturingQuantity} units`, "Stock coverage", `${order.quantity ? Math.round((availableStock / order.quantity) * 100) : 0}%`],
        ["Allocation colour", manufacturerRequest?.color ?? "As selected by dealer", "Order status", order.status],
    ]);

    if (y + 72 > pageHeight - 20) {
        document.addPage();
        drawHeader(document);
        y = 36;
    } else {
        y += 8;
    }

    sectionTitle("Financial summary", y);
    autoTable(document, {
        startY: y + 5,
        body: [
            ["Vehicle subtotal", currency(vehicleTotal)],
            [`GST (${quotation.taxRate}%)`, currency(taxAmount)],
            ["Total quotation amount", currency(total)],
            [`Advance payable (${quotation.depositRate}%)`, currency(advance)],
            ["Balance payable", currency(total - advance)],
        ],
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3.5, lineColor: lightBorder, lineWidth: 0.2 },
        columnStyles: { 0: { fontStyle: "bold", textColor: navy }, 1: { halign: "right", fontStyle: "bold", textColor: navy } },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
            if (data.row.index === 2 && data.section === "body") {
                data.cell.styles.fillColor = [219, 234, 254];
                data.cell.styles.fontSize = 10;
            }
        },
    });
    y = tableEnd();

    sectionTitle("Bank details and payment terms", y + 8);
    y = infoTable(y + 13, [
        ["Beneficiary", quotation.bankDetails?.beneficiaryName ?? "Not provided", "Payment terms", quotation.paymentTerms],
        ["Account number", quotation.bankDetails?.accountNumber ?? "Not provided", "Advance due", currency(advance)],
        ["IFSC code", quotation.bankDetails?.ifscCode ?? "Not provided", "Balance due", currency(total - advance)],
        ["Bank and branch", quotation.bankDetails?.bankBranch ?? "Not provided", "Currency", "Indian Rupees (INR)"],
    ]);

    if (y + 62 > pageHeight - 20) {
        document.addPage();
        drawHeader(document);
        y = 36;
    } else {
        y += 8;
    }

    sectionTitle("Terms and conditions", y);
    autoTable(document, {
        startY: y + 5,
        body: [
            ["1", "This quotation is valid for 30 days from the issue date and is subject to vehicle availability."],
            ["2", "Prices include the GST rate stated above. Registration, insurance, logistics and statutory charges are additional unless stated."],
            ["3", `Payment terms: ${quotation.paymentTerms}. Vehicle allocation and manufacturing slots are confirmed after receipt of the advance.`],
            ["4", "Delivery timelines are indicative and may vary due to production, logistics or regulatory conditions."],
            ["5", "This quotation is governed by the applicable commercial terms of Renault India Private Limited."],
        ],
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        styles: { font: "helvetica", fontSize: 7.5, cellPadding: 3, textColor: slate, lineColor: lightBorder, lineWidth: 0.2 },
        columnStyles: { 0: { cellWidth: 10, halign: "center", fontStyle: "bold", textColor: navy } },
    });
    y = tableEnd() + 9;

    sectionTitle("Approval", y);
    autoTable(document, {
        startY: y + 5,
        body: [
            ["Prepared by", "Finance Head", "Approval status", quotation.status ?? "Quotation Generated"],
            ["For", "Renault India Private Limited", "Date", displayDate(undefined)],
            ["Authorised signature", "____________________________", "Dealer acknowledgement", "____________________________"],
        ],
        theme: "grid",
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        styles: { font: "helvetica", fontSize: 8, cellPadding: 4, textColor: slate, lineColor: lightBorder, lineWidth: 0.2 },
        columnStyles: { 0: { fontStyle: "bold", textColor: navy }, 2: { fontStyle: "bold", textColor: navy } },
    });

    for (let page = 1; page <= document.getNumberOfPages(); page += 1) {
        document.setPage(page);
        drawFooter(document);
    }
    document.save(`Quotation-${quotation.id}.pdf`);
}
