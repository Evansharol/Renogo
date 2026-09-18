import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLoginForm.css";

const DUMMY_USERS = {
  admin: {
    name: "admin",
    email: "admin@renogo.com",
    password: "admin123",
  },
  dealer: {
    name: "dealer",
    email: "dealer@renogo.com",
    password: "dealer123",
  },
};

export default function UserLoginForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = DUMMY_USERS[role as keyof typeof DUMMY_USERS];

    if (
      selectedUser &&
      name.toLowerCase() === selectedUser.name &&
      email.toLowerCase() === selectedUser.email &&
      password === selectedUser.password
    ) {
      navigate("/admindb", { state: { name: selectedUser.name } });
    } else {
      setMessage("Invalid credentials. Try admin or dealer.");
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
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Choose</label>
        <select
          id="role"
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

      {message && <p className="login-message">{message}</p>}
    </form>
  );
}
