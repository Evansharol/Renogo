import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Admindb from "./pages/AdminDashBoard/Dashboard";
import Usermg from "./pages/AdminDashBoard/UserManagement";
import Dealers from "./pages/AdminDashBoard/Dealers";
import VehicleCatalog from "./pages/AdminDashBoard/VehicleCatalog";
import DealerDetails from "./pages/AdminDashBoard/Dealers/DealersDetails";
import ApprovalProduction from "./pages/AdminDashBoard/Dealers/ApprovalProduction";
import DealerPortal from "./pages/Dealer";
import DashboardHome from "./pages/Dealer/DashBoard";
import DealerVehicleCatalog from "./pages/Dealer/VehicleCatalog";
import MyRequests from "./pages/Dealer/MyRequests";
import DealerProfile from "./pages/Dealer/Profile";
import ManufacturerDashboard from "./pages/Manufacturer/DashBoard";
import ManufacturerViewRequests from "./pages/Manufacturer/ViewRequests";
import ManufacturerStocks from "./pages/Manufacturer/Stocks";
import ViewRequests from "./pages/Supervisor/ViewRequests";
import SupervisorDashboard from "./pages/Supervisor/Dashboard";
import SalesManagerDashboard from "./pages/SalesManager/Dashboard";
import DealerManagerDashboard from "./pages/DealerManager/DashBoard";

function AnimatedRoutes() {
	const location = useLocation();

	return <div className="route-transition" key={`${location.pathname}${location.search}`}>
      <Routes location={location}>
        <Route path="/" element={<Login />} />
        <Route path="/admindb" element={<Admindb />} />
        <Route path="/usermg" element={<Usermg />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/vehiclecatalog" element={<VehicleCatalog />} />
        <Route path="/manufacturer/dashboard" element={<ManufacturerDashboard />} />
        <Route path="/manufacturer/view-requests" element={<ManufacturerViewRequests />} />
        <Route path="/manufacturer/stocks" element={<ManufacturerStocks />} />
        <Route path="/dealers/details/:dealerId" element={<DealerDetails />} />
        <Route path="/dealers/approval/:dealerId" element={<ApprovalProduction />} />
        <Route path="/dealer" element={<DealerPortal />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="catalog" element={<DealerVehicleCatalog />} />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="profile" element={<DealerProfile />} />
        </Route>
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor" element={<ViewRequests />} />
        <Route path="/salesmanager/dashboard" element={<SalesManagerDashboard />} />
        <Route path="/dealermanager/dashboard" element={<DealerManagerDashboard />} />
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
