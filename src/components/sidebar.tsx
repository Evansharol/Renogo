import HeaderLogo from "./header_logo";
import { NavLink } from "react-router-dom";

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
