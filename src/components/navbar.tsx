import notification from "../assets/notification.png";
import "./navbar.css";

type NavbarProps = {
  adminName: string;
};

export default function Navbar({ adminName }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-actions">
        <button
          type="button"
          className="notification-button"
          aria-label="View notifications"
        >
          <img src={notification} alt="" />
        </button>
        <span className="admin-name">{adminName}</span>
      </div>
    </nav>
  );
}
