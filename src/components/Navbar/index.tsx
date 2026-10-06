import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';

import "./Navbar.css";

type NavbarProps = {
  adminName: string;
  variant?: "admin" | "dealer";
  dealerLocation?: string;
  dealerAvatar?: string;
  notificationsCount?: number;
};

export default function Navbar({
  adminName,
  variant = "admin",
  dealerLocation = "Chennai, TN",
  dealerAvatar = "DK",
  notificationsCount = 3,
}: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loginState");
    navigate("/", { replace: true });
  };

  return (
    <nav className={`navbar ${variant === "dealer" ? "dealer-navbar-style" : ""}`}>
      <div className="navbar-actions">
        <button
          type="button"
          className="notification-button"
          aria-label="View notifications"
        >
          <NotificationsNoneIcon />
          {notificationsCount > 0 && (
            <span className="notification-badge" aria-label={`${notificationsCount} unread notifications`}>
              {notificationsCount}
            </span>
          )}
        </button>

        {variant === "dealer" ? (
          <div className="dealer-profile-pill">
            <div className="dealer-avatar">{dealerAvatar}</div>
            <div className="dealer-user-info">
              <span className="dealer-name-text">{adminName}</span>
              <span className="dealer-location-text">{dealerLocation}</span>
            </div>
            <button
              type="button"
              className="dealer-dropdown-trigger"
              onClick={handleLogout}
              title="Click to logout"
              aria-label="Dealer menu options and logout"
            >
              <KeyboardArrowDownIcon />
            </button>
          </div>
        ) : (
          <>
            <span className="admin-name">
              <AccountCircleIcon /> {adminName}
            </span>
            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

