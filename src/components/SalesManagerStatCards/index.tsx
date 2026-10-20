import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import "./SalesManagerStatCards.css";

export type StatCardData = {
  id: string;
  title: string;
  value: number | string;
  trend: string;
  trendType: "up" | "down";
  icon: "total" | "approved" | "pending" | "rejected";
};

interface SalesManagerStatCardsProps {
  stats?: StatCardData[];
  onCardClick?: (cardId: string) => void;
}

const defaultStats: StatCardData[] = [
  {
    id: "total",
    title: "Total Requests",
    value: 152,
    trend: "+12% from last month",
    trendType: "up",
    icon: "total",
  },
  {
    id: "approved",
    title: "Approved Requests",
    value: 104,
    trend: "+22% from last month",
    trendType: "up",
    icon: "approved",
  },
  {
    id: "pending",
    title: "Pending Requests",
    value: 24,
    trend: "-8% from last month",
    trendType: "down",
    icon: "pending",
  },
  {
    id: "rejected",
    title: "Rejected Requests",
    value: 6,
    trend: "-2% from last month",
    trendType: "down",
    icon: "rejected",
  },
];

export default function SalesManagerStatCards({
  stats = defaultStats,
  onCardClick,
}: SalesManagerStatCardsProps) {
  const renderIcon = (type: StatCardData["icon"]) => {
    switch (type) {
      case "total":
        return <DescriptionOutlinedIcon className="sm-stat-icon sm-stat-icon--blue" />;
      case "approved":
        return <CheckCircleOutlinedIcon className="sm-stat-icon sm-stat-icon--green" />;
      case "pending":
        return <AccessTimeOutlinedIcon className="sm-stat-icon sm-stat-icon--yellow" />;
      case "rejected":
        return <CancelOutlinedIcon className="sm-stat-icon sm-stat-icon--red" />;
      default:
        return <DescriptionOutlinedIcon className="sm-stat-icon" />;
    }
  };

  return (
    <div className="sm-stat-grid">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="sm-stat-card"
          onClick={() => onCardClick?.(stat.id)}
          role="button"
          tabIndex={0}
        >
          <div className="sm-stat-header">
            <div className={`sm-stat-icon-wrapper sm-stat-icon-wrapper--${stat.icon}`}>
              {renderIcon(stat.icon)}
            </div>
          </div>
          <div className="sm-stat-body">
            <span className="sm-stat-title">{stat.title}</span>
            <div className="sm-stat-value">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
