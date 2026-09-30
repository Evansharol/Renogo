import UserLoginForm from "../../components/LoginForm";
import "./Login.css";
import HeaderLogo from "../../components/Header";

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
