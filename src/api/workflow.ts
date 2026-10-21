import { getOrders, updateOrder } from "./orders";
import type { Order, WorkflowHistoryEntry, WorkflowStage } from "../types/order";

export type WorkflowTransition = {
	status: WorkflowStage;
	owner: NonNullable<Order["currentOwner"]>;
	remarks?: string;
};

export async function transitionOrder(order: Order, transition: WorkflowTransition): Promise<Order> {
	const timestamp = new Date().toISOString();
	const historyEntry: WorkflowHistoryEntry = {
		status: transition.status,
		timestamp,
		owner: transition.owner,
		remarks: transition.remarks,
	};
	const nextOrder: Order = {
		...order,
		status: transition.status,
		currentOwner: transition.owner,
		workflowHistory: [...(order.workflowHistory ?? []), historyEntry],
		notifications: [
			...(order.notifications ?? []),
			{
				role: transition.owner,
				message: `${order.requestNumber ?? order.id} is ready for ${transition.owner}`,
				createdAt: timestamp,
				read: false,
			},
		],
	};
	return updateOrder(nextOrder);
}

export async function getWorkflowOrders(): Promise<Order[]> {
	return getOrders();
}
