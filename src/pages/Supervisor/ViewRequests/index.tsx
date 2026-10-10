import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { getOrders } from "../../../api/orders";
import { getQuotationByOrderId } from "../../../api/quotations";
import type { Order } from "../../../types/order";
import type { Quotation } from "../../../types/quotation";
import ReviewQuotation, { type VehicleStock } from "./Review&Quotation";
import "./ViewRequests.css";

type LoginState = { name?: string };
type ManufacturerRequest = {
    orderId: string;
    model: string;
    color: string;
    quantity: number;
    stockBreakdown: Record<string, number>;
    manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};
type ManufacturerDashboard = { dealerRequests: ManufacturerRequest[] };

export default function ViewRequests() {
    const location = useLocation();
    const supervisorName = (location.state as LoginState | null)?.name ?? "Supervisor";
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [manufacturerRequests, setManufacturerRequests] = useState<ManufacturerRequest[]>([]);
    const [vehicleStock, setVehicleStock] = useState<VehicleStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            getOrders(),
            fetch("/api/manufacturer-dashboard.json").then((response) => {
                if (!response.ok) throw new Error("Unable to load manufacturer allocations.");
                return response.json() as Promise<ManufacturerDashboard>;
            }),
            fetch("/api/vehicle.json").then((response) => {
                if (!response.ok) throw new Error("Unable to load vehicle stock.");
                return response.json() as Promise<VehicleStock[]>;
            }),
        ])
            .then(([loadedOrders, manufacturerDashboard, loadedVehicleStock]) => {
                const allocatedOrderIds = new Set(
                    manufacturerDashboard.dealerRequests
                        .filter((request) => request.manufacturerStatus !== "Not Allocated")
                        .map((request) => request.orderId),
                );
                setManufacturerRequests(manufacturerDashboard.dealerRequests);
                setOrders(loadedOrders.filter((order) => allocatedOrderIds.has(order.id)));
                setVehicleStock(loadedVehicleStock);
            })
            .catch(() => setError("Unable to load dealer requests."))
            .finally(() => setLoading(false));
    }, []);

    const openRequest = async (order: Order) => {
        setSelectedOrder(order);
        setQuotation(null);
        try {
            setQuotation(await getQuotationByOrderId(order.id));
        } catch {
            setQuotation(null);
        }
    };

    return (
        <div className="supervisor-layout">
            <Sidebar variant="supervisor" />
            <div className="supervisor-content">
                <Navbar adminName={supervisorName} />
                <main className="supervisor-main">
                    <div className="supervisor-title">
                        <h1>View Requests</h1>
                        <p>Review dealer orders and provide quotations.</p>
                    </div>
                    {loading && <p>Loading requests...</p>}
                    {error && <p className="supervisor-error" role="alert">{error}</p>}
                    {!loading && !error && (
                        <div className="supervisor-table-wrapper">
                            <table className="supervisor-table">
                                <thead>
                                    <tr>
                                        <th>Dealer ID</th>
                                        <th>Order ID</th>
                                        <th>Vehicle Model</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                        <th>Review &amp; Quotation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.dealerId}</td>
                                            <td><strong>{order.id}</strong></td>
                                            <td>{order.vehicleModel}</td>
                                            <td>{order.quantity}</td>
                                            <td><span className={`supervisor-status supervisor-status--${order.status.toLowerCase().replace(/\s+/g, "-")}`}>{order.status}</span></td>
                                            <td><button type="button" className="supervisor-action-button" onClick={() => openRequest(order)}>Review &amp; Quotation</button></td>
                                        </tr>
                                    ))}
                                    {!orders.length && <tr><td colSpan={6} className="supervisor-empty">No dealer requests found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
            {selectedOrder && (
                <ReviewQuotation
                    order={selectedOrder}
                    quotation={quotation}
                    manufacturerRequest={manufacturerRequests.find((request) => request.orderId === selectedOrder.id)}
                    vehicleStock={vehicleStock}
                    onQuotationChange={setQuotation}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
