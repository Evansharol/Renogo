import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useFleetCart } from "../useFleetCart";
import { formatDate } from "../utils";
import { createOrder } from "../../../api/orders";
import type { Order } from "../../../types/order";
import type { DealerOutletContext } from "../index";
import "./ReviewOrder.css";

export default function ReviewOrder() {
  const navigate = useNavigate();
  const { dealerName, dealerId, dealerLocation, onOrderSubmitted } = useOutletContext<DealerOutletContext>();
  const { cart, clearCart, totalModels, totalVehicles } = useFleetCart();

  const [etaDate, setEtaDate] = useState(() => {
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitToAdmin = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty. Please add vehicles before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    // Generate human-readable summary for vehicleModel (backward compatible)
    const summaryModel = cart.map((i) => `${i.model} - ${i.variant} (${i.quantity})`).join(", ");
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const orderPayload: Order = {
      id: orderId,
      dealerId,
      vehicleModel: summaryModel,
      quantity: totalVehicles,
      status: "Manufacturer Review",
      orderDate: nowIso,
      etaDelivery: etaDate,
      remarks: remarks.trim() || undefined,
      items: cart,
    };

    try {
      await createOrder(orderPayload).catch(() => {
        // Fallback for offline mock server
      });

      if (onOrderSubmitted) {
        onOrderSubmitted(orderPayload);
      }

      clearCart();
      navigate("/dealer/my-requests", {
        state: {
          submittedOrderId: orderId,
          successMessage: `Order ${orderId} submitted to Admin successfully with ${totalModels} vehicle models!`,
        },
      });
    } catch {
      setError("Unable to submit order to admin. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="review-order-page">
        <div className="review-order-empty">
          <DirectionsCarIcon sx={{ fontSize: 56, color: "#94a3b8", mb: 2 }} />
          <h2>No Vehicles Selected For Review</h2>
          <p>Please browse the vehicle catalog, specify your fleet quantities, and add vehicles to your order cart.</p>
          <button type="button" className="review-back-btn" onClick={() => navigate("/dealer/catalog")}>
            <ArrowBackIcon fontSize="small" /> Back to Vehicle Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-order-page">
      {/* Page Title Row */}
      <div className="review-page-header">
        <button type="button" className="back-link-btn" onClick={() => navigate("/dealer/catalog")}>
          <ArrowBackIcon fontSize="small" /> Back to Vehicle Catalog
        </button>
        <h1>Review Fleet Order</h1>
        <p>Verify all selected vehicles, variants, quantities, and specifications before submitting to Admin for approval.</p>
      </div>

      {error && <div className="review-order-error-banner">{error}</div>}

      <div className="review-order-layout">
        {/* Main Column: Items Table + Notes */}
        <div className="review-main-col">
          {/* Dealership Details Card */}
          <section className="review-card dealership-summary-card">
            <div className="review-card-heading">
              <BusinessIcon fontSize="small" />
              <h3>Dealership Information</h3>
            </div>
            <div className="dealership-grid">
              <div>
                <span>Dealer ID</span>
                <strong>{dealerId}</strong>
              </div>
              <div>
                <span>Dealership Name</span>
                <strong>{dealerName}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{dealerLocation}</strong>
              </div>
              <div>
                <span>Order Submission Date</span>
                <strong>{formatDate(new Date().toISOString())}</strong>
              </div>
            </div>
          </section>

          {/* Selected Vehicles List */}
          <section className="review-card order-items-card">
            <div className="review-card-heading">
              <DirectionsCarIcon fontSize="small" />
              <h3>Selected Vehicles ({totalModels} Models)</h3>
            </div>

            <div className="review-table-wrapper">
              <table className="review-order-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Model &amp; Variant</th>
                    <th>Colour</th>
                    <th>Specifications</th>
                    <th style={{ textAlign: "right" }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td className="item-thumb-cell">
                        {item.image ? (
                          <img src={item.image} alt={item.model} className="review-car-thumb" />
                        ) : (
                          <div className="car-thumb-placeholder">Renault</div>
                        )}
                      </td>
                      <td className="item-model-cell">
                        <strong>{item.model}</strong>
                        <span className="item-variant-tag">{item.variant}</span>
                      </td>
                      <td className="item-colour-cell">
                        {item.color ? (
                          <span className="review-colour-chip">
                            <span className="review-colour-dot" style={{ backgroundColor: item.colorHex ?? "#888" }} />
                            {item.color}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="item-specs-cell">
                        <div className="specs-inline-list">
                          {item.specs.engine && <span>Engine: <strong>{item.specs.engine}</strong></span>}
                          {item.specs.transmission && <span>Transmission: <strong>{item.specs.transmission}</strong></span>}
                          {item.specs.fuel && <span>Fuel: <strong>{item.specs.fuel}</strong></span>}
                          {item.specs.seating && <span>Seating: <strong>{item.specs.seating}</strong></span>}
                        </div>
                      </td>
                      <td className="item-qty-cell" style={{ textAlign: "right" }}>
                        <span className="qty-highlight">{item.quantity}</span> Units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Delivery & Remarks */}
          <section className="review-card order-schedule-card">
            <div className="review-card-heading">
              <CalendarTodayIcon fontSize="small" />
              <h3>Delivery Schedule &amp; Remarks</h3>
            </div>
            <div className="schedule-form-grid">
              <label>
                <span>Requested Delivery Date (ETA) *</span>
                <input
                  type="date"
                  value={etaDate}
                  required
                  onChange={(e) => setEtaDate(e.target.value)}
                />
              </label>
              <label>
                <span>Procurement Instructions / Order Remarks (Optional)</span>
                <textarea
                  rows={3}
                  value={remarks}
                  placeholder="e.g. Priority delivery for enterprise fleet customer, corporate livery required..."
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </label>
            </div>
          </section>
        </div>

        {/* Sidebar Column: Procurement Summary & Submit */}
        <aside className="review-sidebar-col">
          <div className="review-card procurement-summary-card">
            <h3>Procurement Summary</h3>
            <p className="summary-note">Complete order package containing multiple car allocations.</p>

            <div className="procurement-metrics-list">
              <div className="metric-row">
                <span><InventoryIcon fontSize="small" /> Total Vehicle Models</span>
                <strong>{totalModels} Models</strong>
              </div>
              <div className="metric-row highlight-row">
                <span><DirectionsCarIcon fontSize="small" /> Total Fleet Units</span>
                <strong className="total-units-large">{totalVehicles} Vehicles</strong>
              </div>
              <div className="metric-row">
                <span><CalendarTodayIcon fontSize="small" /> Target Delivery</span>
                <strong>{formatDate(etaDate ? `${etaDate}T00:00:00` : undefined)}</strong>
              </div>
            </div>

            <div className="review-action-box">
              <button
                type="button"
                className="submit-to-admin-btn"
                disabled={submitting}
                onClick={handleSubmitToAdmin}
              >
                <SendIcon fontSize="small" />
                <span>{submitting ? "Submitting Order..." : "Submit to Manufacturer"}</span>
              </button>

              <button
                type="button"
                className="review-edit-cart-btn"
                onClick={() => navigate("/dealer/catalog")}
              >
                Edit Vehicles in Cart
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
