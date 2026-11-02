import { useEffect, useState } from "react"; // store data
import { useLocation } from "react-router-dom"; // get data from previous page
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { getLoginState } from "../../../auth/auth";
import GroupIcon from '@mui/icons-material/Group';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ClearIcon from '@mui/icons-material/Clear';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Uform, { type User } from "../../../components/Form/Admin_UserForm";
import { getUsers, createUser, updateUser, deleteUser } from "../../../api/users";
import "./UserManagement.css";

type LoginState = { name?: string };

export default function Usermg() {
	const [users, setUsers] = useState<User[]>([]);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("user-search") ?? "");
	const [selectedRole, setSelectedRole] = useState("All Roles");
	const [isUserFormOpen, setIsUserFormOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const location = useLocation();
	const loginState = location.state as LoginState | null;
	const adminName = loginState?.name ?? getLoginState()?.name ?? "User";
	const roles = [...new Set(users.map((user) => user.role).filter(Boolean))];
	const activeUsers = users.filter((user) => user.status === "Active").length;
	const inactiveUsers = users.length - activeUsers;

	useEffect(() => {
		getUsers()
			.then((apiUsers) => {
				setUsers(apiUsers);
				setError("");
			})
			.catch((error: unknown) => {
				setError(error instanceof Error ? error.message : "Unable to load users");
			});
	}, []);

	const handleSaveUser = async (user: User) => {
		const userToSave: User = {
			...user,
			id: user.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
		};

		try {
			const savedUser = editingUser
				? await updateUser(userToSave)
				: await createUser(userToSave);

			setUsers((currentUsers) =>
				editingUser
					? currentUsers.map((currentUser) =>
							currentUser.id === editingUser.id ? savedUser : currentUser
						)
					: [...currentUsers, savedUser]
			);

			setError("");
			setEditingUser(null);
			setIsUserFormOpen(false);
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "Unable to save user");
		}
	};

	const handleEditUser = (user: User) => {
		setEditingUser(user);
		setIsUserFormOpen(true);
	};

	const handleDeleteUser = async (user: User) => {
		if (!window.confirm(`Delete ${user.name}?`)) return;

		try {
			await deleteUser(user.id);
			setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
			setError("");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "Unable to delete user");
		}
	};

	const filteredUsers = users.filter((user) => {
		const matchesSearch = String(user.id ?? "")
			.toLowerCase()
			.includes(searchTerm.toLowerCase());

		const matchesRole =
			selectedRole === "All Roles" || user.role === selectedRole;

		return matchesSearch && matchesRole;
	});

	return ( // This is JSX everything inside this is displayed on the screen.
		<div className="admin-layout">
			<Sidebar />
			<div className="admin-content">
				<Navbar adminName={adminName} role="Administrator" />
				<main className="admin-main user-management-main" id="user-management">
					<div className="page-heading">
						<div><h1>User Management</h1><p>Manage people who can log in to the system.</p></div>
						<button className="add-user-button" type="button" onClick={() => { setEditingUser(null); setIsUserFormOpen(true); }}>+ Add User</button>
					</div>
					{error && <p role="alert">{error}</p>}
					<section className="user-summary-grid" aria-label="User summary">
						<article className="user-summary-card"><span> <GroupIcon /> Total Users</span><strong>{users.length}</strong></article>
						<article className="user-summary-card"><span> <HowToRegIcon /> Active Users</span><strong>{activeUsers}</strong></article>
						<article className="user-summary-card"><span> <ClearIcon /> Inactive Users</span><strong>{inactiveUsers}</strong></article>
						<article className="user-summary-card"><span> <ManageAccountsIcon /> Roles Assigned</span><strong>{roles.length}</strong></article>
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
								<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
								<tbody>{filteredUsers.map((user) => (
									<tr key={user.id}>
										<td>{user.name}</td><td>{user.email}</td><td>{user.role}</td>
										<td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
										<td><div className="user-actions">
												<button type="button" aria-label={`Edit ${user.name}`} title="Edit" onClick={() => handleEditUser(user)}> <EditIcon /> </button>
												<button type="button" aria-label={`Delete ${user.name}`} title="Delete" onClick={() => handleDeleteUser(user)}> <DeleteIcon /></button>
										</div></td>
									</tr>
								))}</tbody>
							</table>
						</div>
					</section>
				</main>
				{isUserFormOpen && <Uform user={editingUser ?? undefined} onSave={handleSaveUser} onClose={() => { setEditingUser(null); setIsUserFormOpen(false); }} />}
			</div>
		</div>
	);
}
