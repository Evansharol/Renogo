import { FALLBACK_DM_REQUESTS, type DmRequest } from "../pages/DealerManager/types";
import { getOrders } from "./orders";

export { FALLBACK_DM_REQUESTS };

const API_URL = "/api";

export async function getDmRequests(): Promise<DmRequest[]> {
    try {
        const orders = await getOrders();
        const workflowRequests = orders
            .filter((order) => ["Approved by Sales Manager", "Awaiting Payment", "Payment Submitted", "Payment Verified", "Completed"].includes(order.status))
            .map((order): DmRequest => ({
                id: order.id,
                requestNumber: order.requestNumber,
                dealerId: order.dealerId,
                vehicleModel: order.vehicleModel,
                totalQuantity: order.quantity,
                quotationAmount: `₹ ${(order.estimatedTotal ?? 0).toLocaleString("en-IN")}`,
                status: order.status === "Approved by Sales Manager" ? "Awaiting Acknowledgement" : order.status === "Awaiting Payment" ? "Ready for Payment" : order.status as DmRequest["status"],
                paymentStatus: order.status === "Completed"
                    ? "Completed"
                    : ["Payment Submitted", "Payment Verified"].includes(order.status) ? "Submitted" : "Pending",
                orderDate: order.orderDate ?? new Date().toISOString(),
                items: order.items?.map((item, index) => ({ id: index + 1, model: item.model, variant: item.variant, qty: item.quantity, unitPrice: 0 })),
            }));
        if (workflowRequests.length > 0) return workflowRequests;
        const response = await fetch(`${API_URL}/dmRequests`);
        if (!response.ok) throw new Error("Failed to load dealer manager requests");
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            return data as DmRequest[];
        }
        return FALLBACK_DM_REQUESTS;
    } catch {
        return FALLBACK_DM_REQUESTS;
    }
}

export async function getDmRequestsByStatus(status: string): Promise<DmRequest[]> {
    try {
        const response = await fetch(`${API_URL}/dmRequests?status=${encodeURIComponent(status)}`);
        if (!response.ok) throw new Error("Failed to load dealer manager requests");
        return (await response.json()) as DmRequest[];
    } catch {
        return FALLBACK_DM_REQUESTS.filter((r) => r.status === status);
    }
}
