import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import Alert from '@mui/material/Alert';


const DUMMY_USERS = {
  admin: {
    name: "admin",
    password: "admin123",
  },
  dealer: {
    name: "dealer",
    password: "dealer123",
  },
};

export default function UserLoginForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = DUMMY_USERS[role as keyof typeof DUMMY_USERS];
    const normalizedName = name.trim().toLowerCase();

    if (
      selectedUser &&
      normalizedName === selectedUser.name &&
      password === selectedUser.password
    ) {
      setMessage("");

      if (role === "admin") {
        navigate("/admindb", { state: { name: selectedUser.name } });
      } else if (role === "dealer") {
        navigate("/dealer/DashBoard", { state: { name: selectedUser.name } });
      }
    } else {
      setMessage("Enter Valid Credentials.");
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
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
