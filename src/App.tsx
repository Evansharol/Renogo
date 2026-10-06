import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Admindb from "./pages/AdminDashBoard/Dashboard";
import Usermg from "./pages/AdminDashBoard/UserManagement";
import Dealers from "./pages/AdminDashBoard/Dealers";
import VehicleCatalog from "./pages/AdminDashBoard/VehicleCatalog";
import DealerDetails from "./pages/AdminDashBoard/Dealers/DealersDetails";
import RequestEvaluation from "./pages/AdminDashBoard/Dealers/RequestEvaluation";
import FinanceQuotation from "./pages/AdminDashBoard/Dealers/FinanceQuotation";
import ApprovalProduction from "./pages/AdminDashBoard/Dealers/ApprovalProduction";
import DealerDashboard from "./pages/Dealer";

function AnimatedRoutes() {
	const location = useLocation();

	return <div className="route-transition" key={`${location.pathname}${location.search}`}>
      <Routes location={location}>
        <Route path="/" element={<Login />} />
        <Route path="/admindb" element={<Admindb />} />
        <Route path="/usermg" element={<Usermg />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/vehiclecatalog" element={<VehicleCatalog />} />
        <Route path="/dealers/details/:dealerId" element={<DealerDetails />} />
        <Route path="/dealers/evaluation/:dealerId" element={<RequestEvaluation />} />
        <Route path="/dealers/finance/:dealerId" element={<FinanceQuotation />} />
        <Route path="/dealers/approval/:dealerId" element={<ApprovalProduction />} />
        <Route path="/dealer/DashBoard" element={<DealerDashboard initialTab="dashboard" />} />
        <Route path="/dealer/dashboard" element={<DealerDashboard initialTab="dashboard" />} />
        <Route path="/dealer/catalog" element={<DealerDashboard initialTab="catalog" />} />
        <Route path="/dealer/order-request" element={<DealerDashboard initialTab="order-request" />} />
        <Route path="/dealer/my-requests" element={<DealerDashboard initialTab="my-requests" />} />
        <Route path="/dealer/profile" element={<DealerDashboard initialTab="profile" />} />
      </Routes>
    </div>;
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
