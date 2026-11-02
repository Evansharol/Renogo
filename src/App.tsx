import { useEffect } from "react";
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { clearLegacyUserCache, getAuthToken, getLoginState } from "./auth/auth";
import { ordersApi } from "./features/orders/ordersApi";
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
import FinanceHeadDashboard from "./pages/FinanceHead/Dashboard";
import SalesManagerDashboard from "./pages/SalesManager/Dashboard";
import SalesManagerVerificationApproval from "./pages/SalesManager/Verification&Approval";
import DealerManagerDashboard from "./pages/DealerManager/DashBoard";
import ApprovalRequests from "./pages/DealerManager/Approvals";

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(ordersApi.util.resetApiState());
      navigate("/", { replace: true });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch, navigate]);

  return <div className="route-transition" key={`${location.pathname}${location.search}`}>
    <Routes location={location}>
      <Route path="/" element={<Login />} />
      <Route element={<RequireAuth />}>
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
        <Route path="/financehead/dashboard" element={<FinanceHeadDashboard />} />
        <Route path="/salesmanager/dashboard" element={<SalesManagerDashboard />} />
        <Route path="/salesmanager/verification-approval" element={<SalesManagerVerificationApproval />} />
        <Route path="/dealermanager/dashboard" element={<DealerManagerDashboard />} />
        <Route path="/dealermanager/requests" element={<ApprovalRequests />} />
      </Route>
    </Routes>
  </div>;
}

function RequireAuth() {
	const location = useLocation();
	if (!getAuthToken() || !getLoginState()) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}
	return <Outlet />;
}

function App() {
  useEffect(() => {
    clearLegacyUserCache();
  }, []);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
