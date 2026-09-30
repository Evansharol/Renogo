import { useState } from "react";
import Form, { type FormField } from "..";

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
	user?: User;
};

type UserFormState = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
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
		status: user?.status ?? "Active",
	};
};

const userFields: FormField[] = [
	{ name: "firstName", label: "First Name", placeholder: "Enter first name", required: true },
	{ name: "lastName", label: "Last Name", placeholder: "Enter last name", required: true },
	{ name: "email", label: "Email", type: "email", placeholder: "Enter email", required: true },
	{ name: "role", label: "Role", placeholder: "Enter role", required: true },
	{ name: "status", label: "Status", options: ["Active", "Inactive"] },
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
			status: form.status,
		});
	};

	return <Form title={user ? "Edit User" : "Add User"} subtitle={user ? "Update the user's details." : "Enter the new user's details."} fields={[
		{ name: "id", label: "User ID", placeholder: "Enter user ID", required: true },
		...userFields,
	]} values={form} onChange={(field, value) => {
		if (field in form) updateField(field as keyof UserFormState, value);
	}} onSubmit={handleSubmit} onClose={onClose} />;
}
