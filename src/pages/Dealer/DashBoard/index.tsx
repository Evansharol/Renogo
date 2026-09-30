import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Sidebar from "../../../components/Sidebar";
import "./DealerDashboard.css";

type LoginState = { name?: string };

export default function ViewOrder() {
	const location = useLocation();
	const loginState = location.state as LoginState | null;

	return (
		<div className="admin-layout">
			<Sidebar variant="dealer" />
			<div className="admin-content">
				<Navbar adminName={loginState?.name ?? "Dealer"} />
				<main className="admin-main">
					<div className="page-heading">
						<div>
							<h1>Dashboard</h1>
						</div>
					</div>

					<section className="summary-grid" aria-label="Dashboard summary">
                        <article className="summary-card">
                            <span className="summary-label"><ShoppingCartIcon /> Total Orders</span>
                            <strong>5</strong>
                        </article>
                        <article className="summary-card">
                            <span className="summary-label"><PendingActionsIcon /> Pending Orders</span>
                            <strong>3</strong>
                        </article>
						<article className="summary-card">
							<span className="summary-label"><LocalShippingIcon /> Delivered Orders</span>
                            <strong>2</strong>
                        </article>
                    </section>
				</main>
			</div>
		</div>
	);
}
