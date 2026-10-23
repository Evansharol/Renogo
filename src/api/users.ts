import type { User } from "../types/user";

const API_URL = "/spring-api/api/users";

type ApiUser = Omit<User, "id"> & { id: string | number };

function normalizeUser(user: ApiUser): User {
    return { ...user, id: String(user.id) };
}

async function getErrorMessage(response: Response): Promise<string> {
    const body = await response.text();
    if (!body) return response.statusText;

    try {
        const parsed: unknown = JSON.parse(body);
        if (typeof parsed === "object" && parsed !== null) {
            const details = parsed as Record<string, unknown>;
            const message = details.message ?? details.detail ?? details.error;
            if (typeof message === "string") return message;
        }
    } catch {
        // The backend may return a plain-text error instead of JSON.
    }

    return body;
}

export async function getUsers(): Promise<User[]> {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`Failed to load users: ${response.statusText}`);
    }
    const users = (await response.json()) as ApiUser[];
    return users.map(normalizeUser);
}

export async function getUserById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
    if (!response.ok) {
        throw new Error(`User not found: ${response.statusText}`);
    }
    return normalizeUser((await response.json()) as ApiUser);
}

export async function createUser(user: User): Promise<User> {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password,
            phone: user.phone,
            location: user.location,
            department: user.department,
            status: user.status,
        }),
    });
    if (!response.ok) {
        throw new Error(`Failed to create user (${response.status}): ${await getErrorMessage(response)}`);
    }
    return normalizeUser((await response.json()) as ApiUser);
}

export async function updateUser(user: User): Promise<User> {
    const response = await fetch(`${API_URL}/${encodeURIComponent(user.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
    }
    return normalizeUser((await response.json()) as ApiUser);
}

export async function deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
    }
}
