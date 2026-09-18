import UserLoginForm from "../components/UserLoginForm";
import "./Login.css";
import HeaderLogo from "../components/header_logo";

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
