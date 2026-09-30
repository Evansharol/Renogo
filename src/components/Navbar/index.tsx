import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

import "./Navbar.css";

type NavbarProps = {
  adminName: string;
};

export default function Navbar({ adminName }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-actions">
        <button
          type="button"
          className="notification-button"
          aria-label="View notifications"
        >
          <NotificationsIcon />
        </button>
        <span className="admin-name"> <AccountCircleIcon /> {adminName}

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
      </div>
    </nav>
  );
}
