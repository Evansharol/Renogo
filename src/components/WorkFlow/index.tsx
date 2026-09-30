import type { ReactNode } from "react";   /*Provides styling and layout of page to react boilerplate code */
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "./WorkFlow.css";

type WorkflowShellProps = { title: string; subtitle: string; dealerLabel: string; children: ReactNode; isModal?: boolean; onClose?: () => void };

type LocationState = { name?: string };

export default function WorkflowShell({ title, subtitle, dealerLabel, children, isModal = false, onClose }: WorkflowShellProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState | null;

	if (isModal) {
		return <div className="workflow-modal-overlay" role="presentation" onClick={onClose}>
			<section className="workflow-modal" role="dialog" aria-modal="true" aria-labelledby="workflow-modal-title" onClick={(event) => event.stopPropagation()}>
				<header className="workflow-modal-header"><div>
					<span className="workflow-kicker">{dealerLabel}</span>
					<h1 id="workflow-modal-title">{title}</h1>
					<p>{subtitle}</p>
				</div><button className="workflow-modal-close" type="button" aria-label="Close popup" onClick={onClose}>×</button></header>
				<div className="workflow-modal-content">{children}</div>
			</section>
		</div>;
	}

	return <div className="workflow-layout">
		<Sidebar />
		<div className="admin-content">
			<Navbar adminName={state?.name ?? "Admin"} />
			<main className="workflow-main">
				<button className="workflow-back" type="button" onClick={() => navigate("/dealers")}>← Back to Dealers</button>
				<header className="workflow-page-header"><div>
					<span className="workflow-kicker">{dealerLabel}</span>
					<h1>{title}</h1>
					<p>{subtitle}</p>
					</div>
					<span className="workflow-request-id">ORD-1001</span>
					</header>{children}</main>
			</div></div>;
}
