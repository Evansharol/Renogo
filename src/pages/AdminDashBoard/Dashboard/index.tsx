import { useLocation } from "react-router-dom";
import AvailableModels from "../../../components/AvailableModels";
import Navbar from "../../../components/Navbar";
import RequestStatus from "../../../components/RequestStatus";
import Sidebar from "../../../components/Sidebar";
import "./Dashboard.css";

type LoginState = {
    name?: string;
};

export default function Admindb() {
    const location = useLocation();
    const loginState = location.state as LoginState | null;
    const adminName = loginState?.name ?? "Admin";

    return (
        <div className="admin-layout">
            <Sidebar />

            <div className="admin-content">
                <Navbar adminName={adminName} />
                <main className="admin-main" id="dashboard">
                    <h1>Overview</h1>
                    <section className="summary-grid" aria-label="Dashboard summary">
                        <article className="summary-card">
                            <span className="summary-label">Total Orders</span>
                            <strong>1,248</strong>
                        </article>
                        <article className="summary-card">
                            <span className="summary-label">Total Dealers</span>
                            <strong>86</strong>
                        </article>
                        <article className="summary-card">
                            <span className="summary-label">Total Revenue</span>
                            <strong>$48,920</strong>
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