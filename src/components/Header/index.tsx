import logo from "../../assets/logo.png";
import "./index.css";

export default function HeaderLogo() {
    return (
        <header className="login-logo">
            <img src={logo} alt="Renogo logo" />
            <span>RenoGo</span>
        </header>
    );
}
