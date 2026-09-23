import type { FormEvent } from "react";
import "./Form.css";

export type FormField = {
	name: string;
	label: string;
	type?: "text" | "email" | "password";
	placeholder?: string;
	required?: boolean;
	options?: string[];
};

type FormProps = {
	title: string;
	subtitle?: string;
	fields: FormField[];
	values: Record<string, string>;
	onChange: (name: string, value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onClose: () => void;
	closeLabel?: string;
};

export default function Form({
	title,
	subtitle,
	fields,
	values,
	onChange,
	onSubmit,
	onClose,
	closeLabel = "Close form",
}: FormProps) {
	return (
		<div className="form-overlay" role="presentation" onMouseDown={onClose}>
			<form className="form-modal" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
				<div className="form-heading">
					<div>
						<h2>{title}</h2>
						{subtitle && <p>{subtitle}</p>}
					</div>
					<button type="button" aria-label={closeLabel} onClick={onClose}>×</button>
				</div>
				<div className="form-fields">
					{fields.map((field) => (
						<label key={field.name}>
							{field.label}
							{field.options ? (
								<select
									value={values[field.name] ?? ""}
									onChange={(event) => onChange(field.name, event.target.value)}
								>
									{field.options.map((option) => <option key={option} value={option}>{option}</option>)}
								</select>
							) : (
								<input
									required={field.required}
									type={field.type ?? "text"}
									placeholder={field.placeholder}
									value={values[field.name] ?? ""}
									onChange={(event) => onChange(field.name, event.target.value)}
								/>
							)}
						</label>
					))}
				</div>
				<div className="form-actions">
					<button type="button" onClick={onClose}>Cancel</button>
					<button className="form-save" type="submit">Save</button>
				</div>
			</form>
		</div>
	);
}
