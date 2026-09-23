import UserLoginForm from "../../components/LoginForm/LoginForm";
import "./Login.css";
import HeaderLogo from "../../components/Logo/Logo";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-image-panel" >
      <HeaderLogo />
      </div>

      <div className="login-right-panel">
        <UserLoginForm />
      </div>
    </div>
  );
}
