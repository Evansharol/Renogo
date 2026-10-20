import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import RecentRequestsNotification from '../RecentRequestsNotification';

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
}: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loginState");
    navigate("/", { replace: true });
  };

  return (
    <nav className={`navbar ${variant === "dealer" ? "dealer-navbar-style" : ""}`}>
      <div className="navbar-actions">
        <RecentRequestsNotification showLabel={true} customLabel="Recent Requests" />

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

