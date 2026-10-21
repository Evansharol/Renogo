import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { useState } from "react";
import { useFleetCart } from "../useFleetCart";
import { createOrder } from "../../../api/orders";
import type { Order } from "../../../types/order";
import "./FleetCartDrawer.css";

type Props = {
  open: boolean;
  dealerId: string;
  onSubmitted?: (order: Order) => void;
  onClose: () => void;
};

const PRICE_BY_MODEL: Record<string, number> = {
  "Renault Kiger": 950000,
  "Renault Triber": 850000,
  "Renault Duster": 1200000,
  "Renault Kwid": 650000,
  "Renault Arkana": 1450000,
};

export default function FleetCartDrawer({ open, dealerId, onSubmitted, onClose }: Props) {
  const { cart, clearCart, updateQuantity, removeFromCart, totalModels, totalVehicles } = useFleetCart();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const estimatedTotal = cart.reduce((total, item) => total + (PRICE_BY_MODEL[item.model] ?? Number.parseInt(item.startingPrice?.replace(/[^0-9]/g, "") ?? "0", 10)) * item.quantity, 0);

  const handleSubmit = async () => {
    if (!cart.length) {
      setError("Add at least one vehicle before submitting.");
      return;
    }
    if (!deliveryDate) {
      setError("Select a required delivery date.");
      return;
    }
    setSubmitting(true);
    setError("");
    const requestNumber = `REQ-${dealerId}-${deliveryDate.replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const order: Order = {
      id: "",
      requestNumber,
      dealerId,
      vehicleModel: cart.map((item) => `${item.model} - ${item.variant} (${item.quantity})`).join(", "),
      quantity: totalVehicles,
      status: "Pending Manufacturer Review",
      currentOwner: "Manufacturer",
      workflowHistory: [{
        status: "Dealer Request Created",
        timestamp: new Date().toISOString(),
        owner: "Dealer",
        remarks: notes.trim() || undefined,
      }, {
        status: "Pending Manufacturer Review",
        timestamp: new Date().toISOString(),
        owner: "Manufacturer",
      }],
      notifications: [{
        role: "Manufacturer",
        message: "New dealer request is ready for review.",
        createdAt: new Date().toISOString(),
        read: false,
      }],
      orderDate: new Date().toISOString(),
      etaDelivery: deliveryDate,
      remarks: notes.trim() || undefined,
      items: cart,
      estimatedTotal,
    };
    try {
      const createdOrder = await createOrder(order);
      onSubmitted?.(createdOrder);
      clearCart();
      setDeliveryDate("");
      setNotes("");
      onClose();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send the request to Finance Head.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: "fleet-cart-drawer-paper",
        },
      }}
    >
      <div className="fleet-cart-container">
        {/* Drawer Header */}
        <header className="fleet-cart-header">
          <div className="fleet-cart-header-title">
            <span className="cart-eyebrow">Fleet Procurement</span>
            <h2>Order Cart</h2>
            <span className="cart-badge">{totalModels} Models ({totalVehicles} Vehicles)</span>
          </div>
          <IconButton onClick={onClose} aria-label="Close cart" size="small">
            <CloseIcon />
          </IconButton>
        </header>

        {/* Cart Items List */}
        <div className="fleet-cart-body">
          {cart.length === 0 ? (
            <div className="fleet-cart-empty">
              <div className="empty-cart-icon">
                <DirectionsCarOutlinedIcon />
              </div>
              <h3>Your fleet order cart is empty</h3>
              <p>Browse the Renault Vehicle Catalog, select quantities, and click &ldquo;Add to Order&rdquo; to build your procurement request.</p>
              <button type="button" className="continue-shopping-btn" onClick={onClose}>
                Browse Vehicle Catalog
              </button>
            </div>
          ) : (
            <div className="fleet-cart-items-list">
              {cart.map((item) => (
                <article key={item.id} className="fleet-cart-card">
                  {item.image && (
                    <div className="cart-item-thumb">
                      <img src={item.image} alt={item.model} />
                    </div>
                  )}

                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <div>
                        <h4 className="cart-item-model">{item.model}</h4>
                        <span className="cart-item-variant">Variant: {item.variant}</span>
                        {item.color && (
                          <span className="cart-item-colour">
                            <span
                              className="cart-colour-dot"
                              style={{ backgroundColor: item.colorHex ?? "#888" }}
                            />
                            {item.color}
                          </span>
                        )}
                      </div>
                      <IconButton
                        size="small"
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.model} from order`}
                        title="Remove vehicle"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </div>

                    {/* Specifications */}
                    {item.specs && (
                      <div className="cart-item-specs-pills">
                        {item.specs.engine && <span>{item.specs.engine}</span>}
                        {item.specs.transmission && <span>{item.specs.transmission}</span>}
                        {item.specs.fuel && <span>{item.specs.fuel}</span>}
                        {item.specs.seating && <span>{item.specs.seating}</span>}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="cart-item-bottom">
                      <span className="qty-label">Quantity:</span>
                      <div className="cart-qty-selector">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <RemoveIcon fontSize="small" />
                        </button>
                        <input
                          type="number"
                          className="qty-input"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) {
                              updateQuantity(item.id, val);
                            }
                          }}
                          aria-label="Item quantity"
                        />
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <AddIcon fontSize="small" />
                        </button>
                      </div>
                      <span className="qty-unit-tag">{item.quantity} Units</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <footer className="fleet-cart-footer">
            <div className="cart-summary-counts">
              <div>
                <span>Selected Models</span>
                <strong>{totalModels}</strong>
              </div>
              <div>
                <span>Total Fleet Units</span>
                <strong>{totalVehicles} Vehicles</strong>
              </div>
              <div>
                <span>Estimated Amount</span>
                <strong>₹{estimatedTotal.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className="cart-request-fields">
              <label htmlFor="cart-delivery-date">Required delivery date *
                <input id="cart-delivery-date" type="date" min={new Date().toISOString().slice(0, 10)} value={deliveryDate} onChange={(event) => { setDeliveryDate(event.target.value); setError(""); }} />
              </label>
              <label htmlFor="cart-notes">Notes / special instructions
                <textarea id="cart-notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add delivery preferences or fleet requirements." />
              </label>
            </div>
            {error && <p className="cart-submit-error" role="alert">{error}</p>}
            <div className="cart-footer-buttons">
              <button type="button" className="cart-continue-btn" onClick={onClose}>
                Continue Shopping
              </button>
              <button type="button" className="cart-review-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Sending..." : "Submit Request"}
              </button>
            </div>
          </footer>
        )}
      </div>
    </Drawer>
  );
}
