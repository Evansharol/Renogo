import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { clearAuthSession, getLoginState } from "../../auth/auth";
import { ordersApi } from "../../features/orders/ordersApi";
import RecentRequestsNotification from "../RecentRequestsNotification";

import "./Navbar.css";

type NavbarProps = {
  adminName?: string;
  role?: string;
  dealerLocation?: string;
  showRecentRequests?: boolean;
};

export default function Navbar({ adminName, role: roleProp }: NavbarProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loginState = getLoginState();

  const name = adminName || loginState?.name || "User";
  const role = roleProp || loginState?.role || "User";

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");

    if (parts.length >= 2) {
      return (
        parts[0][0] + parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return fullName.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    clearAuthSession();
    dispatch(ordersApi.util.resetApiState());
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-actions">
        <RecentRequestsNotification role={role} dealerId={loginState?.dealerId} />
        <div className="navbar-user-profile">
          <div className="navbar-user-avatar">
            {getInitials(name)}
          </div>

          <div className="navbar-user-info">
            <span className="navbar-user-name">
              {name}
            </span>

            <span className="navbar-user-occupation">
              {role}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>
      </div>
    </nav>
  );
}
