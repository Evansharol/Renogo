import HeaderLogo from "../Logo/Logo";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <HeaderLogo />
      <nav className="sidebar-navigation" aria-label="Admin sections">
        <NavLink className="sidebar-link" to="/admindb">
          Dashboard 
        </NavLink>
        <NavLink className="sidebar-link" to="/usermg">
          User Management
        </NavLink>
        <NavLink className="sidebar-link" to="/dealers">
          Dealers
        </NavLink>
      </nav>
    </aside>
  );
}
