import HeaderLogo from "./header_logo";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <HeaderLogo />
      <nav className="sidebar-navigation" aria-label="Admin sections">
        <a className="sidebar-link active" href="#dashboard">
          Dashboard
        </a>
        <a className="sidebar-link" href="#user-management">
          User Management
        </a>
        <a className="sidebar-link" href="#request-finance">
          Request &amp; Finance
        </a>
        <a className="sidebar-link" href="#approval">
          Approval
        </a>
      </nav>
    </aside>
  );
}
