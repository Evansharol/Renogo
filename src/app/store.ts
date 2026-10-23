import { configureStore } from "@reduxjs/toolkit";
import { ordersApi } from "../features/orders/ordersApi";

export const store = configureStore({
	reducer: {
		[ordersApi.reducerPath]: ordersApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(ordersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
