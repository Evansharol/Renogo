import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import type { Order } from "../../types/order";
import "./RecentDealerRequestsTable.css";

export type DisplayRequest = {
  requestId: string;
  dealerName: string;
  requestedVehicles: number;
  status: string;
  receivedOn: string;
  rawOrder?: Order;
};

interface RecentDealerRequestsTableProps {
  orders?: Order[];
  requests?: DisplayRequest[];
  title?: string;
  subTitle?: string;
  activeFilter?: string | null;
  onClearFilter?: () => void;
  onVerify?: (order: Order) => void;
  onViewClick?: (request: DisplayRequest) => void;
  onViewAllClick?: () => void;
}

export default function RecentDealerRequestsTable({
  orders,
  requests,
  title,
  subTitle,
  activeFilter,
  onClearFilter,
  onVerify,
  onViewClick,
  onViewAllClick,
}: RecentDealerRequestsTableProps) {
  // If orders are provided (the original user data), render the original table columns & data
  const hasOrders = Boolean(orders);

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pending")) return "sm-status-chip--pending";
    if (s.includes("approved")) return "sm-status-chip--approved";
    if (s.includes("production") || s.includes("completed")) return "sm-status-chip--review";
    if (s.includes("declined") || s.includes("rejected")) return "sm-status-chip--rejected";
    return "sm-status-chip--new";
  };

  return (
    <div className="recent-requests-card">
      <div className="recent-requests-header">
        <div className="recent-requests-title-group">
          <div className="recent-requests-icon-box">
            <ReceiptLongOutlinedIcon className="recent-requests-icon" />
          </div>
          <div>
            <h3 className="recent-requests-title">{title || "Recent Requests"}</h3>
            <p className="recent-requests-sub">{subTitle || "Latest orders allocated by the manufacturer."}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {activeFilter && onClearFilter && (
            <button
              type="button"
              className="recent-requests-clear-filter"
              onClick={onClearFilter}
              title="Reset filter"
            >
              Reset Filter &times;
            </button>
          )}
          {onViewAllClick && (
            <button
              type="button"
              className="recent-requests-view-all"
              onClick={onViewAllClick}
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="recent-requests-table-container">
        <table className="recent-requests-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Dealer ID</th>
              <th>Vehicle Model</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hasOrders && orders && orders.map((order) => (
              <tr key={order.id}>
                <td className="req-id-cell">
                  <strong>{order.id}</strong>
                </td>
                <td className="req-dealer-cell">{order.dealerId}</td>
                <td className="req-model-cell">{order.vehicleModel}</td>
                <td className="req-vehicles-cell">{order.quantity}</td>
                <td>
                  <span className={`sm-status-chip ${getStatusClass(order.status)}`}>
                    <span className="sm-status-dot" />
                    {order.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="supervisor-review-link"
                    onClick={() => onVerify?.(order)}
                  >
                    Verify
                  </button>
                </td>
              </tr>
            ))}

            {!hasOrders && requests && requests.map((req) => (
              <tr key={req.requestId}>
                <td className="req-id-cell">
                  <strong>{req.requestId}</strong>
                </td>
                <td className="req-dealer-cell">{req.dealerName}</td>
                <td className="req-model-cell">Renault Vehicle</td>
                <td className="req-vehicles-cell">{req.requestedVehicles}</td>
                <td>
                  <span className={`sm-status-chip ${getStatusClass(req.status)}`}>
                    <span className="sm-status-dot" />
                    {req.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="supervisor-review-link"
                    onClick={() => {
                      if (req.rawOrder && onVerify) {
                        onVerify(req.rawOrder);
                      } else if (onViewClick) {
                        onViewClick(req);
                      }
                    }}
                  >
                    Verify
                  </button>
                </td>
              </tr>
            ))}

            {((hasOrders && (!orders || orders.length === 0)) ||
              (!hasOrders && (!requests || requests.length === 0))) && (
              <tr>
                <td colSpan={6} className="req-empty-cell">
                  No allocated requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
