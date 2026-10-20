import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import RecentRequestsNotification from '../RecentRequestsNotification';

import "./Navbar.css";

type NavbarProps = {
  adminName?: string;
  role?: string;
  occupation?: string;
  variant?: "admin" | "dealer";
  dealerLocation?: string;
  dealerAvatar?: string;
  notificationsCount?: number;
  showRecentRequests?: boolean;
};

export default function Navbar({
  adminName,
  role,
  occupation,
  variant = "admin",
  dealerLocation = "Chennai, TN",
  dealerAvatar,
  showRecentRequests = false,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("loginState");
    navigate("/", { replace: true });
  };

  // Helper to determine role/occupation and user name dynamically
  const resolveProfile = () => {
    let resolvedRole = role || occupation || "";
    let resolvedName = adminName || "";

    const stored = localStorage.getItem("loginState");
    let storedState: { name?: string; role?: string } | null = null;
    if (stored) {
      try {
        storedState = JSON.parse(stored);
      } catch {
        // ignore parse error
      }
    }

    const pathname = location.pathname.toLowerCase();

    // 1. Resolve occupation / role
    if (!resolvedRole) {
      if (storedState?.role) {
        const r = storedState.role.toLowerCase();
        if (r === "salesmanager") resolvedRole = "Sales Manager";
        else if (r === "dealermanager") resolvedRole = "Dealer Manager";
        else if (r === "financehead" || r === "supervisor") resolvedRole = "Finance Head";
        else if (r === "manufacturer") resolvedRole = "Manufacturer";
        else if (r === "admin" || r === "administrator") resolvedRole = "Administrator";
        else if (r === "dealer") resolvedRole = "Dealer";
        else resolvedRole = storedState.role;
      }
    }

    if (!resolvedRole) {
      if (pathname.includes("salesmanager")) resolvedRole = "Sales Manager";
      else if (pathname.includes("dealermanager")) resolvedRole = "Dealer Manager";
      else if (pathname.includes("supervisor")) resolvedRole = "Finance Head";
      else if (pathname.includes("manufacturer")) resolvedRole = "Manufacturer";
      else if (pathname.includes("dealer")) resolvedRole = "Dealer";
      else resolvedRole = "Administrator";
    }

    // 2. Resolve display name
    const genericIdentifiers = [
      "",
      "admin",
      "administrator",
      "salesmanager",
      "sales manager",
      "sale manager",
      "dealermanager",
      "dealer manager",
      "financehead",
      "finance head",
      "supervisor",
      "manufacturer",
      "dealer",
      "demo dealer",
    ];

    if (!resolvedName || genericIdentifiers.includes(resolvedName.toLowerCase().trim())) {
      if (storedState?.name && !genericIdentifiers.includes(storedState.name.toLowerCase().trim())) {
        resolvedName = storedState.name;
      } else {
        // Default realistic person name for each occupation
        switch (resolvedRole) {
          case "Sales Manager":
            resolvedName = "Rajesh Kumar";
            break;
          case "Dealer Manager":
            resolvedName = "Karthik Raja";
            break;
          case "Finance Head":
            resolvedName = "Louis Bernard";
            break;
          case "Manufacturer":
            resolvedName = "Noah Wilson";
            break;
          case "Dealer":
            resolvedName = "Dinesh Kumar";
            break;
          default:
            resolvedName = "Amelia Martin";
            break;
        }
      }
    }

    return { name: resolvedName, occupation: resolvedRole };
  };

  const { name: displayName, occupation: displayOccupation } = resolveProfile();

  // Helper for 2-letter initials
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const avatarText = dealerAvatar || getInitials(displayName);

  return (
    <nav className={`navbar ${variant === "dealer" ? "dealer-navbar-style" : ""}`}>
      <div className="navbar-actions">
        {showRecentRequests && (
          <RecentRequestsNotification showLabel={true} customLabel="Recent Requests" />
        )}

        {/* User Profile Pill showing Name and Occupation below */}
        <div className="navbar-user-profile" title={`${displayName} (${displayOccupation})`}>
          <div className="navbar-user-avatar">{avatarText}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{displayName}</span>
            <span className="navbar-user-occupation">
              {displayOccupation}
              {displayOccupation === "Dealer" && dealerLocation ? ` • ${dealerLocation}` : ""}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogoutIcon />
        </button>
      </div>
    </nav>
  );
}
