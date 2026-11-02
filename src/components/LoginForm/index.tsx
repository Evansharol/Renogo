import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { getDashboardPath, loginUser } from "../../auth/auth";
import "./LoginForm.css";

export default function UserLoginForm() {
	const navigate = useNavigate();
	const [userId, setUserId] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setMessage("");
		setIsSubmitting(true);

		try {
			const loginState = await loginUser(userId.trim(), password);
			const dashboardPath = getDashboardPath(loginState.role);
			if (!dashboardPath) {
				setMessage("Your account does not have access to a dashboard.");
				return;
			}
			setPassword("");
			navigate(dashboardPath, { state: loginState, replace: true });
		} catch (error: unknown) {
			setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="login-form" onSubmit={handleSubmit}>
			<h2>Login</h2>

			<div className="form-group">
				<label htmlFor="userId">User ID</label>
				<input
					id="userId"
					type="text"
					placeholder="Enter your user ID"
					autoComplete="username"
					required
					value={userId}
					onChange={(event) => setUserId(event.target.value)}
				/>
			</div>

			<div className="form-group">
				<label htmlFor="password">Password</label>
				<input
					id="password"
					type="password"
					placeholder="Enter your password"
					autoComplete="current-password"
					required
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
			</div>

			<button type="submit" className="login-button" disabled={isSubmitting}>
				{isSubmitting ? "Signing in..." : "Login"}
			</button>

			{message && (
				<Alert className="login-alert" severity="warning" variant="filled" role="alert">
					{message}
				</Alert>
			)}
		</form>
	);
}
