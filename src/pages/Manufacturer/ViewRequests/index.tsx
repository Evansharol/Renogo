import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import DealerRequestTable from "../../../components/DealerRequestTable";
import type { DealerRequest } from "../../../components/DealerRequestTable";
import type { Order } from "../../../types/order";
import { useGetOrdersQuery } from "../../../features/orders/ordersApi";
import { getOrderDisplayNumber } from "../../../utils/orderDisplay";
import "../../Dealer/Dealer.css";

const DEFAULT_STOCK_BY_MODEL: Record<string, number> = {
  "Renault Kiger": 10,
  "Renault Triber": 10,
  "Renault Duster": 8,
  "Renault Kwid": 12,
};

const orderToRequest = (order: Order): DealerRequest => ({
  requestId: order.id,
  requestNumber: getOrderDisplayNumber(order),
  dealerId: order.dealerId,
  dealerName: order.dealerId,
  model: order.items?.map((item) => item.model).join(", ") ?? order.vehicleModel,
  color: order.items?.map((item) => item.color ?? "Any").join(", ") ?? "Any",
  quantity: order.quantity,
  items: order.items,
  requestDate: order.orderDate ?? new Date().toISOString(),
  stockBreakdown: Object.fromEntries((order.items ?? []).map((item) => [
    item.color ?? "Any",
    DEFAULT_STOCK_BY_MODEL[item.model] ?? 5,
  ])) || { Any: 5 },
  priority: "Medium",
  stockStatus: "low",
  manufacturerStatus: "Not Allocated",
});

export default function ManufacturerViewRequests() {
  const [searchParams] = useSearchParams();
  const targetRequestId = searchParams.get("requestId") ?? undefined;
  const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useGetOrdersQuery();

  const requests = useMemo(
    () => orders.filter((order) => order.status === "Pending Manufacturer Review").map(orderToRequest),
    [orders],
  );
  return (
    <div className="dealer-layout">
      <Sidebar variant="manufacturer" />
      <div className="dealer-content">
        <Navbar role="Manufacturer" />
        <main className="dealer-main-scroll">
          <div className="dealer-page-title-row">
            <div>
              <h1>View Requests</h1>
              <p>Review and allocate dealer fleet requests.</p>
            </div>
          </div>
          {ordersError && <p role="alert">Unable to load orders.</p>}
          {ordersLoading && <p>Loading requests...</p>}
          {!ordersLoading && !ordersError && <DealerRequestTable requests={requests} targetRequestId={targetRequestId} />}
        </main>
      </div>
    </div>
  );
}
