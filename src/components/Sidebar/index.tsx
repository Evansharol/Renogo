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
import HeaderLogo from "../Header";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

type SidebarProps = {
  variant?: "admin" | "dealer";
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
};

export default function Sidebar({ variant = "admin", activeTab, onTabSelect }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleDealerNav = (tab: string, e: React.MouseEvent) => {
    if (onTabSelect) {
      e.preventDefault();
      onTabSelect(tab);
    }
  };

  return (
    <>
      {/* Structural layout spacer to keep adjacent content positioned correctly */}
      <div
        className={`sidebar-layout-spacer ${isOpen ? "spacer-open" : "spacer-closed"}`}
        aria-hidden="true"
      />

      {/* Permanently fixed sidebar */}
      <aside
        className={`admin-sidebar ${variant === "dealer" ? "dealer-sidebar-theme" : ""} ${
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

        <nav className="sidebar-navigation" aria-label={variant === "dealer" ? "Dealer sections" : "Admin sections"}>
          {variant === "dealer" ? (
            <>
              <NavLink
                className={`sidebar-link ${activeTab === "dashboard" ? "active-dealer-tab" : ""}`}
                to="/dealer/DashBoard"
                title="Dashboard"
                onClick={(e) => handleDealerNav("dashboard", e)}
              >
                <HomeOutlinedIcon />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                className={`sidebar-link ${activeTab === "catalog" ? "active-dealer-tab" : ""}`}
                to="/dealer/catalog"
                title="Vehicle Catalog"
                onClick={(e) => handleDealerNav("catalog", e)}
              >
                <DirectionsCarOutlinedIcon />
                <span>Vehicle Catalog</span>
              </NavLink>


              <NavLink
                className={`sidebar-link ${activeTab === "my-requests" ? "active-dealer-tab" : ""}`}
                to="/dealer/my-requests"
                title="My Requests"
                onClick={(e) => handleDealerNav("my-requests", e)}
              >
                <AssignmentOutlinedIcon />
                <span>My Requests</span>
              </NavLink>

              <NavLink
                className={`sidebar-link ${activeTab === "profile" ? "active-dealer-tab" : ""}`}
                to="/dealer/profile"
                title="Profile"
                onClick={(e) => handleDealerNav("profile", e)}
              >
                <PersonOutlinedIcon />
                <span>Profile</span>
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

        {variant === "dealer" && isOpen && (
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
