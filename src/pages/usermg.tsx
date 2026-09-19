import { useState } from "react"; // store data
import { useLocation } from "react-router-dom"; // get data from previous page
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Uform, { type User } from "../components/uform";
import "./Admindb.css";
import "./Usermg.css";

type LoginState = { name?: string };

const initialUsers: User[] = [
	{ id: "USR-1001", name: "Amelia Martin", email: "amelia.martin@renogo.com", role: "Administrator", status: "Active" },
	{ id: "USR-1002", name: "Louis Bernard", email: "louis.bernard@renogo.com", role: "Manager", status: "Active" },
	{ id: "USR-1003", name: "Sofia Garcia", email: "sofia.garcia@renogo.com", role: "Dealer", status: "Inactive" },
	{ id: "USR-1004", name: "Noah Wilson", email: "noah.wilson@renogo.com", role: "Support", status: "Active" },
];

export default function Usermg() {
	const [users, setUsers] = useState(initialUsers);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRole, setSelectedRole] = useState("All Roles");
	const [isUserFormOpen, setIsUserFormOpen] = useState(false);
	const location = useLocation();
	const loginState = location.state as LoginState | null;
	const adminName = loginState?.name ?? "Admin";
	const roles = [...new Set(users.map((user) => user.role).filter(Boolean))];

	const handleSaveUser = (user: User) => {
		setUsers((currentUsers) => [...currentUsers, user]);
		setIsUserFormOpen(false);
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch = user.id.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = selectedRole === "All Roles" || user.role === selectedRole;
		return matchesSearch && matchesRole;
	});

	return (
		<div className="admin-layout">
			<Sidebar />
			<div className="admin-content">
				<Navbar adminName={adminName} />
				<main className="admin-main user-management-main" id="user-management">
					<div className="page-heading">
						<div><h1>User Management</h1><p>Manage people who can log in to the system.</p></div>
						<button className="add-user-button" type="button" onClick={() => setIsUserFormOpen(true)}>+ Add User</button>
					</div>
					<section className="user-summary-grid" aria-label="User summary">
						<article className="user-summary-card"><span>👥 Total Users</span><strong>24</strong></article>
						<article className="user-summary-card"><span>✅ Active Users</span><strong>21</strong></article>
						<article className="user-summary-card"><span>❌ Inactive Users</span><strong>3</strong></article>
						<article className="user-summary-card"><span>🔑 Roles Assigned</span><strong>4</strong></article>
					</section>
					<section className="users-table-card" aria-label="Users table">
						<div className="table-toolbar">
							<label htmlFor="user-search">Search By User ID</label>
							<input id="user-search" type="search" placeholder="Enter user ID" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
							<label htmlFor="role-filter">Filter By Role</label>
							<select id="role-filter" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
								<option value="All Roles">All Roles</option>
								{roles.map((role) => <option key={role} value={role}>{role}</option>)}
							</select>
						</div>
						<div className="table-scroll-wrapper">
							<table>
								<thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
								<tbody>{filteredUsers.map((user) => (
									<tr key={user.id}>
										<td><a href={`#${user.id}`}>{user.id}</a></td><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td>
										<td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
										<td><div className="user-actions">
											<button type="button" aria-label={`Edit ${user.name}`} title="Edit">✎</button>
											<button type="button" aria-label={`Delete ${user.name}`} title="Delete">⌫</button>
										</div></td>
									</tr>
								))}</tbody>
							</table>
						</div>
					</section>
				</main>
				{isUserFormOpen && <Uform onSave={handleSaveUser} onClose={() => setIsUserFormOpen(false)} />}
			</div>
		</div>
	);
}
