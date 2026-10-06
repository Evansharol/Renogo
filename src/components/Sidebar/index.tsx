import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HeaderLogo from "../Header";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

type SidebarProps = {
  variant?: "admin" | "dealer";
};

export default function Sidebar({ variant = "admin" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside className={`admin-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="sidebar-header">
        <HeaderLogo />
        {isOpen && (
          <button
            className="sidebar-close-toggle"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {!isOpen && (
        <button
          className="sidebar-expand-toggle"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <KeyboardDoubleArrowRightIcon />
        </button>
      )}

      <nav className="sidebar-navigation" aria-label={variant === "dealer" ? "Dealer sections" : "Admin sections"}>
        {variant === "dealer" ? (
          <>
          <NavLink className="sidebar-link" to="/dealer/DashBoard" title="Dashboard">
            <DashboardIcon />
            <span>DashBoard</span>
          </NavLink>
          </>
        ) : (
          <>
            <NavLink className="sidebar-link" to="/admindb" title="Dashboard">
              <DashboardIcon />
              <span>Dashboard</span>
            </NavLink>
            <NavLink className="sidebar-link" to="/usermg" title="User Management">
              <GroupIcon />
              <span>User Management</span>
            </NavLink>
            <NavLink className="sidebar-link" to="/dealers" title="Dealers">
              <DirectionsCarIcon />
              <span>Dealer Management</span>
            </NavLink>
            <NavLink className="sidebar-link" to="/vehiclecatalog" title="Vehicle Catalog">
              <ShoppingCartIcon />
              <span>Vehicle Catalog</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
