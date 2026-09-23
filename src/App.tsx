import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Admindb from "./pages/AdminDashBoard/Dashboard/Dashboard";
import Usermg from "./pages/AdminDashBoard/UserManagement/UserManagement";
import Dealers from "./pages/AdminDashBoard/Dealers/Dealers";
import DealerDetails from "./pages/AdminDashBoard/Dealers/DealersDetails/DealerDetails";
import RequestEvaluation from "./pages/AdminDashBoard/Dealers/RequestEvaluation/RequestEvaluation";
import FinanceQuotation from "./pages/AdminDashBoard/Dealers/FinanceQuotation/FinanceQuotation";
import ApprovalProduction from "./pages/AdminDashBoard/Dealers/ApprovalProduction/ApprovalProduction";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admindb" element={<Admindb />} />
        <Route path="/usermg" element={<Usermg />} />
        <Route path="/dealers" element={<Dealers />} />
        <Route path="/dealers/details/:dealerId" element={<DealerDetails />} />
        <Route path="/dealers/evaluation/:dealerId" element={<RequestEvaluation />} />
        <Route path="/dealers/finance/:dealerId" element={<FinanceQuotation />} />
        <Route path="/dealers/approval/:dealerId" element={<ApprovalProduction />} />
      </Routes>
    </Router>
  );
}

export default App;
