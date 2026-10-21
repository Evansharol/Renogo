import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { getOrders } from "../../../api/orders";
import { getQuotationByOrderId } from "../../../api/quotations";
import type { Order } from "../../../types/order";
import type { Quotation } from "../../../types/quotation";
import ReviewQuotation, { type VehicleStock } from "./ReviewQuotation";
import "./Dashboard.css";

type LoginState = { name?: string };
type Filter = "all" | "pending" | "approved" | "rejected";
type SortKey = "id" | "dealerId" | "vehicleModel" | "quantity" | "status" | "orderDate";
type ManufacturerRequest = {
    orderId: string;
    model: string;
    color: string;
    quantity: number;
    stockBreakdown: Record<string, number>;
    manufacturerStatus: "Fully Allocated" | "Partially Allocated" | "Not Allocated";
};
type ManufacturerDashboard = { dealerRequests: ManufacturerRequest[] };

const isPending = (status: string) => ["pending", "pending approval", "pending finance approval", "pending finance quotation"].includes(status.toLowerCase());
const isApproved = (status: string) => status.toLowerCase() === "approved";
const isRejected = (status: string) => /reject|decline/.test(status.toLowerCase());

export default function FinanceheadDashboard() {
    const location = useLocation();
    const financeheadName = (location.state as LoginState | null)?.name ?? "Louis Bernard";
    const [orders, setOrders] = useState<Order[]>([]);
    const [manufacturerRequests, setManufacturerRequests] = useState<ManufacturerRequest[]>([]);
    const [vehicleStock, setVehicleStock] = useState<VehicleStock[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("orderDate");
    const [sortAscending, setSortAscending] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const pageSize = 10;

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
                setOrders(loadedOrders.filter((order) => allocatedOrderIds.has(order.id) || ["pending finance approval", "pending finance quotation"].includes(order.status.toLowerCase())));
                setVehicleStock(loadedVehicleStock);
            })
            .catch(() => setError("Unable to load finance head dashboard."))
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter((order) => isPending(order.status)).length,
        approved: orders.filter((order) => isApproved(order.status)).length,
        rejected: orders.filter((order) => isRejected(order.status)).length,
    }), [orders]);

    const filteredOrders = useMemo(() => {
        const query = search.trim().toLowerCase();
        const result = orders.filter((order) => {
            const matchesFilter =
                filter === "all" ||
                (filter === "pending" && isPending(order.status)) ||
                (filter === "approved" && isApproved(order.status)) ||
                (filter === "rejected" && isRejected(order.status));
            const matchesSearch = !query || [order.id, order.dealerId, order.vehicleModel, order.status]
                .some((value) => value.toLowerCase().includes(query));
            return matchesFilter && matchesSearch;
        });

        return result.sort((first, second) => {
            const firstValue = sortKey === "quantity" ? first.quantity : sortKey === "orderDate" ? new Date(first.orderDate ?? 0).getTime() : first[sortKey];
            const secondValue = sortKey === "quantity" ? second.quantity : sortKey === "orderDate" ? new Date(second.orderDate ?? 0).getTime() : second[sortKey];
            const comparison = typeof firstValue === "number" && typeof secondValue === "number"
                ? firstValue - secondValue
                : String(firstValue).localeCompare(String(secondValue));
            return sortAscending ? comparison : -comparison;
        });
    }, [filter, orders, search, sortAscending, sortKey]);

    const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

    const selectFilter = (nextFilter: Filter) => {
        setFilter(nextFilter);
        setPage(1);
    };

    const sortBy = (nextKey: SortKey) => {
        if (sortKey === nextKey) {
            setSortAscending((current) => !current);
        } else {
            setSortKey(nextKey);
            setSortAscending(true);
        }
    };

    const openRequest = async (order: Order) => {
        setSelectedOrder(order);
        setQuotation(null);
        try {
            setQuotation(await getQuotationByOrderId(order.id));
        } catch {
            setQuotation(null);
        }
    };

    const cards: Array<{ filter: Filter; count: number; label: string; description: string; className: string; icon: ReactNode }> = [
        { filter: "all", count: stats.total, label: "Total Requests", description: "All allocated requests", className: "financehead-dashboard-card--orange", icon: <FormatListBulletedOutlinedIcon /> },
        { filter: "pending", count: stats.pending, label: "Pending Requests", description: "Awaiting review", className: "financehead-dashboard-card--orange", icon: <AccessTimeOutlinedIcon /> },
        { filter: "approved", count: stats.approved, label: "Approved Requests", description: "Ready for quotation", className: "financehead-dashboard-card--green", icon: <CheckCircleOutlinedIcon /> },
        { filter: "rejected", count: stats.rejected, label: "Rejected Requests", description: "Declined requests", className: "financehead-dashboard-card--red", icon: <CancelOutlinedIcon /> },
    ];

    return (
        <div className="financehead-layout">
            <Sidebar variant="financehead" />
            <div className="financehead-content">
                <Navbar adminName={financeheadName} role="Finance Head" />
                <main className="financehead-main financehead-dashboard-main">
                    <div className="financehead-title">
                        <h1>Welcome, {financeheadName} !!</h1>
                        <p>Monitor allocated dealer requests and quotation progress.</p>
                    </div>
                    {loading && <p>Loading dashboard...</p>}
                    {error && <p className="financehead-error" role="alert">{error}</p>}
                    {!loading && !error && (
                        <>
                            <section className="financehead-dashboard-grid" aria-label="Request summary">
                                {cards.map((card) => (
                                    <button
                                        type="button"
                                        key={card.filter}
                                        className={`financehead-dashboard-card ${card.className} ${filter === card.filter ? "financehead-dashboard-card--selected" : ""}`}
                                        onClick={() => selectFilter(card.filter)}
                                        aria-pressed={filter === card.filter}
                                    >
                                        <div className="financehead-dashboard-icon">{card.icon}</div>
                                        <div><strong>{card.count}</strong><span>{card.label}</span><small>{card.description}</small></div>
                                    </button>
                                ))}
                            </section>
                            <section className="financehead-request-section" aria-labelledby="financehead-request-title">
                                <header className="financehead-request-header">
                                    <div>
                                        <h2 id="financehead-request-title">Dealer Requests</h2>
                                        <p>{filter === "all" ? "All allocated dealer requests." : `Showing ${filter} requests.`}</p>
                                    </div>
                                    <input
                                        type="search"
                                        className="financehead-request-search"
                                        placeholder="Search requests"
                                        aria-label="Search requests"
                                        value={search}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </header>
                                <div className="financehead-table-wrapper">
                                    <table className="financehead-table">
                                        <thead>
                                            <tr>
                                                {([
                                                    ["dealerId", "Dealer ID"],
                                                    ["id", "Order ID"],
                                                    ["vehicleModel", "Vehicle Model"],
                                                    ["quantity", "Quantity"],
                                                    ["status", "Status"],
                                                ] as Array<[SortKey, string]>).map(([key, label]) => (
                                                    <th key={key}><button type="button" className="financehead-sort-button" onClick={() => sortBy(key)}>{label}{sortKey === key ? (sortAscending ? " ↑" : " ↓") : ""}</button></th>
                                                ))}
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleOrders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>{order.dealerId}</td>
                                                    <td><strong>{order.requestNumber ?? order.id}</strong></td>
                                                    <td>{order.vehicleModel}</td>
                                                    <td>{order.quantity}</td>
                                                    <td><span className={`financehead-status financehead-status--${order.status.toLowerCase().replace(/\s+/g, "-")}`}>{order.status}</span></td>
                                                    <td><button type="button" className="financehead-action-button" onClick={() => openRequest(order)}>Manage</button></td>
                                                </tr>
                                            ))}
                                            {!visibleOrders.length && <tr><td colSpan={6} className="financehead-empty">No matching requests found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                                <footer className="financehead-pagination">
                                    <span>Showing {visibleOrders.length ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length}</span>
                                    <div>
                                        <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
                                        <span>Page {page} of {pageCount}</span>
                                        <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button>
                                    </div>
                                </footer>
                            </section>
                        </>
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
                    onOrderStatusChange={(updatedOrder) => {
                        setOrders((current) => current.map((candidate) => candidate.id === updatedOrder.id ? updatedOrder : candidate));
                        setSelectedOrder(updatedOrder);
                    }}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
