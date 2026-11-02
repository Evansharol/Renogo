import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
	AUTH_TOKEN_KEY,
	LOGIN_STATE_KEY,
	addAuthHeader,
	apiFetch,
	clearAuthSession,
	loginUser,
} from "./auth.ts";

function createStorage() {
	const values = new Map();
	return {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, String(value)),
		removeItem: (key) => values.delete(key),
	};
}

let dispatchEvent;

beforeEach(() => {
	globalThis.localStorage = createStorage();
	dispatchEvent = (event) => { globalThis.lastEvent = event; };
	globalThis.window = { dispatchEvent };
	globalThis.fetch = async () => new Response("{}", { status: 200 });
});

test("successful login uses backend identity and stores only JWT and safe user details", async () => {
	globalThis.fetch = async (url, options) => {
		assert.equal(url, "/spring-api/api/auth/login");
		assert.equal(options.method, "POST");
		assert.equal(options.credentials, "omit");
		assert.deepEqual(JSON.parse(options.body), { userId: "SM-10", password: "secret" });
		return new Response(JSON.stringify({
			token: "signed.jwt.token",
			user: { userId: "SM-10", name: "Taylor Morgan", role: "Sales Manager", password: "do-not-store" },
		}), { status: 200, headers: { "Content-Type": "application/json" } });
	};

	const user = await loginUser("SM-10", "secret");

	assert.deepEqual(user, { userId: "SM-10", name: "Taylor Morgan", role: "salesmanager" });
	assert.equal(localStorage.getItem(AUTH_TOKEN_KEY), "signed.jwt.token");
	assert.deepEqual(JSON.parse(localStorage.getItem(LOGIN_STATE_KEY)), user);
	assert.equal(localStorage.getItem(LOGIN_STATE_KEY).includes("password"), false);
});

test("invalid credentials return an inline-displayable error and do not create a session", async () => {
	globalThis.fetch = async () => new Response("", { status: 401 });

	await assert.rejects(loginUser("bad-user", "bad-password"), /Invalid user ID or password/);
	assert.equal(localStorage.getItem(AUTH_TOKEN_KEY), null);
	assert.equal(localStorage.getItem(LOGIN_STATE_KEY), null);
});

test("a missing login route explains that the backend endpoint is unavailable", async () => {
	globalThis.fetch = async () => new Response("", { status: 404 });

	await assert.rejects(loginUser("user", "password"), /Login endpoint not found.*POST \/api\/auth\/login/);
	assert.equal(localStorage.getItem(AUTH_TOKEN_KEY), null);
	assert.equal(localStorage.getItem(LOGIN_STATE_KEY), null);
});

test("protected direct requests receive the bearer token", async () => {
	localStorage.setItem(AUTH_TOKEN_KEY, "jwt-value");
	const headers = addAuthHeader(new Headers());
	assert.equal(headers.get("Authorization"), "Bearer jwt-value");

	globalThis.fetch = async (_url, options) => {
		assert.equal(options.headers.get("Authorization"), "Bearer jwt-value");
		assert.equal(options.credentials, "omit");
		return new Response("{}", { status: 200 });
	};
	await apiFetch("/api/orders");
});

test("logout clears JWT, login details, and the legacy user cache", () => {
	localStorage.setItem(AUTH_TOKEN_KEY, "jwt-value");
	localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify({ userId: "SM-10", name: "Taylor", role: "salesmanager" }));
	localStorage.setItem("managed-users", JSON.stringify([{ password: "legacy-password" }]));

	clearAuthSession();

	assert.equal(localStorage.getItem(AUTH_TOKEN_KEY), null);
	assert.equal(localStorage.getItem(LOGIN_STATE_KEY), null);
	assert.equal(localStorage.getItem("managed-users"), null);
});

test("expired sessions clear stored state and notify app to redirect on 401", async () => {
	localStorage.setItem(AUTH_TOKEN_KEY, "expired-jwt");
	localStorage.setItem(LOGIN_STATE_KEY, JSON.stringify({ userId: "SM-10", name: "Taylor", role: "salesmanager" }));
	globalThis.fetch = async () => new Response("", { status: 401 });

	await apiFetch("/api/orders");

	assert.equal(localStorage.getItem(AUTH_TOKEN_KEY), null);
	assert.equal(localStorage.getItem(LOGIN_STATE_KEY), null);
	assert.equal(globalThis.lastEvent.type, "auth:unauthorized");
});
