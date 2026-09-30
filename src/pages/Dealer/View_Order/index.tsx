import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";

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
							<h1>View Orders</h1>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
