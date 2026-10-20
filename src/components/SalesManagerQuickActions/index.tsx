import BoltIcon from "@mui/icons-material/Bolt";
import AddIcon from "@mui/icons-material/Add";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./SalesManagerQuickActions.css";

export type ActionItem = {
  id: string;
  title: string;
  subtitle: string;
  type: "primary" | "secondary";
  icon: "add" | "pending" | "manage" | "reports";
};

const defaultActions: ActionItem[] = [
  {
    id: "process_request",
    title: "Process Pending Requests",
    subtitle: "Review and process dealer request",
    type: "primary",
    icon: "add",
  },
  {
    id: "view_pending",
    title: "View Pending Requests",
    subtitle: "Review and process dealer requests",
    type: "secondary",
    icon: "pending",
  },
  {
    id: "manage_approvals",
    title: "Manage Request Approvals",
    subtitle: "Track and update request status",
    type: "secondary",
    icon: "manage",
  },
];

interface SalesManagerQuickActionsProps {
  actions?: ActionItem[];
  onActionClick?: (actionId: string) => void;
}

export default function SalesManagerQuickActions({
  actions = defaultActions,
  onActionClick,
}: SalesManagerQuickActionsProps) {
  const renderIcon = (type: ActionItem["icon"]) => {
    switch (type) {
      case "add":
        return (
          <div className="qa-icon-circle qa-icon-circle--black">
            <AddIcon />
          </div>
        );
      case "pending":
        return (
          <div className="qa-icon-circle qa-icon-circle--light">
            <AssignmentTurnedInOutlinedIcon />
          </div>
        );
      case "manage":
        return (
          <div className="qa-icon-circle qa-icon-circle--light">
            <ChecklistRtlOutlinedIcon />
          </div>
        );
      case "reports":
        return (
          <div className="qa-icon-circle qa-icon-circle--light">
            <InsertChartOutlinedIcon />
          </div>
        );
      default:
        return (
          <div className="qa-icon-circle qa-icon-circle--light">
            <AddIcon />
          </div>
        );
    }
  };

  return (
    <div className="quick-actions-card">
      <div className="quick-actions-header">
        <div className="quick-actions-title-group">
          <div className="quick-actions-icon-box">
            <BoltIcon className="quick-actions-icon" />
          </div>
          <h3 className="quick-actions-title">Quick Actions</h3>
        </div>
      </div>

      <div className="quick-actions-list">
        {actions.map((action) => {
          const isPrimary = action.type === "primary";
          return (
            <div
              key={action.id}
              className={`qa-item ${isPrimary ? "qa-item--primary" : "qa-item--secondary"}`}
              onClick={() => onActionClick?.(action.id)}
              role="button"
              tabIndex={0}
            >
              <div className="qa-item-left">
                {renderIcon(action.icon)}
                <div className="qa-item-text">
                  <h4 className="qa-item-title">{action.title}</h4>
                  <p className="qa-item-subtitle">{action.subtitle}</p>
                </div>
              </div>
              <ChevronRightIcon className="qa-item-chevron" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
