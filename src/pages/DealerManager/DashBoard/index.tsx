import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "../../Dealer/Dealer.css";

export default function DealerManagerDashboard() {
    return (
        <div className="dealer-layout">
            <Sidebar variant="dealermanager" />
            <div className="dealer-content">
                <Navbar adminName="Dealer Manager" />
                <main className="dealer-main-scroll">
                    <div className="dealer-page-title-row">
                        <div>
                            <h1>Dealer Manager Dashboard</h1>
                            <p>Manage dealer requests and order approvals.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    ); 
}