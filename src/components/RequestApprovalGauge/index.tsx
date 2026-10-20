import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import "./RequestApprovalGauge.css";

export type ApprovalBreakdown = {
  approved: number;
  pending: number;
  rejected: number;
  ratePercentage?: number;
  trendText?: string;
};

const defaultBreakdown: ApprovalBreakdown = {
  approved: 104,
  pending: 24,
  rejected: 6,
  ratePercentage: 82,
  trendText: "+6% from last month",
};

interface RequestApprovalGaugeProps {
  data?: ApprovalBreakdown;
  title?: string;
  subtitle?: string;
}

export default function RequestApprovalGauge({
  data = defaultBreakdown,
  title = "Request Approval Rate",
  subtitle = "Percentage of requests converted to orders",
}: RequestApprovalGaugeProps) {
  const total = data.approved + data.pending + data.rejected;
  const ratePercentage =
    data.ratePercentage ?? Math.round((data.approved / (total || 1)) * 100);

  return (
    <div className="approval-gauge-card">
      <div className="approval-gauge-header">
        <div className="approval-gauge-title-group">
          <div className="approval-gauge-icon-box">
            <TrackChangesIcon className="approval-gauge-icon" />
          </div>
          <div>
            <h3 className="approval-gauge-title">{title}</h3>
            <p className="approval-gauge-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="approval-gauge-content">
        <div className="approval-gauge-chart-container">
          <Gauge
            width={200}
            height={140}
            value={ratePercentage}
            startAngle={-90}
            endAngle={90}
            innerRadius="75%"
            outerRadius="100%"
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 28,
                fontWeight: 800,
                fill: "#0F172A",
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: "#22C55E",
              },
              [`& .${gaugeClasses.referenceArc}`]: {
                fill: "#E2E8F0",
              },
            }}
            text={({ value }) => `${value}%`}
          />
          <div className="approval-gauge-trend-badge">
            <TrendingUpIcon className="approval-trend-icon" />
            <span>{data.trendText ?? "+6% from last month"}</span>
          </div>
        </div>

        <div className="approval-gauge-legend">
          <div className="legend-item">
            <div className="legend-label">
              <span className="legend-dot legend-dot--green" />
              <span>Approved</span>
            </div>
            <span className="legend-value">{data.approved}</span>
          </div>

          <div className="legend-item">
            <div className="legend-label">
              <span className="legend-dot legend-dot--yellow" />
              <span>Pending</span>
            </div>
            <span className="legend-value">{data.pending}</span>
          </div>

          <div className="legend-item">
            <div className="legend-label">
              <span className="legend-dot legend-dot--red" />
              <span>Rejected</span>
            </div>
            <span className="legend-value">{data.rejected}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
