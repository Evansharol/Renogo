import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AvailableModels from "../../../components/AvailableModels";
import Navbar from "../../../components/Navbar";
import RequestStatus from "../../../components/RequestStatus";
import Sidebar from "../../../components/Sidebar";
import { getDealers } from "../../../api/dealers";
import { useGetOrdersQuery } from "../../../features/orders/ordersApi";
import type { Dealer } from "../../../types/dealer";
import "./Dashboard.css";

type LoginState = {
    name?: string;
};

export default function Admindb() {
    const location = useLocation();
    const loginState = location.state as LoginState | null;
    const adminName = loginState?.name ?? "Amelia Martin";
    const { data: orders = [], isLoading: ordersLoading, isError: ordersError } = useGetOrdersQuery();
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [dealersLoading, setDealersLoading] = useState(true);
    const [dealersError, setDealersError] = useState("");

    useEffect(() => {
        let isMounted = true;
        getDealers()
            .then((loadedDealers) => {
                if (isMounted) setDealers(loadedDealers);
            })
            .catch((error: unknown) => {
                if (isMounted) {
                    setDealersError(error instanceof Error ? error.message : "Unable to load dealers.");
                }
            })
            .finally(() => {
                if (isMounted) setDealersLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const totalRevenue = useMemo(
        () => orders.reduce((total, order) => total + (order.estimatedTotal ?? 0), 0),
        [orders],
    );
    const isSummaryLoading = ordersLoading || dealersLoading;
    const summaryError = ordersError ? "Unable to load orders." : dealersError;

    return (
        <div className="admin-layout">
            <Sidebar />

            <div className="admin-content">
                <Navbar adminName={adminName} role="Administrator" />
                <main className="admin-main" id="dashboard">
                    <h1>Overview</h1>
                    {summaryError && <p role="alert">{summaryError}</p>}
                    <section className="summary-grid" aria-label="Dashboard summary">
                        <article className="summary-card">
                            <span className="summary-label">Total Orders</span>
                            <strong>{isSummaryLoading ? "..." : orders.length.toLocaleString("en-IN")}</strong>
                        </article>
                        <article className="summary-card">
                            <span className="summary-label">Total Dealers</span>
                            <strong>{dealersLoading ? "..." : dealers.length.toLocaleString("en-IN")}</strong>
                        </article>
                        <article className="summary-card">
                            <span className="summary-label">Total Revenue</span>
                            <strong>{ordersLoading ? "..." : `₹${totalRevenue.toLocaleString("en-IN")}`}</strong>
                        </article>
                    </section>

                    <section className="charts-grid" aria-label="Dashboard charts">
                        <RequestStatus />
                        <AvailableModels />
                    </section>
                </main>
            </div>
        </div>
    );
}