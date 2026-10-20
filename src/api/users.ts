import type { User } from "../types/user";

const API_URL = "/api";

export async function getUsers(): Promise<User[]> {
	const response = await fetch(`${API_URL}/users`);
	if (!response.ok) {
		throw new Error(`Failed to load users: ${response.statusText}`);
	}
	return (await response.json()) as User[];
}

export async function getUserById(id: string): Promise<User> {
	const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`);
	if (!response.ok) {
		throw new Error(`User not found: ${response.statusText}`);
	}
	return (await response.json()) as User;
}

export async function createUser(user: User): Promise<User> {
	const response = await fetch(`${API_URL}/users`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(user),
	});
	if (!response.ok) {
		throw new Error(`Failed to create user: ${response.statusText}`);
	}
	return (await response.json()) as User;
}

export async function updateUser(user: User): Promise<User> {
	const response = await fetch(`${API_URL}/users/${encodeURIComponent(user.id)}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(user),
	});
	if (!response.ok) {
		throw new Error(`Failed to update user: ${response.statusText}`);
	}
	return (await response.json()) as User;
}

export async function deleteUser(id: string): Promise<void> {
	const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error(`Failed to delete user: ${response.statusText}`);
	}
}
