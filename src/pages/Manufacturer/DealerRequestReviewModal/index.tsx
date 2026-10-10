import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

import type { DealerRequest } from "../../../components/DealerRequestTable";
import AvailabilityProgressBar from "../../../components/AvailabilityProgressBar";

type DealerRequestReviewModalProps = {
  request: DealerRequest;
  onClose: () => void;
};

export default function DealerRequestReviewModal({
  request,
  onClose,
}: DealerRequestReviewModalProps) {
  const colorStock = request.stockBreakdown[request.color] ?? 0;
  const initialAvailable = Math.min(colorStock, request.quantity);
  const [available, setAvailable] = useState(initialAvailable);
  const [manufacturing, setManufacturing] = useState(request.quantity - initialAvailable);
  const [comments, setComments] = useState("");
  const [manufacturerStatus, setManufacturerStatus] = useState(request.manufacturerStatus);
  const total = available + manufacturing;
  const isComplete = total === request.quantity;
  const modelName = request.model.startsWith("Renault") ? request.model : `Renault ${request.model}`;
  const formattedDate = useMemo(
    () => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(request.requestDate)),
    [request.requestDate],
  );

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const updateAvailable = (value: number) => {
    const next = Math.max(0, Math.min(colorStock, request.quantity, value || 0));
    setAvailable(next);
    setManufacturing(request.quantity - next);
  };

  const updateManufacturing = (value: number) => {
    const next = Math.max(0, Math.min(request.quantity, value || 0));
    setManufacturing(next);
    setAvailable(Math.min(colorStock, request.quantity - next));
  };

  return (
    <div className="manufacturer-review-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="manufacturer-review-modal" role="dialog" aria-modal="true" aria-labelledby="review-request-title">
        <header className="manufacturer-review-header">
          <div>
            <p className="manufacturer-review-eyebrow">{request.requestId}</p>
            <h2 id="review-request-title">Review Dealer Fleet Request</h2>
            <p>{request.dealerName} <span>•</span> {modelName} <span>•</span> {request.color} <span>•</span> {request.quantity} Units</p>
          </div>
          <button type="button" className="manufacturer-modal-close" aria-label="Close review modal" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <div className="manufacturer-review-body">
          <section className="manufacturer-review-card">
            <h3>Request Details</h3>
            <div className="manufacturer-detail-grid">
              <div><span>Dealer ID</span><strong>{request.dealerId}</strong></div>
              <div><span>Dealer Name</span><strong>{request.dealerName}</strong></div>
              <div><span>Vehicle Model</span><strong>{modelName}</strong></div>
              <div><span>Color</span><strong>{request.color}</strong></div>
              <div><span>Requested Quantity</span><strong>{request.quantity} Units</strong></div>
              <div><span>Request Date</span><strong>{formattedDate}</strong></div>
            </div>
          </section>

          <div className="manufacturer-review-two-column">
            <section className="manufacturer-review-card">
              <div className="manufacturer-card-title-row">
                <h3>Current Inventory</h3>
                <span className={`manufacturer-allocation-badge manufacturer-allocation-badge--${colorStock >= request.quantity ? "complete" : colorStock ? "partial" : "unavailable"}`}>
                  {colorStock >= request.quantity ? "Fully Available" : colorStock ? "Partially Available" : "Unavailable"}
                </span>
              </div>
              <div className="manufacturer-inventory-total"><span>Available Stock ({request.color})</span><strong>{colorStock} Units</strong></div>
              <div className="manufacturer-stock-breakdown">
                {Object.entries(request.stockBreakdown).map(([color, count]) => (
                  <div key={color}><span>{color}</span><strong>{count}</strong></div>
                ))}
              </div>
            </section>

            <section className="manufacturer-review-card">
              <h3>Allocation Summary</h3>
              <div className="manufacturer-allocation-total"><span>Requested Quantity</span><strong>{request.quantity} Units</strong></div>
              <AvailabilityProgressBar
                available={available}
                manufacturing={manufacturing}
                total={request.quantity}
              />
              <div className="manufacturer-allocation-legend">
                <span><i className="manufacturer-legend-dot manufacturer-legend-dot--green" />Available Stock <strong>{available} Units</strong></span>
                <span><i className="manufacturer-legend-dot manufacturer-legend-dot--yellow" />To Manufacture <strong>{manufacturing} Units</strong></span>
              </div>
            </section>
          </div>

          <section className="manufacturer-review-card">
            <h3>Allocate Order</h3>
            <div className="manufacturer-allocation-inputs">
              <label>Available From Inventory ({request.color})<input type="number" min="0" max={colorStock} value={available} onChange={(event) => updateAvailable(Number(event.target.value))} /></label>
              <label>To Manufacture<input type="number" min="0" max={request.quantity} value={manufacturing} onChange={(event) => updateManufacturing(Number(event.target.value))} /></label>
              <label>Manufacturer Status
                <select
                  value={manufacturerStatus}
                  onChange={(event) => setManufacturerStatus(event.target.value as typeof manufacturerStatus)}
                >
                  <option value="Fully Allocated">Fully Allocated</option>
                  <option value="Partially Allocated">Partially Allocated</option>
                  <option value="Not Allocated">Not Allocated</option>
                </select>
              </label>
            </div>
          </section>

          <section className="manufacturer-review-card">
            <h3>Manufacturer Comments</h3>
            <textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Enter allocation notes for supervisor..." />
          </section>

          <section className="manufacturer-final-summary">
            <div><span>Requested</span><strong>{request.quantity} Units</strong></div>
            <div><span>Available</span><strong>{available} Units</strong></div>
            <div><span>To Manufacture</span><strong>{manufacturing} Units</strong></div>
            <div><span>Manufacturer Status</span><strong className="manufacturer-final-status">● {manufacturerStatus}</strong></div>
          </section>
        </div>

        <footer className="manufacturer-review-footer">
          <button type="button" className="manufacturer-modal-secondary" onClick={onClose}>Cancel</button>
          <div>
            <button type="button" className="manufacturer-modal-secondary">Save Draft</button>
            <button type="button" className="manufacturer-modal-primary" disabled={!isComplete}>Send To Supervisor</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
