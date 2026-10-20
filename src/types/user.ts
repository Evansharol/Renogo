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
