import { useMemo, useState, type FormEvent } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import { useCreateOrderMutation } from "../../../features/orders/ordersApi";
import type { Order, OrderItem } from "../../../types/order";
import { POPULAR_MODELS } from "../DashBoard/types";
import { parseCatalogPrice } from "../../../utils/vehiclePricing";
import "./CreateRequest.css";

type Props = {
  open: boolean;
  initialVehicle?: string;
  dealerId: string;
  onClose: () => void;
  onSubmitted: (order: Order) => void;
};

type VehicleRequestLine = {
  id: string;
  model: string;
  variant: string;
  color: string;
  quantity: number;
};

const VEHICLE_OPTIONS = ["Renault Kiger", "Renault Triber", "Renault Duster", "Renault Kwid", "Renault Arkana"];
const VARIANT_OPTIONS = ["RXL", "RXT", "RXZ", "RXZ Turbo"];
const COLOR_OPTIONS = ["Fiery Red", "Ice Cool White", "Caspian Blue", "Moonlight Silver", "Radiant Orange", "Metallic Black", "Glacier White"];
const CATALOG_MODELS_BY_NAME = new Map(POPULAR_MODELS.map((model) => [model.name, model]));
const LEGACY_MODEL_PRICES: Record<string, number> = { "Renault Arkana": 1450000 };

const getModelPrice = (model: string) =>
  parseCatalogPrice(CATALOG_MODELS_BY_NAME.get(model)?.startingPrice) ?? LEGACY_MODEL_PRICES[model] ?? 0;

const createLine = (model = ""): VehicleRequestLine => ({
  id: `${Date.now()}-${Math.random()}`,
  model,
  variant: "",
  color: "",
  quantity: 1,
});

export default function CreateRequestDialog({ open, initialVehicle = "", dealerId, onClose, onSubmitted }: Props) {
  const [createOrder] = useCreateOrderMutation();
  const [vehicles, setVehicles] = useState<VehicleRequestLine[]>([createLine(initialVehicle)]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const estimatedTotal = useMemo(
    () => vehicles.reduce((total, vehicle) => total + getModelPrice(vehicle.model) * vehicle.quantity, 0),
    [vehicles],
  );
  const totalQuantity = vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0);
  const minimumDate = new Date().toISOString().slice(0, 10);

  const reset = () => {
    setVehicles([createLine("")]);
    setDeliveryDate("");
    setNotes("");
    setValidationError("");
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      onClose();
    }
  };

  const updateVehicle = (id: string, changes: Partial<VehicleRequestLine>) => {
    setVehicles((current) => current.map((vehicle) => vehicle.id === id ? { ...vehicle, ...changes } : vehicle));
    setValidationError("");
  };

  const removeVehicle = (id: string) => {
    setVehicles((current) => current.length === 1 ? current : current.filter((vehicle) => vehicle.id !== id));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const hasInvalidVehicle = vehicles.some((vehicle) => (
      !vehicle.model || !vehicle.variant || !vehicle.color || !Number.isInteger(vehicle.quantity) || vehicle.quantity < 1
    ));
    if (hasInvalidVehicle || !deliveryDate) {
      setValidationError("Complete the model, variant, color, quantity, and delivery date for every vehicle.");
      return;
    }

    setSubmitting(true);
    setValidationError("");
    const orderDate = new Date().toISOString();
    const items: OrderItem[] = vehicles.map((vehicle, index) => ({
      id: `${index + 1}`,
      model: vehicle.model,
      variant: vehicle.variant,
      color: vehicle.color,
      quantity: vehicle.quantity,
      startingPrice: CATALOG_MODELS_BY_NAME.get(vehicle.model)?.startingPrice,
      unitPrice: getModelPrice(vehicle.model) || undefined,
      specs: {},
    }));
    const datePart = orderDate.slice(0, 10).replace(/-/g, "");
    const timePart = orderDate.slice(11, 19).replace(/:/g, "");
    const milliseconds = orderDate.slice(20, 23);
    const newOrder: Omit<Order, "id"> = {
      requestNumber: `REQ-${dealerId}-${datePart}-${timePart}-${milliseconds}`,
      dealerId,
      vehicleModel: vehicles.map((vehicle) => vehicle.model).join(", "),
      quantity: totalQuantity,
      status: "Pending Manufacturer Review",
      currentOwner: "Manufacturer",
      workflowHistory: [{
        status: "Dealer Request Created",
        timestamp: orderDate,
        owner: "Dealer",
        remarks: notes.trim() || undefined,
      }, {
        status: "Pending Manufacturer Review",
        timestamp: orderDate,
        owner: "Manufacturer",
      }],
      notifications: [{
        role: "Manufacturer",
        message: "New dealer request is ready for review.",
        createdAt: orderDate,
        read: false,
      }],
      orderDate,
      etaDelivery: deliveryDate,
      remarks: notes.trim() || undefined,
      items,
      estimatedTotal,
    };

    try {
      const createdOrder = await createOrder(newOrder).unwrap();
      setSubmitting(false);
      reset();
      onSubmitted(createdOrder);
    } catch (error) {
      setSubmitting(false);
      setValidationError(error instanceof Error ? error.message : "Unable to route the request to Finance Head.");
    }
  };

  return (
    <Dialog key={`${open}-${initialVehicle}`} open={open} onClose={handleClose} fullWidth maxWidth="md" aria-labelledby="create-request-title">
      <DialogTitle id="create-request-title" className="dialog-header-custom">
        <div>
          <strong>Quick Request</strong>
          <p>Add one or more vehicles for Finance Head approval</p>
        </div>
        <IconButton onClick={handleClose} disabled={submitting} aria-label="Close"><CloseIcon /></IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="dialog-form-body">
          <section className="request-vehicle-list" aria-labelledby="vehicle-details-title">
            <div className="request-section-heading">
              <div><h3 id="vehicle-details-title">Vehicle Details</h3><p>All fields are required for each vehicle.</p></div>
              <strong>{vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"}</strong>
            </div>
            {vehicles.map((vehicle, index) => (
              <div className="request-vehicle-card" key={vehicle.id}>
                <div className="request-vehicle-card-heading">
                  <strong>Vehicle {index + 1}</strong>
                  {vehicles.length > 1 && (
                    <button type="button" className="request-remove-button" onClick={() => removeVehicle(vehicle.id)}>
                      <DeleteOutlineIcon fontSize="small" /> Remove
                    </button>
                  )}
                </div>
                <div className="form-field-columns request-vehicle-fields">
                  <label htmlFor={`req-model-${vehicle.id}`}>Model *
                    <select id={`req-model-${vehicle.id}`} required value={vehicle.model} onChange={(event) => updateVehicle(vehicle.id, { model: event.target.value })}>
                      <option value="" disabled>Select model</option>
                      {VEHICLE_OPTIONS.map((model) => <option key={model} value={model}>{model}</option>)}
                    </select>
                  </label>
                  <label htmlFor={`req-variant-${vehicle.id}`}>Variant *
                    <select id={`req-variant-${vehicle.id}`} required value={vehicle.variant} onChange={(event) => updateVehicle(vehicle.id, { variant: event.target.value })}>
                      <option value="" disabled>Select variant</option>
                      {VARIANT_OPTIONS.map((variant) => <option key={variant} value={variant}>{variant}</option>)}
                    </select>
                  </label>
                  <label htmlFor={`req-color-${vehicle.id}`}>Color *
                    <select id={`req-color-${vehicle.id}`} required value={vehicle.color} onChange={(event) => updateVehicle(vehicle.id, { color: event.target.value })}>
                      <option value="" disabled>Select color</option>
                      {COLOR_OPTIONS.map((color) => <option key={color} value={color}>{color}</option>)}
                    </select>
                  </label>
                  <label htmlFor={`req-quantity-${vehicle.id}`}>Quantity *
                    <input id={`req-quantity-${vehicle.id}`} type="number" min={1} max={500} step={1} required value={vehicle.quantity} onChange={(event) => updateVehicle(vehicle.id, { quantity: Number(event.target.value) })} />
                  </label>
                </div>
                <span className="request-line-estimate">
                  Estimated line amount: <strong>₹{(getModelPrice(vehicle.model) * vehicle.quantity).toLocaleString("en-IN")}</strong>
                </span>
              </div>
            ))}
            <button type="button" className="request-add-button" onClick={() => setVehicles((current) => [...current, createLine()])}>
              <AddIcon fontSize="small" /> Add Another Vehicle
            </button>
          </section>

          <div className="form-field-columns">
            <label htmlFor="req-delivery-date">Delivery Date *
              <input id="req-delivery-date" type="date" required min={minimumDate} value={deliveryDate} onChange={(event) => { setDeliveryDate(event.target.value); setValidationError(""); }} />
            </label>
            <div className="request-total-card" aria-live="polite">
              <span>Total Estimated Order Amount</span>
              <strong>₹{estimatedTotal.toLocaleString("en-IN")}</strong>
              <small>{totalQuantity} total units • indicative pricing</small>
            </div>
          </div>

          <div className="form-field-row">
            <label htmlFor="req-notes">Notes
              <textarea id="req-notes" rows={3} placeholder="Add delivery preferences or other fleet requirements." value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
          </div>
          {validationError && <p className="request-validation-error" role="alert">{validationError}</p>}
        </DialogContent>

        <DialogActions className="dialog-actions-custom">
          <button type="button" className="btn-cancel" onClick={handleClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? "Sending to Finance Head..." : "Send to Finance Head"}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
