import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { getOrders } from "../../../api/orders";
import { getQuotationByOrderId } from "../../../api/quotations";
import type { Order } from "../../../types/order";
import type { Quotation } from "../../../types/quotation";
import SalesManagerReviewModal from "./SalesManagerReviewModal";
import "./SalesManagerReviewModal/SalesManagerReviewModal.css";

type LoginState = { name?: string };
type Allocation = {
    orderId: string;
    dealerName?: string;
    color?: string;
    stockBreakdown?: Record<string, number>;
    manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};
type AllocationResponse = { dealerRequests: Allocation[] };

export default function SalesManagerDashboard() {
    const location = useLocation();
    const salesManagerName = (location.state as LoginState | null)?.name ?? "Sales Manager";
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
    const [reviewQuotation, setReviewQuotation] = useState<Quotation | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            getOrders(),
            fetch("/api/manufacturer-dashboard.json").then((response) => {
                if (!response.ok) throw new Error("Unable to load manufacturer allocations.");
                return response.json() as Promise<AllocationResponse>;
            }),
        ])
            .then(([loadedOrders, allocationData]) => {
                const allocatedOrderIds = new Set(
                    allocationData.dealerRequests
                        .filter((request) => request.manufacturerStatus !== "Not Allocated")
                        .map((request) => request.orderId),
                );
                setAllocations(allocationData.dealerRequests);
                setOrders(loadedOrders.filter((order) => allocatedOrderIds.has(order.id)));
            })
            .catch(() => setError("Unable to load sales manager dashboard."))
            .finally(() => setLoading(false));
    }, []);

    const openReview = async (order: Order) => {
        setReviewOrder(order);
        setReviewQuotation(null);
        setReviewLoading(true);
        try {
            setReviewQuotation(await getQuotationByOrderId(order.id));
        } catch {
            setReviewQuotation(null);
        } finally {
            setReviewLoading(false);
        }
    };

    const closeReview = () => {
        setReviewOrder(null);
        setReviewQuotation(null);
    };

    const completeReview = (status: string) => {
        if (!reviewOrder) return;
        setOrders((current) => current.map((order) => order.id === reviewOrder.id ? { ...order, status } : order));
        closeReview();
    };

    const stats = useMemo(() => ({
        pending: orders.filter((order) => ["Pending", "Pending Approval"].includes(order.status)).length,
        approved: orders.filter((order) => order.status === "Approved").length,
        confirmed: orders.filter((order) => ["In Production", "Completed"].includes(order.status)).length,
    }), [orders]);

    const recentOrders = useMemo(() => [...orders]
        .sort((first, second) => new Date(second.orderDate ?? 0).getTime() - new Date(first.orderDate ?? 0).getTime())
        .slice(0, 5), [orders]);

    return (
        <div className="supervisor-layout">
            <Sidebar variant="salesmanager" />
            <div className="supervisor-content">
                <Navbar adminName={salesManagerName} />
                <main className="supervisor-main supervisor-dashboard-main">
                    <div className="supervisor-title">
                        <div>
                            <h1>Welcome, {salesManagerName}!</h1>
                            <p>Review requests and stock availability.</p>
                        </div>
                    </div>
                    {loading && <p>Loading dashboard...</p>}
                    {error && <p className="supervisor-error" role="alert">{error}</p>}
                    {!loading && !error && (
                        <>
                            <section className="supervisor-dashboard-grid" aria-label="Request summary">
                                <article className="supervisor-dashboard-card supervisor-dashboard-card--orange">
                                    <div className="supervisor-dashboard-icon"><AccessTimeOutlinedIcon /></div>
                                    <div><strong>{stats.pending}</strong><span>Pending Approval</span><small>Awaiting manager review</small></div>
                                </article>
                                <article className="supervisor-dashboard-card supervisor-dashboard-card--green">
                                    <div className="supervisor-dashboard-icon"><CheckCircleOutlinedIcon /></div>
                                    <div><strong>{stats.approved}</strong><span>Approved</span><small>Ready for Processing</small></div>
                                </article>
                                <article className="supervisor-dashboard-card supervisor-dashboard-card--blue">
                                    <div className="supervisor-dashboard-icon"><DirectionsCarOutlinedIcon /></div>
                                    <div><strong>{stats.confirmed}</strong><span>Order Confirmed</span><small>In production or completed</small></div>
                                </article>
                            </section>
                            <section className="supervisor-recent-card" aria-labelledby="recent-requests-title">
                                <header className="supervisor-recent-header">
                                    <div><h2 id="recent-requests-title">Recent Requests</h2><p>Latest orders allocated by the manufacturer.</p></div>
                                </header>
                                <div className="supervisor-recent-table-wrapper">
                                    <table className="supervisor-recent-table">
                                        <thead><tr><th>Order ID</th><th>Dealer ID</th><th>Vehicle Model</th><th>Quantity</th><th>Status</th><th /></tr></thead>
                                        <tbody>
                                            {recentOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td><strong>{order.id}</strong></td>
                                                    <td>{order.dealerId}</td>
                                                    <td>{order.vehicleModel}</td>
                                                    <td>{order.quantity}</td>
                                                    <td><span className={`supervisor-status supervisor-status--${order.status.toLowerCase().replace(/\s+/g, "-")}`}>{order.status}</span></td>
                                                    <td><button type="button" className="supervisor-review-link" onClick={() => void openReview(order)}>Verify</button></td>
                                                </tr>
                                            ))}
                                            {!recentOrders.length && <tr><td colSpan={6} className="supervisor-empty">No allocated requests found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}
                </main>
            </div>
            {reviewOrder && !reviewLoading && (
                <SalesManagerReviewModal
                    order={reviewOrder}
                    allocation={allocations.find((allocation) => allocation.orderId === reviewOrder.id)}
                    quotation={reviewQuotation}
                    onClose={closeReview}
                    onAction={completeReview}
                />
            )}
        </div>
    );
}
