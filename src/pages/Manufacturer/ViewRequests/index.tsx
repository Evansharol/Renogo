import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import DealerRequestTable from "../../../components/DealerRequestTable";
import type { DealerRequest } from "../../../components/DealerRequestTable";
import { getOrders } from "../../../api/orders";
import type { Order } from "../../../types/order";
import "../../Dealer/Dealer.css";

type DashboardRequestsResponse = {
  dealerRequests: DealerRequest[];
};

const DEFAULT_STOCK_BY_MODEL: Record<string, number> = {
  "Renault Kiger": 10,
  "Renault Triber": 10,
  "Renault Duster": 8,
  "Renault Kwid": 12,
};

const orderToRequest = (order: Order): DealerRequest => ({
  requestId: order.id,
  requestNumber: order.requestNumber,
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
  const [requests, setRequests] = useState<DealerRequest[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/manufacturer-dashboard.json").then((response) => {
        if (!response.ok) throw new Error(`Unable to load dealer requests (${response.status})`);
        return response.json() as Promise<DashboardRequestsResponse>;
      }),
      getOrders(),
    ])
      .then(([data, orders]) => setRequests([
        ...orders.filter((order) => order.status === "Pending Manufacturer Review").map(orderToRequest),
        ...data.dealerRequests.filter((request) => !orders.some((order) => order.id === request.requestId)),
      ]))
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load dealer requests");
      });
  }, []);

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
          {error ? <p role="alert">{error}</p> : <DealerRequestTable requests={requests} />}
        </main>
      </div>
    </div>
  );
}
