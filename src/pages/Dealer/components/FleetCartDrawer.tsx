import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { useNavigate } from "react-router-dom";
import { useFleetCart } from "../useFleetCart";
import "./FleetCartDrawer.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FleetCartDrawer({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, totalModels, totalVehicles } = useFleetCart();

  const handleProceedToReview = () => {
    onClose();
    navigate("/dealer/review-order");
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
            </div>

            <div className="cart-footer-buttons">
              <button type="button" className="cart-continue-btn" onClick={onClose}>
                Continue Shopping
              </button>
              <button type="button" className="cart-review-btn" onClick={handleProceedToReview}>
                Review Order <ArrowForwardIcon fontSize="small" />
              </button>
            </div>
          </footer>
        )}
      </div>
    </Drawer>
  );
}
