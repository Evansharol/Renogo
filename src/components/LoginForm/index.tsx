import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import Alert from '@mui/material/Alert';


type DummyUser = { userId: string; name: string; password: string; dealerId?: string };
type ManagedUser = { id: string; name: string; password: string; role: string; status: "Active" | "Inactive" };

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

function getManagedUsers(): ManagedUser[] {
  const storedUsers = localStorage.getItem("managed-users");
  if (!storedUsers) return [];

  try {
    return JSON.parse(storedUsers) as ManagedUser[];
  } catch {
    return [];
  }
}

export default function UserLoginForm() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUserId = userId.trim().toUpperCase();
    const managedUser = getManagedUsers().find((user) =>
      user.id.toUpperCase() === normalizedUserId &&
      user.status === "Active" &&
      (role === "dealer" ? user.role.toLowerCase() === "dealer" : user.role.toLowerCase() === "administrator")
    );
    const selectedUser = managedUser
      ? { userId: managedUser.id, name: managedUser.name, password: managedUser.password, dealerId: role === "dealer" ? managedUser.id : undefined }
      : DUMMY_USERS[role as keyof typeof DUMMY_USERS];

    if (
      selectedUser &&
      normalizedUserId === selectedUser.userId &&
      password === selectedUser.password
    ) {
      setMessage("");
      const loginState = {
        name: selectedUser.name,
        userId: selectedUser.userId,
        dealerId: selectedUser.dealerId,
      };
      localStorage.setItem("loginState", JSON.stringify(loginState));

      if (role === "admin") {
        navigate("/admindb", { state: loginState });
      } else if (role === "dealer") {
        navigate("/dealer/DashBoard", {
          state: loginState,
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
