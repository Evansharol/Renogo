import { useState } from "react";
import "../Form.css";

export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	password: string;
	phone?: string;
	department?: string;
	permissions?: string[];
	status: "Active" | "Inactive";
};

type UserFormProps = {
	onSave: (user: User) => void;
	onClose: () => void;
	user?: User;
};

type UserFormState = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	password: string;
	phone: string;
	department: string;
	permissions: string[];
	status: User["status"];
};

const getInitialForm = (user?: User): UserFormState => {
	const [firstName = "", ...lastNameParts] = user?.name.split(" ") ?? [];

	return {
		id: user?.id ?? "",
		firstName,
		lastName: lastNameParts.join(" "),
		email: user?.email ?? "",
		role: user?.role ?? "",
		password: user?.password ?? "",
		phone: user?.phone ?? "",
		department: user?.department ?? "",
		permissions: user?.permissions ?? [],
		status: user?.status ?? "Active",
	};
};

const permissionGroups = [
	{ title: "Administrator", items: ["View Fleet Requests", "Assign Orders to Teams", "Manage Users & Roles", "Manage Vehicle Data", "Monitor Order Progress"] },
	{ title: "Manufacturer", items: ["View Dealer Requests", "Check Vehicle Availability", "Allocate Orders for Production", "Send Allocated Orders to Supervisor"] },
	{ title: "Supervisor", items: ["View Allocated Orders", "Review Dealer Requests", "Prepare Pricing & Quotations", "Edit Bank Details", "Generate Quotation PDF", "Send Quotations to Sales Manager"] },
	{ title: "Dealer", items: ["Create Fleet Orders", "View & Edit Own Orders", "Submit & Track Orders", "Download Quotations & Invoices"] },
];

export default function Uform({ onSave, onClose, user }: UserFormProps) {
	const [form, setForm] = useState(() => getInitialForm(user));

	const updateField = (field: keyof UserFormState, value: string) => {
		setForm((currentForm) => ({ ...currentForm, [field]: value }));
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSave({
			id: form.id,
			name: `${form.firstName} ${form.lastName}`.trim(),
			email: form.email,
			role: form.role,
			password: form.password,
			phone: form.phone,
			department: form.department,
			permissions: form.permissions,
			status: form.status,
		});
	};

	const togglePermission = (permission: string) => {
		setForm((currentForm) => ({
			...currentForm,
			permissions: currentForm.permissions.includes(permission)
				? currentForm.permissions.filter((item) => item !== permission)
				: [...currentForm.permissions, permission],
		}));
	};

	return (
		<div className="user-drawer-overlay" role="presentation" onMouseDown={onClose}>
			<form className="user-drawer" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
				<header className="user-drawer-heading">
					<div><h2>{user ? "Edit User" : "Add User"}</h2><p>Set access and login details for this user.</p></div>
					<button type="button" aria-label="Close" onClick={onClose}>×</button>
				</header>

				<section className="user-drawer-section">
					<h3>Basic Information</h3>
					<div className="user-drawer-grid">
						<label>Full Name<input required value={`${form.firstName} ${form.lastName}`.trim()} placeholder="Enter full name" onChange={(event) => {
							const [firstName = "", ...lastNameParts] = event.target.value.split(" ");
							setForm((currentForm) => ({ ...currentForm, firstName, lastName: lastNameParts.join(" ") }));
						}} /></label>
						<label>Email Address<input required type="email" value={form.email} placeholder="name@company.com" onChange={(event) => updateField("email", event.target.value)} /></label>
						<label>Phone Number<input value={form.phone} placeholder="Enter phone number" onChange={(event) => updateField("phone", event.target.value)} /></label>
						<label>Initial Password<input required type="password" value={form.password} placeholder="Set initial password" onChange={(event) => updateField("password", event.target.value)} /></label>
					</div>
				</section>

				<section className="user-drawer-section">
					<h3>Role &amp; Department</h3>
					<div className="user-drawer-grid">
						<label>Role<select required value={form.role} onChange={(event) => updateField("role", event.target.value)}>
							<option value="">Select role</option>
							<option>Administrator</option>
							<option>Manufacturer</option>
							<option>Supervisor</option>
							<option>Dealer</option>
						</select></label>
						<label>Department<select value={form.department} onChange={(event) => updateField("department", event.target.value)}>
							<option value="">Select department</option>
							<option>Sales</option>
							<option>Finance</option>
							<option>Operations</option>
							<option>Administration</option>
						</select></label>
					</div>
				</section>

				<section className="user-drawer-section">
					<h3>Permissions <span>(Role Based Access Control)</span></h3>
					<div className="permission-note">Permissions are automatically assigned based on the selected role. You can customize them individually.</div>
					{permissionGroups.map((group) => <fieldset className="permission-group" key={group.title}>
						<legend className="permission-legend">
							<input type="checkbox" checked={group.items.every((permission) => form.permissions.includes(permission))} 
								onChange={(event) => { setForm((currentForm) => ({ ...currentForm, permissions: event.target.checked ? [...new Set([...currentForm.permissions, ...group.items])] : currentForm.permissions.filter((permission) => !group.items.includes(permission)) })); }}/>
							<span>{group.title}</span>
						</legend>
						{group.items.map((permission) => <label key={permission}><input type="checkbox" checked={form.permissions.includes(permission)} onChange={() => togglePermission(permission)} />{permission}</label>)}</fieldset>)}
				</section>
				{/*
				<section className="user-drawer-section user-status-section">
					<h3>Status</h3>
					<label className="status-toggle"><input type="checkbox" checked={form.status === "Active"} onChange={(event) => updateField("status", event.target.checked ? "Active" : "Inactive")} /><span />{form.status}</label>
				</section>
				*/}
				<footer className="user-drawer-actions"><button type="button" onClick={onClose}>Cancel</button><button className="form-save" type="submit">Save User</button></footer>
			</form>
		</div>
	);
}
