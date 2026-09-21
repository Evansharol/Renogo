import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Admindb from "./pages/Admindb";
import Usermg from "./pages/usermg";
import Dealers from "./pages/dealers";
import DealerDetails from "./components/DealerDetails";
import RequestEvaluation from "./components/RequestEvaluation";
import FinanceQuotation from "./components/FinanceQuotation";
import ApprovalProduction from "./components/ApprovalProduction";

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
