import { useState } from "react";
import Form, { type FormField } from "../Form";
import type { NewDealer } from "../../../types/dealer";

const dealerFields: FormField[] = [
	{ name: "id", label: "Dealer ID", placeholder: "D004", required: true },
	{ name: "name", label: "Dealer Name", placeholder: "Dealer name", required: true },
	{ name: "location", label: "Location", placeholder: "City", required: true },
	{ name: "status", label: "Status", options: ["Pending Approval", "Approved", "Declined", "In Production", "Ready for Delivery"] },
];

type DealerFormState = {
	id: string;
	name: string;
	location: string;
	status: string;
};

type DealerFormProps = {
	onSave: (dealer: NewDealer) => void | Promise<void>;
	onClose: () => void;
};

const initialForm: DealerFormState = {
	id: "",
	name: "",
	location: "",
	status: "Pending Approval",
};

export default function DealerForm({ onSave, onClose }: DealerFormProps) {
	const [form, setForm] = useState<DealerFormState>(initialForm);

	return <Form
		title="Add Dealer"
		subtitle="Dealer network"
		fields={dealerFields}
		values={form}
		onChange={(name, value) => setForm((currentForm) => ({ ...currentForm, [name]: value }))}
		onSubmit={async (event) => {
			event.preventDefault();
			await onSave({ ...form, orders: 0 });
		}}
		onClose={onClose}
	/>;
}
