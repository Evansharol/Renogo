import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import HeaderLogo from "../Header";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

type SidebarProps = {
  variant?: "admin" | "dealer" | "manufacturer" | "supervisor" | "salesmanager" | "dealermanager";
}

export default function Sidebar({ variant = "admin" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Structural layout spacer to keep adjacent content positioned correctly */}
      <div
        className={`sidebar-layout-spacer ${isOpen ? "spacer-open" : "spacer-closed"}`}
        aria-hidden="true"
      />

      {/* Permanently fixed sidebar */}
      <aside
        className={`admin-sidebar ${variant !== "admin" ? "dealer-sidebar-theme" : ""} ${
          isOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
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

        <nav className="sidebar-navigation" aria-label={`${variant} sections`}>
          {variant === "dealer" ? (
            <>
              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? "active-dealer-tab" : ""}`}
                to="/dealer/dashboard"
                title="Dashboard"
              >
                <HomeOutlinedIcon />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? "active-dealer-tab" : ""}`}
                to="/dealer/catalog"
                title="Vehicle Catalog"
              >
                <DirectionsCarOutlinedIcon />
                <span>Vehicle Catalog</span>
              </NavLink>


              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? "active-dealer-tab" : ""}`}
                to="/dealer/my-requests"
                title="My Requests"
              >
                <AssignmentOutlinedIcon />
                <span>My Requests</span>
              </NavLink>

              <NavLink
                className={({ isActive }) => `sidebar-link ${isActive ? "active-dealer-tab" : ""}`}
                to="/dealer/profile"
                title="Profile"
              >
                <PersonOutlinedIcon />
                <span>Profile</span>
              </NavLink>
            </>
          ) : variant === "manufacturer" ? (
            <>
              <NavLink className="sidebar-link" to="/manufacturer/dashboard" title="Dashboard">
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
              <NavLink className="sidebar-link" to="/manufacturer/view-requests" title="View Requests">
                <AssignmentOutlinedIcon />
                <span>View Requests</span>
              </NavLink>
              <NavLink className="sidebar-link" to="/manufacturer/stocks" title="Stocks">
                <Inventory2OutlinedIcon />
                <span>Stocks</span>
              </NavLink>
            </>
          ) : variant === "supervisor" ? (
            <>
              <NavLink className="sidebar-link" to="/supervisor/dashboard" title="Dashboard">
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
              <NavLink end className="sidebar-link" to="/supervisor" title="View Requests">
                <AssignmentOutlinedIcon />
                <span>View Requests</span>
              </NavLink>
            </>
          ) : variant === "salesmanager" ? (
            <>
              <NavLink className="sidebar-link" to="/salesmanager/dashboard" title="Dashboard">
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
            </>
          ) : variant === "dealermanager" ? (
            <>
              <NavLink className="sidebar-link" to="/dealermanager/dashboard" title="Dashboard">
                <DashboardIcon />
                <span>Dashboard</span>
              </NavLink>
            </>
          ):(
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

        {variant !== "admin" && isOpen && (
          <div className="dealer-sidebar-footer">
            <div className="renault-yellow-accent" />
            <div className="renault-footer-title">RENAULT</div>
            <div className="renault-footer-tagline">DRIVE PROGRESS TOGETHER</div>
          </div>
        )}
      </aside>
    </>
  );
}
