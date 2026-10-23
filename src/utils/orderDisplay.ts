import type { Order } from "../types/order";

type OrderReference = Pick<Order, "id" | "dealerId" | "orderDate" | "requestNumber">;

export function getOrderDisplayNumber(order: OrderReference): string {
	const requestNumber = order.requestNumber?.trim();
	if (requestNumber) return requestNumber;

	if (/^(REQ|ORD)-[A-Z0-9-]+$/i.test(order.id)) return order.id;

	if (order.orderDate) {
		const date = new Date(order.orderDate);
		if (!Number.isNaN(date.getTime())) {
			const isoDate = date.toISOString();
			const datePart = isoDate.slice(0, 10).replace(/-/g, "");
			const timePart = isoDate.slice(11, 19).replace(/:/g, "");
			const milliseconds = isoDate.slice(20, 23);
			return `REQ-${order.dealerId}-${datePart}-${timePart}-${milliseconds}`;
		}
	}

	return `REQ-${order.dealerId}`;
}
