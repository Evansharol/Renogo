import "./RequestStatus.css";

const statuses = [
	{ label: "Completed", value: 68, className: "completed" },
	{ label: "Ongoing", value: 21, className: "ongoing" },
	{ label: "Pending", value: 11, className: "pending" },
];

export default function RequestStatus() {
	return (
		<article className="request-status-chart chart-card">
			<div className="chart-heading">
				<div>
					<h2>Request Status</h2>
					<p>Current request progress</p>
				</div>
				<span className="chart-period">This month</span>
			</div>
			<div className="request-bars">
				{statuses.map((status) => (
					<div className="request-bar-row" key={status.label}>
						<div className="request-bar-label">
							<span>{status.label}</span>
							<strong>{status.value}%</strong>
						</div>
						<div className="request-bar-track">
							<span className={`request-bar ${status.className}`} style={{ width: `${status.value}%` }} />
						</div>
					</div>
				))}
			</div>
		</article>
	);
}
