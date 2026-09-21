import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import "./workflow.css";

type WorkflowShellProps = { title: string; subtitle: string; dealerLabel: string; children: ReactNode };

type LocationState = { name?: string };

export default function WorkflowShell({ title, subtitle, dealerLabel, children }: WorkflowShellProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState | null;

	return <div className="workflow-layout"><Sidebar /><div className="admin-content"><Navbar adminName={state?.name ?? "Admin"} /><main className="workflow-main"><button className="workflow-back" type="button" onClick={() => navigate("/dealers")}>← Back to Dealers</button><header className="workflow-page-header"><div><span className="workflow-kicker">{dealerLabel}</span><h1>{title}</h1><p>{subtitle}</p></div><span className="workflow-request-id">ORD-1001</span></header>{children}</main></div></div>;
}
