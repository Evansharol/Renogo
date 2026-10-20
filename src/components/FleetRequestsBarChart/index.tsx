import { BarChart } from "@mui/x-charts/BarChart";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import "./FleetRequestsBarChart.css";

const defaultMonthlyData = [
  { month: "Jan", requests: 45 },
  { month: "Feb", requests: 62 },
  { month: "Mar", requests: 58 },
  { month: "Apr", requests: 75 },
  { month: "May", requests: 90 },
  { month: "Jun", requests: 78 },
  { month: "Jul", requests: 65 },
  { month: "Aug", requests: 72 },
  { month: "Sep", requests: 68 },
  { month: "Oct", requests: 80 },
  { month: "Nov", requests: 76 },
  { month: "Dec", requests: 85 },
];

interface FleetRequestsBarChartProps {
  data?: typeof defaultMonthlyData;
  title?: string;
  subtitle?: string;
}

export default function FleetRequestsBarChart({
  data = defaultMonthlyData,
  title = "Fleet Requests Trend",
  subtitle = "Monthly fleet requests received from dealers",
}: FleetRequestsBarChartProps) {
  const xLabels = data.map((d) => d.month);
  const chartValues = data.map((d) => d.requests);

  return (
    <div className="fleet-chart-card">
      <div className="fleet-chart-header">
        <div className="fleet-chart-title-group">
          <div className="fleet-chart-icon-box">
            <InsertChartOutlinedIcon className="fleet-chart-icon" />
          </div>
          <div>
            <h3 className="fleet-chart-title">{title}</h3>
            <p className="fleet-chart-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="fleet-chart-body">
        <BarChart
          series={[
            {
              data: chartValues,
              color: "#FFC72C", // Vibrant yellow matching the image
              label: "Requests",
              id: "requests-series",
              valueFormatter: (value) => `${value} requests`,
            },
          ]}
          xAxis={[
            {
              data: xLabels,
              scaleType: "band",
              categoryGapRatio: 0.3,
              barGapRatio: 0.1,
            },
          ]}
          yAxis={[
            {
              min: 0,
              max: 100,
              tickInterval: [0, 25, 50, 75, 100],
            },
          ]}
          borderRadius={6}
          margin={{ top: 25, right: 20, bottom: 45, left: 45 }}
          sx={{
            width: "100%",
            height: "100%",
            "& .MuiBarElement-root": {
              rx: 5,
              ry: 5,
              transition: "fill 0.2s ease",
              "&:hover": {
                fill: "#e5b026",
              },
            },
            "& .MuiChartsAxis-line": {
              stroke: "#E2E8F0",
            },
            "& .MuiChartsAxis-tick": {
              stroke: "transparent",
            },
            "& .MuiChartsAxis-tickLabel": {
              fill: "#64748B",
              fontSize: "12px",
              fontWeight: 500,
            },
            "& .MuiChartsGrid-line": {
              stroke: "#F1F5F9",
              strokeDasharray: "4 4",
            },
          }}
          grid={{ horizontal: true }}
        />
      </div>
    </div>
  );
}
