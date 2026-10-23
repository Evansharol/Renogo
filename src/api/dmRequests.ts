import type { DmRequest } from "../pages/DealerManager/types";
import type { Order } from "../types/order";
import { getOrderDisplayNumber } from "../utils/orderDisplay";

const ORDER_TO_DM_STATUS: Partial<Record<string, DmRequest["status"]>> = {
    "Approved by Sales Manager": "Awaiting Acknowledgement",
    "Awaiting Payment": "Ready for Payment",
    "Payment Submitted": "Payment Submitted",
    "Payment Verified": "Payment Verified",
    Completed: "Completed",
};

export function ordersToDmRequests(orders: Order[]): DmRequest[] {
    return orders
        .flatMap((order) => {
            const dmStatus = ORDER_TO_DM_STATUS[order.status];
            if (!dmStatus) return [];

            return [{
                id: order.id,
                requestNumber: getOrderDisplayNumber(order),
                dealerId: order.dealerId,
                vehicleModel: order.vehicleModel,
                totalQuantity: order.quantity,
                quotationAmount: `₹ ${(order.estimatedTotal ?? 0).toLocaleString("en-IN")}`,
                status: dmStatus,
                orderStatus: order.status,
                paymentStatus: order.status === "Completed"
                    ? "Completed"
                    : ["Payment Submitted", "Payment Verified"].includes(order.status) ? "Submitted" : "Pending",
                orderDate: order.orderDate ?? new Date().toISOString(),
                items: order.items?.map((item, index) => ({ id: index + 1, model: item.model, variant: item.variant, qty: item.quantity, unitPrice: 0 })),
            }];
        });
}
