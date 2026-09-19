import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Admindb from "./pages/Admindb";
import Usermg from "./pages/usermg";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admindb" element={<Admindb />} />
        <Route path="/usermg" element={<Usermg />} />
      </Routes>
    </Router>
  );
}

export default App;
