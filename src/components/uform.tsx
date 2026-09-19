import { useState } from "react";

export type User = {
	id: string;
	name: string;
	email: string;
	role: string;
	status: "Active" | "Inactive";
};

type UserFormProps = {
	onSave: (user: User) => void;
	onClose: () => void;
};

type UserFormState = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	status: User["status"];
};

const initialForm: UserFormState = {
	id: "",
	firstName: "",
	lastName: "",
	email: "",
	role: "",
	status: "Active",
};

export default function Uform({ onSave, onClose }: UserFormProps) {
	const [form, setForm] = useState(initialForm);

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
			status: form.status,
		});
	};

	return (
		<div className="user-form-overlay" role="presentation" onMouseDown={onClose}>
			<form className="user-form" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
				<div className="user-form-heading">
					<div><h2>Add User</h2><p>Enter the new user&apos;s details.</p></div>
					<button className="user-form-close" type="button" aria-label="Close form" onClick={onClose}>×</button>
				</div>
				<div className="user-form-fields">
					<label>User ID<input required value={form.id} placeholder="Enter user ID" onChange={(event) => updateField("id", event.target.value)} /></label>
					<label>First Name<input required value={form.firstName} placeholder="Enter first name" onChange={(event) => updateField("firstName", event.target.value)} /></label>
					<label>Last Name<input required value={form.lastName} placeholder="Enter last name" onChange={(event) => updateField("lastName", event.target.value)} /></label>
					<label>Email<input required type="email" value={form.email} placeholder="Enter email" onChange={(event) => updateField("email", event.target.value)} /></label>
					<label>Role<input required value={form.role} placeholder="Enter role" onChange={(event) => updateField("role", event.target.value)} /></label>
					<label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
				</div>
				<div className="user-form-actions"><button type="button" onClick={onClose}>Cancel</button><button className="user-form-save" type="submit">Save</button></div>
			</form>
		</div>
	);
}
