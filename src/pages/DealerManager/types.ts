// ─── DealerManager Central Domain Types ──────────────────────────────────────────

export type DmRequest = {
    id: string; // Order ID (e.g. ORD-1001)
    dealerId: string;
    dealerName?: string;
    vehicleModel: string;
    totalQuantity: number;
    quotationAmount: string;
    status: "Awaiting Acknowledgement" | "Ready for Payment" | "Payment Submitted" | "Payment Verified" | "Completed";
    paymentStatus: "Pending" | "Submitted" | "Completed";
    orderDate: string;
};

export type DmNotification = {
    id: string;
    message: string;
    time: string;
    type: "success" | "info" | "warning" | "purple";
};

export type DmKpiData = {
    totalRequests: number;
    awaitingAcknowledgement: number;
    paymentPending: number;
    paymentCompleted: number;
    ordersConfirmed: number;
    weeklyChange: {
        totalRequests: number;
        awaitingAcknowledgement: number;
        paymentPending: number;
        paymentCompleted: number;
        ordersConfirmed: number;
    };
};

export type ChartDataPoint = {
    date: string;
    totalRequests: number;
    approvedBySalesManager: number;
    awaitingAcknowledgement: number;
    paymentPending: number;
    paymentCompleted: number;
    orderConfirmed: number;
};

// ─── Fallback mock data ──────────────────────────────────────────────
export const FALLBACK_DM_REQUESTS: DmRequest[] = [
    {
        id: "ORD-1001",
        dealerId: "D001",
        dealerName: "ABC Motors",
        vehicleModel: "Renault Duster",
        totalQuantity: 50,
        quotationAmount: "₹ 7,08,00,000",
        status: "Awaiting Acknowledgement",
        paymentStatus: "Pending",
        orderDate: "2026-09-12T00:00:00.000Z",
    },
    {
        id: "ORD-1002",
        dealerId: "D001",
        dealerName: "ABC Motors",
        vehicleModel: "Renault Kiger",
        totalQuantity: 50,
        quotationAmount: "₹ 5,60,50,000",
        status: "Ready for Payment",
        paymentStatus: "Pending",
        orderDate: "2026-09-20T00:00:00.000Z",
    },
    {
        id: "ORD-2003",
        dealerId: "D002",
        dealerName: "Royal Autos",
        vehicleModel: "Renault Kwid",
        totalQuantity: 15,
        quotationAmount: "₹ 81,39,000",
        status: "Payment Submitted",
        paymentStatus: "Submitted",
        orderDate: "2026-09-14T00:00:00.000Z",
    },
    {
        id: "ORD-3001",
        dealerId: "D003",
        dealerName: "Chennai Cars",
        vehicleModel: "Renault Triber",
        totalQuantity: 40,
        quotationAmount: "₹ 3,54,00,000",
        status: "Payment Verified",
        paymentStatus: "Completed",
        orderDate: "2026-09-02T00:00:00.000Z",
    },
    {
        id: "ORD-4001",
        dealerId: "hD7-wIuowCY",
        dealerName: "Dealer HD7",
        vehicleModel: "Renault Duster",
        totalQuantity: 12,
        quotationAmount: "₹ 1,69,92,000",
        status: "Completed",
        paymentStatus: "Completed",
        orderDate: "2026-09-10T00:00:00.000Z",
    },
];

export const DM_REQUESTS = FALLBACK_DM_REQUESTS;

// ─── Static mock data for KPIs and Chart only (orders come from backend/db.json) ──

export const DM_NOTIFICATIONS: DmNotification[] = [
    {
        id: "N001",
        message: "Request ORD-1001 approved by Sales Manager",
        time: "12 Sep 2026 • 10:45 AM",
        type: "success",
    },
    {
        id: "N002",
        message: "New quotation received for ORD-1002",
        time: "20 Sep 2026 • 09:30 AM",
        type: "info",
    },
    {
        id: "N003",
        message: "Payment pending for ORD-2003",
        time: "14 Sep 2026 • 11:15 AM",
        type: "warning",
    },
    {
        id: "N004",
        message: "Request ORD-3001 payment verified",
        time: "02 Sep 2026 • 03:30 PM",
        type: "purple",
    },
    {
        id: "N005",
        message: "Order ORD-4001 completed",
        time: "10 Sep 2026 • 01:25 PM",
        type: "success",
    },
];

export const DM_KPI: DmKpiData = {
    totalRequests: 5,
    awaitingAcknowledgement: 1,
    paymentPending: 2,
    paymentCompleted: 1,
    ordersConfirmed: 1,
    weeklyChange: {
        totalRequests: 2,
        awaitingAcknowledgement: 1,
        paymentPending: 1,
        paymentCompleted: 1,
        ordersConfirmed: 0,
    },
};

export const CHART_DATA: ChartDataPoint[] = [
    { date: "2 Sep", totalRequests: 1, approvedBySalesManager: 1, awaitingAcknowledgement: 0, paymentPending: 0, paymentCompleted: 0, orderConfirmed: 0 },
    { date: "5 Sep", totalRequests: 1, approvedBySalesManager: 1, awaitingAcknowledgement: 0, paymentPending: 1, paymentCompleted: 0, orderConfirmed: 0 },
    { date: "10 Sep", totalRequests: 2, approvedBySalesManager: 2, awaitingAcknowledgement: 1, paymentPending: 1, paymentCompleted: 1, orderConfirmed: 1 },
    { date: "12 Sep", totalRequests: 3, approvedBySalesManager: 2, awaitingAcknowledgement: 1, paymentPending: 1, paymentCompleted: 1, orderConfirmed: 1 },
    { date: "14 Sep", totalRequests: 4, approvedBySalesManager: 3, awaitingAcknowledgement: 1, paymentPending: 2, paymentCompleted: 1, orderConfirmed: 1 },
    { date: "18 Sep", totalRequests: 4, approvedBySalesManager: 3, awaitingAcknowledgement: 1, paymentPending: 2, paymentCompleted: 1, orderConfirmed: 1 },
    { date: "20 Sep", totalRequests: 5, approvedBySalesManager: 4, awaitingAcknowledgement: 1, paymentPending: 2, paymentCompleted: 1, orderConfirmed: 1 },
];
