export const AUTH_TOKEN_KEY = "authToken";
export const LOGIN_STATE_KEY = "loginState";
const LEGACY_USERS_KEY = "managed-users";
const LOGIN_URL = "/spring-api/api/auth/login";

export type LoginState = {
	userId: string;
	name: string;
	role: string;
	dealerId?: string;
	location?: string;
};

type AuthSession = {
	token: string;
	user: LoginState;
};

function asRecord(value: unknown): Record<string, unknown> | null {
	return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function decodeTokenClaims(token: string): Record<string, unknown> {
	try {
		const payload = token.split(".")[1];
		if (!payload) return {};
		const binary = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
		return asRecord(JSON.parse(new TextDecoder().decode(bytes))) ?? {};
	} catch {
		return {};
	}
}

function normalizeRole(role: unknown): string | null {
	if (typeof role !== "string") return null;
	const normalized = role.trim().toLowerCase().replace(/^role_/, "").replace(/[\s_-]+/g, "");
	const roles: Record<string, string> = {
		admin: "admin",
		administrator: "admin",
		dealer: "dealer",
		manufacturer: "manufacturer",
		financehead: "financehead",
		salesmanager: "salesmanager",
		dealermanager: "dealermanager",
	};
	return roles[normalized] ?? null;
}

function normalizeAuthResponse(payload: unknown): AuthSession {
	const response = asRecord(payload);
	const data = asRecord(response?.data) ?? response;
	const user = asRecord(data?.user) ?? data;
	if (!data || !user) throw new Error("The login response was invalid.");

	const token = [data.accessToken, data.access_token, data.token, data.jwt, data.jwtToken, response?.token]
		.find((value): value is string => typeof value === "string" && value.length > 0);
	if (!token) throw new Error("The login response did not include a JWT.");

	const claims = decodeTokenClaims(token);
	const userId = [user.userId, user.id, user.username, user.userName, claims.userId, claims.id, claims.sub]
		.find((value): value is string | number => typeof value === "string" || typeof value === "number");
	const name = [user.name, user.fullName, user.displayName, claims.name, claims.fullName]
		.find((value): value is string => typeof value === "string" && value.length > 0);
	const roles = Array.isArray(user.roles) ? user.roles
		: Array.isArray(claims.roles) ? claims.roles
			: Array.isArray(user.authorities) ? user.authorities
				: Array.isArray(claims.authorities) ? claims.authorities : [];
	const role = normalizeRole(user.role ?? user.userRole ?? claims.role ?? claims.userRole ?? roles[0]);
	if (userId === undefined || !role) {
		throw new Error("The login response did not include a user ID and supported role.");
	}

	const dealerId = user.dealerId ?? claims.dealerId;
	const location = user.location ?? claims.location;
	return {
		token,
		user: {
			userId: String(userId),
			name: name ?? String(userId),
			role,
			...(typeof dealerId === "string" ? { dealerId } : role === "dealer" ? { dealerId: String(userId) } : {}),
			...(typeof location === "string" && { location }),
		},
	};
}

export function saveAuthSession(token: string, user: LoginState): void {
	localStorage.setItem(AUTH_TOKEN_KEY, token);
	localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
	return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function addAuthHeader(headers: Headers): Headers {
	const token = getAuthToken();
	if (token) headers.set("Authorization", `Bearer ${token}`);
	return headers;
}

export function getLoginState(): LoginState | null {
	const stored = localStorage.getItem(LOGIN_STATE_KEY);
	if (!stored) return null;

	try {
		const value = asRecord(JSON.parse(stored));
		if (
			typeof value?.userId === "string"
			&& typeof value.name === "string"
			&& typeof value.role === "string"
		) {
			return {
				userId: value.userId,
				name: value.name,
				role: value.role,
				...(typeof value.dealerId === "string" && { dealerId: value.dealerId }),
				...(typeof value.location === "string" && { location: value.location }),
			};
		}
	} catch {
		return null;
	}
	return null;
}

export function clearAuthSession(): void {
	localStorage.removeItem(AUTH_TOKEN_KEY);
	localStorage.removeItem(LOGIN_STATE_KEY);
	localStorage.removeItem(LEGACY_USERS_KEY);
}

export function clearLegacyUserCache(): void {
	localStorage.removeItem(LEGACY_USERS_KEY);
}

export function handleUnauthorized(): void {
	clearAuthSession();
	window.dispatchEvent(new Event("auth:unauthorized"));
}

export function getDashboardPath(role: string): string | null {
	const paths: Record<string, string> = {
		admin: "/admindb",
		dealer: "/dealer/dashboard",
		manufacturer: "/manufacturer/dashboard",
		financehead: "/financehead/dashboard",
		salesmanager: "/salesmanager/dashboard",
		dealermanager: "/dealermanager/dashboard",
	};
	return paths[normalizeRole(role) ?? ""] ?? null;
}

export async function loginUser(userId: string, password: string): Promise<LoginState> {
	const response = await fetch(LOGIN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		credentials: "omit",
		body: JSON.stringify({ userId, password }),
	});
	if (!response.ok) {
		if (response.status === 401 || response.status === 400) {
			throw new Error("Invalid user ID or password.");
		}
		if (response.status === 404) {
			throw new Error("Login endpoint not found. Check that the Spring Boot API is running with POST /api/auth/login.");
		}
		throw new Error(`Unable to sign in (${response.status}). Please try again.`);
	}

	const session = normalizeAuthResponse(await response.json());
	saveAuthSession(session.token, session.user);
	return session.user;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
	const headers = addAuthHeader(new Headers(init.headers));

	const response = await fetch(input, { ...init, headers, credentials: "omit" });
	if (response.status === 401) handleUnauthorized();
	return response;
}
