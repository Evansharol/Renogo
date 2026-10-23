import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Order, WorkflowHistoryEntry, WorkflowStage } from "../../types/order";
import { getOrderDisplayNumber } from "../../utils/orderDisplay";

export type WorkflowTransition = {
	status: WorkflowStage;
	owner: NonNullable<Order["currentOwner"]>;
	remarks?: string;
};

export function applyWorkflowTransition(order: Order, transition: WorkflowTransition): Order {
	const timestamp = new Date().toISOString();
	const historyEntry: WorkflowHistoryEntry = {
		status: transition.status,
		timestamp,
		owner: transition.owner,
		remarks: transition.remarks,
	};

	return {
		...order,
		status: transition.status,
		currentOwner: transition.owner,
		workflowHistory: [...(order.workflowHistory ?? []), historyEntry],
		notifications: [
			...(order.notifications ?? []),
			{
				role: transition.owner,
				message: `${getOrderDisplayNumber(order)} is ready for ${transition.owner}`,
				createdAt: timestamp,
				read: false,
			},
		],
	};
}

export const ordersApi = createApi({
	reducerPath: "ordersApi",
	baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
	tagTypes: ["Order"],
	endpoints: (builder) => ({
		getOrders: builder.query<Order[], void>({
			query: () => "/orders",
			providesTags: (orders) => [
				{ type: "Order", id: "LIST" },
				...(orders ?? []).map(({ id }) => ({ type: "Order" as const, id })),
			],
		}),
		getDealerOrders: builder.query<Order[], string>({
			query: (dealerId) => `/orders?dealerId=${encodeURIComponent(dealerId)}`,
			providesTags: (orders, _error, dealerId) => [
				{ type: "Order", id: "LIST" },
				{ type: "Order", id: `DEALER-${dealerId}` },
				...(orders ?? []).map(({ id }) => ({ type: "Order" as const, id })),
			],
		}),
		createOrder: builder.mutation<Order, Omit<Order, "id"> | Order>({
			query: (order) => ({
				url: "/orders",
				method: "POST",
				body: order,
			}),
			invalidatesTags: [{ type: "Order", id: "LIST" }],
		}),
		updateOrder: builder.mutation<Order, Order>({
			query: (order) => ({
				url: `/orders/${encodeURIComponent(order.id)}`,
				method: "PUT",
				body: order,
			}),
			invalidatesTags: (order) => [
				{ type: "Order", id: "LIST" },
				...(order ? [{ type: "Order" as const, id: order.id }, { type: "Order" as const, id: `DEALER-${order.dealerId}` }] : []),
			],
		}),
	}),
});

export const {
	useGetOrdersQuery,
	useGetDealerOrdersQuery,
	useCreateOrderMutation,
	useUpdateOrderMutation,
} = ordersApi;
