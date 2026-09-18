import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import "./Admindb.css";

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
                        <article className="chart-card request-chart-card">
                            <div className="chart-heading">
                                <div>
                                    <h2>Request Status</h2>
                                    <p>Current request progress</p>
                                </div>
                                <span className="chart-period">This month</span>
                            </div>

                            <div className="request-bars">
                                <div className="request-bar-row">
                                    <div className="request-bar-label">
                                        <span>Completed</span>
                                        <strong>68%</strong>
                                    </div>
                                    <div className="request-bar-track">
                                        <span className="request-bar completed-bar" />
                                    </div>
                                </div>
                                <div className="request-bar-row">
                                    <div className="request-bar-label">
                                        <span>Ongoing</span>
                                        <strong>21%</strong>
                                    </div>
                                    <div className="request-bar-track">
                                        <span className="request-bar ongoing-bar" />
                                    </div>
                                </div>
                                <div className="request-bar-row">
                                    <div className="request-bar-label">
                                        <span>Pending</span>
                                        <strong>11%</strong>
                                    </div>
                                    <div className="request-bar-track">
                                        <span className="request-bar pending-bar" />
                                    </div>
                                </div>
                            </div>
                        </article>

                        <article className="chart-card model-chart-card">
                            <div className="chart-heading">
                                <div>
                                    <h2>Available Models</h2>
                                    <p>Renault inventory by model</p>
                                </div>
                            </div>

                            <div className="model-chart-content">
                                <div className="model-pie" aria-label="Renault model availability pie chart" />
                                <div className="model-legend">
                                    <span><i className="legend-dot captur-dot" />Captur <strong>32%</strong></span>
                                    <span><i className="legend-dot clio-dot" />Clio <strong>27%</strong></span>
                                    <span><i className="legend-dot austral-dot" />Austral <strong>23%</strong></span>
                                    <span><i className="legend-dot arkana-dot" />Arkana <strong>18%</strong></span>
                                </div>
                            </div>
                        </article>
                    </section>
                </main>
            </div>
        </div>
    );
}