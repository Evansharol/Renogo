import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import Alert from '@mui/material/Alert';


type DummyUser = { userId: string; name: string; password: string; dealerId?: string };

const DUMMY_USERS: Record<"admin" | "dealer", DummyUser> = {
  admin: {
    userId: "A001",
    name: "admin",
    password: "admin123",
  },
  dealer: {
    userId: "D001",
    name: "dealer",
    password: "dealer123",
    dealerId: "D001",
  },
};

export default function UserLoginForm() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = DUMMY_USERS[role as keyof typeof DUMMY_USERS];
    const normalizedUserId = userId.trim().toUpperCase();

    if (
      selectedUser &&
      normalizedUserId === selectedUser.userId &&
      password === selectedUser.password
    ) {
      setMessage("");

      if (role === "admin") {
        navigate("/admindb", { state: { name: selectedUser.name, userId: selectedUser.userId } });
      } else if (role === "dealer") {
        navigate("/dealer/DashBoard", {
          state: {
            name: selectedUser.name,
            userId: selectedUser.userId,
            dealerId: selectedUser.dealerId,
          },
        });
      }
    } else {
      setMessage("Enter Valid Credentials.");
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
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Choose</label>
        <select
          id="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="" disabled>
            Select option
          </option>
          <option value="admin">Admin</option>
          <option value="dealer">Dealer</option>
        </select>
      </div>

      <button type="submit" className="login-button">
        Login
      </button>

      {message && (
        <Alert className="login-alert" severity="warning" variant="filled">
          {message}
        </Alert>
      )}
    </form>
  );
}
