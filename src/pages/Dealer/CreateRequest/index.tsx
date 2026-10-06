import { useState, type FormEvent } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import { createOrder } from "../../../api/orders";
import type { Order } from "../../../types/order";
import "./CreateRequest.css";

type Props = {
  open: boolean;
  initialVehicle?: string;
  dealerId: string;
  onClose: () => void;
  onSubmitted: (order: Order) => void;
};

const VEHICLE_OPTIONS = [
  "Renault Kiger",
  "Renault Triber",
  "Renault Duster",
  "Renault Kwid",
  "Renault Arkana",
];

export default function CreateRequestDialog({ open, initialVehicle = "", dealerId, onClose, onSubmitted }: Props) {
  const [vehicle, setVehicle]     = useState(initialVehicle);
  const [quantity, setQuantity]   = useState(25);
  const [eta, setEta]             = useState("");
  const [remarks, setRemarks]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync vehicle when parent changes the pre-selected model
  const effectiveVehicle = vehicle || initialVehicle;

  const reset = () => { setVehicle(""); setQuantity(25); setEta(""); setRemarks(""); };

  const handleClose = () => { if (!submitting) { reset(); onClose(); } };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!effectiveVehicle) return;
    setSubmitting(true);

    const newOrder: Order = {
      id: `REQ-${Date.now()}`,
      dealerId,
      vehicleModel: effectiveVehicle,
      quantity,
      status: "Pending",
      orderDate: new Date().toISOString(),
      etaDelivery: eta || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };

    await createOrder({
      dealerId,
      vehicleModel: effectiveVehicle,
      quantity,
      status: "Pending",
      orderDate: newOrder.orderDate,
      etaDelivery: newOrder.etaDelivery,
    }).catch(() => {/* server offline – proceed with local state */});

    setSubmitting(false);
    reset();
    onSubmitted(newOrder);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="create-request-title">
      <DialogTitle id="create-request-title" className="dialog-header-custom">
        <div>
          <strong>Create Fleet Vehicle Request</strong>
          <p>Submit procurement details for admin stock verification &amp; quotation</p>
        </div>
        <IconButton onClick={handleClose} disabled={submitting} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="dialog-form-body">
          <div className="form-field-row">
            <label htmlFor="req-vehicle">
              Vehicle Model *
              <select
                id="req-vehicle"
                required
                value={effectiveVehicle}
                onChange={(e) => setVehicle(e.target.value)}
              >
                <option value="" disabled>Select vehicle model</option>
                {VEHICLE_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-field-columns">
            <label htmlFor="req-quantity">
              Required Units *
              <input
                id="req-quantity"
                type="number"
                min={1}
                max={500}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <label htmlFor="req-eta">
              Required By Date *
              <input
                id="req-eta"
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </label>
          </div>

          <div className="form-field-row">
            <label htmlFor="req-remarks">
              Fleet Requirements / Delivery Notes
              <textarea
                id="req-remarks"
                rows={3}
                placeholder="e.g. 30 units Glacier White, 20 units Caspian Blue. Prefer Chennai Plant delivery."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </label>
          </div>
        </DialogContent>

        <DialogActions className="dialog-actions-custom">
          <button type="button" className="btn-cancel" onClick={handleClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={submitting || !effectiveVehicle}>
            {submitting ? "Submitting..." : "Submit to Admin"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
