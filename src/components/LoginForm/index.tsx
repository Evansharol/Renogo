import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../../api/users";
import "./LoginForm.css";
import Alert from '@mui/material/Alert';

type LoginRole = "admin" | "dealer" | "manufacturer" | "financehead" | "salesmanager" | "dealermanager";
type DummyUser = { userId: string; name: string; password: string; dealerId?: string };
type ManagedUser = { id: string; name: string; password: string; role: string; status: "Active" | "Inactive" };

const DUMMY_USERS: Record<LoginRole, DummyUser> = {
  admin: {
    userId: "A001",
    name: "Amelia Martin",
    password: "admin123",
  },
  dealer: {
    userId: "D001",
    name: "Dinesh Kumar",
    password: "dealer123",
    dealerId: "D001",
  },
  manufacturer: {
    userId: "M001",
    name: "Noah Wilson",
    password: "Mr123",
  },
  financehead: {
    userId: "F001",
    name: "Louis Bernard",
    password: "f123",
  },
  salesmanager: {
    userId: "SM001",
    name: "Rajesh Kumar",
    password: "sm123",
  },
  dealermanager: {
    userId: "DM001",
    name: "Karthik Raja",
    password: "dm123",
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

function isMatchingManagedUser(user: ManagedUser, normalizedUserId: string, selectedRole: string) {
  const normalizedRole = user.role.toLowerCase();
  const roleMatches = selectedRole === "dealer"
    ? normalizedRole === "dealer"
    : selectedRole === "manufacturer"
      ? normalizedRole === "manufacturer"
      : selectedRole === "financehead"
        ? ["financehead", "finance head"].includes(normalizedRole)
        : normalizedRole === "administrator";

  if (!roleMatches || user.status !== "Active") return false;

  const matchesStoredId = user.id.toUpperCase() === normalizedUserId;
  const matchesLegacyDealerId = selectedRole === "dealer"
    && /^D\d+$/.test(normalizedUserId)
    && user.name.trim().toUpperCase() === normalizedUserId;

  return matchesStoredId || matchesLegacyDealerId;
}

export default function UserLoginForm() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUsers()
      .then((apiUsers) => {
        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          localStorage.setItem("managed-users", JSON.stringify(apiUsers));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUserId = userId.trim().toUpperCase();
    const cachedManagedUser = getManagedUsers().find((user) =>
      isMatchingManagedUser(user, normalizedUserId, role)
    );
    let managedUser = cachedManagedUser;
    try {
      const apiUsers = await getUsers();
      const freshManagedUser = apiUsers.find((user) =>
        isMatchingManagedUser(user, normalizedUserId, role)
      );
      if (freshManagedUser) managedUser = freshManagedUser;
    } catch {
      // Use the cached users when the API is unavailable.
    }
    const selectedUser = managedUser
      ? { userId: normalizedUserId, name: managedUser.name, password: managedUser.password, dealerId: role === "dealer" ? normalizedUserId : undefined }
      : DUMMY_USERS[role as LoginRole];

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
        role: role,
      };
      localStorage.setItem("loginState", JSON.stringify(loginState));

      if (role === "admin") {
        navigate("/admindb", { state: loginState });
      } else if (role === "dealer") {
        navigate("/dealer/dashboard", {
          state: loginState,
        });
      } else if (role === "manufacturer") {
        navigate("/manufacturer/dashboard", {
          state: loginState,
        });
      } else if (role === "financehead") {
        navigate("/financehead/dashboard", {
          state: loginState,
        });
      } else if( role === "salesmanager") {
        navigate("/salesmanager/dashboard", {
          state: loginState,
        });
      } else if( role === "dealermanager") {
        navigate("/dealermanager/dashboard", {
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
          <option value="manufacturer">Manufacturer</option>
          <option value="financehead">Finance Head</option>
          <option value="salesmanager">Sales Manager</option>
          <option value="dealermanager">Dealer Manager</option>
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
