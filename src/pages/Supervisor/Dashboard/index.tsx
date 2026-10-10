import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { getOrders } from "../../../api/orders";
import type { Order } from "../../../types/order";
import "./Dashboard.css";

type LoginState = { name?: string };
type Allocation = { orderId: string; manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated" };
type AllocationResponse = { dealerRequests: Allocation[] };

export default function SupervisorDashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const supervisorName = (location.state as LoginState | null)?.name ?? "Supervisor";
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                setOrders(loadedOrders.filter((order) => allocatedOrderIds.has(order.id)));
            })
            .catch(() => setError("Unable to load supervisor dashboard."))
            .finally(() => setLoading(false));
    }, []);

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
            <Sidebar variant="supervisor" />
            <div className="supervisor-content">
                <Navbar adminName={supervisorName} />
                <main className="supervisor-main supervisor-dashboard-main">
                    <div className="supervisor-title">
                        <div>
                            <h1>Welcome, {supervisorName} !!</h1>
                            <p>Monitor allocated dealer requests and quotation progress.</p>
                        </div>
                    </div>
                    {loading && <p>Loading dashboard...</p>}
                    {error && <p className="supervisor-error" role="alert">{error}</p>}
                    {!loading && !error && (
                        <>
                            <section className="supervisor-dashboard-grid" aria-label="Request summary">
                                <article className="supervisor-dashboard-card supervisor-dashboard-card--orange">
                                    <div className="supervisor-dashboard-icon"><AccessTimeOutlinedIcon /></div>
                                    <div><strong>{stats.pending}</strong><span>Pending Requests</span><small>Awaiting supervisor review</small></div>
                                </article>
                                <article className="supervisor-dashboard-card supervisor-dashboard-card--green">
                                    <div className="supervisor-dashboard-icon"><CheckCircleOutlinedIcon /></div>
                                    <div><strong>{stats.approved}</strong><span>Approved</span><small>Ready for quotation</small></div>
                                </article>
                                <article className="supervisor-dashboard-card supervisor-dashboard-card--blue">
                                    <div className="supervisor-dashboard-icon"><DirectionsCarOutlinedIcon /></div>
                                    <div><strong>{stats.confirmed}</strong><span>Order Confirmed</span><small>In production or completed</small></div>
                                </article>
                            </section>
                            <section className="supervisor-recent-card" aria-labelledby="recent-requests-title">
                                <header className="supervisor-recent-header">
                                    <div><h2 id="recent-requests-title">Recent Requests</h2><p>Latest orders allocated by the manufacturer.</p></div>
                                    <button type="button" className="supervisor-view-all" onClick={() => navigate("/supervisor")}>View All</button>
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
                                                    <td><button type="button" className="supervisor-review-link" onClick={() => navigate("/supervisor")}>Review</button></td>
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
        </div>
    );
}
