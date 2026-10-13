import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import { useOutletContext } from "react-router-dom";

import { POPULAR_MODELS } from "../DashBoard/types";
import type { VehicleModelData } from "../DashBoard/types";
import type { DealerOutletContext } from "../index";
import { useFleetCart } from "../useFleetCart";
import FleetCartDrawer from "../components/FleetCartDrawer";
import type { OrderItem } from "../../../types/order";
import "../Dealer.css";
import "./VehicleCatalog.css";

// ── Model Variants ─────────────────────────────────────────────────────────────
const MODEL_VARIANTS: Record<string, string[]> = {
  kiger: ["RXZ Turbo", "RXL", "RXT"],
  triber: ["RXZ", "RXT", "RXL"],
  duster: ["RXZ", "RXL", "Adventure"],
  kwid: ["RXT", "RXL", "Climber"],
};

// ── Colour Palettes per model ──────────────────────────────────────────────────
type ColourOption = { name: string; hex: string };

const MODEL_COLOURS: Record<string, ColourOption[]> = {
  kiger: [
    { name: "Moonlight Silver",    hex: "#C0C0C8" },
    { name: "Fiery Red",           hex: "#C1201F" },
    { name: "Graphite Grey",       hex: "#4B4F54" },
    { name: "Ice Cool White",      hex: "#F4F5F7" },
    { name: "Zanskar Blue",        hex: "#1E4D8C" },
  ],
  triber: [
    { name: "Electric Blue",       hex: "#1C4FA0" },
    { name: "Cedar Brown",         hex: "#7B4A2D" },
    { name: "Metal Mustard",       hex: "#C9960A" },
    { name: "Pearl White",         hex: "#F0F0F0" },
    { name: "Lava Grey",           hex: "#5C5C5C" },
  ],
  duster: [
    { name: "Caspian Blue",        hex: "#1A3A5C" },
    { name: "Sandstorm Beige",     hex: "#C8A97E" },
    { name: "Midnight Black",      hex: "#1A1A1A" },
    { name: "Glacier White",       hex: "#EBEBEB" },
    { name: "Alien Green",         hex: "#4C7A40" },
  ],
  kwid: [
    { name: "Fiery Red",           hex: "#C1201F" },
    { name: "Zanskar Blue",        hex: "#1E4D8C" },
    { name: "Ice Cool White",      hex: "#F4F5F7" },
    { name: "Moonlight Silver",    hex: "#C0C0C8" },
    { name: "Graphite Grey",       hex: "#4B4F54" },
  ],
};

const DEFAULT_COLOURS: ColourOption[] = [
  { name: "Pearl White",    hex: "#F0F0F0" },
  { name: "Graphite Grey",  hex: "#4B4F54" },
  { name: "Fiery Red",      hex: "#C1201F" },
];

type Props = {
  onOrderRequest?: (vehicleName: string) => void;
};

export default function DealerVehicleCatalog({ onOrderRequest }: Props) {
  const { openRequest } = useOutletContext<DealerOutletContext>();
  const requestOrder = onOrderRequest ?? openRequest;

  const { addToCart, totalModels } = useFleetCart();

  const [viewing, setViewing] = useState<VehicleModelData | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Per-card states
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(POPULAR_MODELS.map((car) => [car.id, 5]))
  );
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() =>
    Object.fromEntries(POPULAR_MODELS.map((car) => [car.id, MODEL_VARIANTS[car.id]?.[0] || "Standard"]))
  );
  const [selectedColours, setSelectedColours] = useState<Record<string, ColourOption>>(() =>
    Object.fromEntries(
      POPULAR_MODELS.map((car) => {
        const palette = MODEL_COLOURS[car.id] ?? DEFAULT_COLOURS;
        return [car.id, palette[0]];
      })
    )
  );

  // Added animation state per car
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const getPalette = (carId: string) => MODEL_COLOURS[carId] ?? DEFAULT_COLOURS;

  const handleQuantityChange = (carId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[carId] || 1;
      return { ...prev, [carId]: Math.max(1, current + delta) };
    });
  };

  const handleCustomQuantityInput = (carId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [carId]: Math.max(1, isNaN(value) ? 1 : value) }));
  };

  const handleVariantChange = (carId: string, variant: string) => {
    setSelectedVariants((prev) => ({ ...prev, [carId]: variant }));
  };

  const handleColourChange = (carId: string, colour: ColourOption) => {
    setSelectedColours((prev) => ({ ...prev, [carId]: colour }));
  };

  const handleAddToCart = (car: VehicleModelData) => {
    const qty     = quantities[car.id] || 1;
    const variant = selectedVariants[car.id] || "Standard";
    const colour  = selectedColours[car.id] ?? getPalette(car.id)[0];

    const item: OrderItem = {
      id: `${car.id}-${variant.toLowerCase().replace(/\s+/g, "-")}-${colour.name.toLowerCase().replace(/\s+/g, "-")}`,
      model: car.name,
      variant,
      color: colour.name,
      colorHex: colour.hex,
      quantity: qty,
      image: car.image,
      startingPrice: car.startingPrice,
      specs: {
        engine:       car.specs.engine,
        transmission: car.specs.transmission,
        fuel:         car.specs.fuel,
        seating:      car.specs.seating,
      },
    };

    addToCart(item);

    setAddedMap((prev) => ({ ...prev, [car.id]: true }));
    setTimeout(() => setAddedMap((prev) => ({ ...prev, [car.id]: false })), 1500);
  };

  return (
    <div className="dealer-catalog-view">
      {/* Header */}
      <div className="dealer-page-title-row">
        <div>
          <h1>Renault Vehicle Catalog</h1>
          <p>Explore lineup specifications, select quantities and colours, and build a single fleet order with multiple vehicles.</p>
        </div>

        <div className="catalog-header-actions">
          <button
            type="button"
            className={`view-cart-header-btn ${totalModels > 0 ? "has-items" : ""}`}
            onClick={() => setIsCartOpen(true)}
            aria-label="View Order Cart"
          >
            <ShoppingCartOutlinedIcon />
            <span>View Cart</span>
            <span className="cart-counter-pill">{totalModels}</span>
          </button>

          <button
            type="button"
            className="primary-request-btn secondary-style"
            onClick={() => requestOrder(POPULAR_MODELS[0].name)}
            title="Create a quick single-model fleet request"
          >
            <AddIcon /> Quick Request
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="catalog-grid-cards">
        {POPULAR_MODELS.map((car) => {
          const qty            = quantities[car.id] || 1;
          const variantsList   = MODEL_VARIANTS[car.id] || ["Standard"];
          const currentVariant = selectedVariants[car.id] || variantsList[0];
          const palette        = getPalette(car.id);
          const currentColour  = selectedColours[car.id] ?? palette[0];
          const isAdded        = Boolean(addedMap[car.id]);

          return (
            <article key={car.id} className="catalog-full-card">
              <div className="catalog-img-container">
                <img src={car.image} alt={car.name} />
                <span className={`catalog-stock-tag ${car.status === "Available" ? "stock-ok" : "stock-low"}`}>
                  {car.status} • Stock: {car.stockCount}
                </span>
              </div>

              <div className="catalog-body">
                <div className="catalog-card-header">
                  <h2>{car.name}</h2>
                  <span className="catalog-price">{car.startingPrice}</span>
                </div>
                <p className="catalog-desc">{car.description}</p>

                {/* Specs Grid */}
                <div className="catalog-specs-grid">
                  {Object.entries({
                    Engine:       car.specs.engine,
                    Transmission: car.specs.transmission,
                    Fuel:         car.specs.fuel,
                    Seating:      car.specs.seating,
                  }).map(([k, v]) => (
                    <div key={k} className="spec-item">
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>

                {/* Variant, Colour & Quantity Config Row */}
                <div className="catalog-item-config-box">
                  {/* Variant */}
                  <div className="config-variant-select">
                    <label htmlFor={`variant-select-${car.id}`}>Variant:</label>
                    <select
                      id={`variant-select-${car.id}`}
                      value={currentVariant}
                      onChange={(e) => handleVariantChange(car.id, e.target.value)}
                    >
                      {variantsList.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="config-quantity-control">
                    <label htmlFor={`qty-input-${car.id}`}>Qty:</label>
                    <div className="catalog-qty-stepper">
                      <button type="button" className="stepper-btn" onClick={() => handleQuantityChange(car.id, -1)} disabled={qty <= 1} aria-label="Decrease quantity">
                        <RemoveIcon fontSize="small" />
                      </button>
                      <input
                        id={`qty-input-${car.id}`}
                        type="number"
                        className="stepper-input"
                        min="1"
                        value={qty}
                        onChange={(e) => handleCustomQuantityInput(car.id, parseInt(e.target.value, 10))}
                      />
                      <button type="button" className="stepper-btn" onClick={() => handleQuantityChange(car.id, 1)} aria-label="Increase quantity">
                        <AddIcon fontSize="small" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Colour Swatch Selector */}
                <div className="colour-selector-row">
                  <span className="colour-selector-label">
                    Colour: <strong>{currentColour.name}</strong>
                  </span>
                  <div className="colour-swatches">
                    {palette.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        className={`colour-swatch ${currentColour.name === col.name ? "selected" : ""}`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                        aria-label={`Select colour ${col.name}`}
                        onClick={() => handleColourChange(car.id, col)}
                      >
                        {currentColour.name === col.name && (
                          <CheckIcon sx={{ fontSize: 12, color: isLightColour(col.hex) ? "#1a1a1a" : "#ffffff" }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="catalog-actions-bar">
                  <button type="button" className="catalog-details-btn" onClick={() => setViewing(car)}>
                    View Details
                  </button>
                  <button
                    type="button"
                    className={`catalog-add-order-btn ${isAdded ? "is-added" : ""}`}
                    onClick={() => handleAddToCart(car)}
                  >
                    {isAdded ? (
                      <><CheckIcon fontSize="small" /> Added ({qty})</>
                    ) : (
                      <><AddShoppingCartIcon fontSize="small" /> Add to Order</>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Cart Drawer */}
      <FleetCartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Vehicle Details Modal */}
      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="md" aria-labelledby="vehicle-spec-title">
        {viewing && (() => {
          const palette       = getPalette(viewing.id);
          const currentColour = selectedColours[viewing.id] ?? palette[0];
          return (
            <>
              <DialogTitle id="vehicle-spec-title" className="dialog-header-custom">
                <div>
                  <strong>{viewing.name}</strong>
                  <p>{viewing.tagline}</p>
                </div>
                <IconButton onClick={() => setViewing(null)} aria-label="Close"><CloseIcon /></IconButton>
              </DialogTitle>

              <DialogContent className="vehicle-details-modal-content">
                <div className="vehicle-modal-layout">
                  {/* Car image with colour-tinted background hint */}
                  <div className="modal-vehicle-img" style={{ boxShadow: `0 0 0 3px ${currentColour.hex}33` }}>
                    <img src={viewing.image} alt={viewing.name} />
                  </div>

                  <div className="modal-vehicle-meta">
                    <div className="modal-price-box">
                      <span>Commercial Starting Price</span>
                      <strong>{viewing.startingPrice}</strong>
                    </div>
                    <p className="modal-vehicle-desc">{viewing.description}</p>

                    <div className="modal-specs-table">
                      {[
                        ["Available Stock",   `${viewing.stockCount} Units`],
                        ["Powertrain / Engine", viewing.specs.engine],
                        ["Transmission",       viewing.specs.transmission],
                        ["Fuel Type",          viewing.specs.fuel],
                        ["Seating Capacity",   viewing.specs.seating],
                      ].map(([label, val]) => (
                        <div key={label} className="modal-spec-row">
                          <span>{label}</span>
                          <strong>{val}</strong>
                        </div>
                      ))}
                    </div>

                    {/* Variant, Colour & Qty inside modal */}
                    <div className="modal-order-config-row">
                      {/* Variant */}
                      <div className="modal-variant-select">
                        <span>Variant:</span>
                        <select
                          value={selectedVariants[viewing.id] || "Standard"}
                          onChange={(e) => handleVariantChange(viewing.id, e.target.value)}
                        >
                          {(MODEL_VARIANTS[viewing.id] || ["Standard"]).map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Qty */}
                      <div className="modal-qty-select">
                        <span>Qty:</span>
                        <div className="catalog-qty-stepper">
                          <button type="button" className="stepper-btn" onClick={() => handleQuantityChange(viewing.id, -1)} disabled={(quantities[viewing.id] || 1) <= 1}>
                            <RemoveIcon fontSize="small" />
                          </button>
                          <input
                            type="number"
                            className="stepper-input"
                            min="1"
                            value={quantities[viewing.id] || 1}
                            onChange={(e) => handleCustomQuantityInput(viewing.id, parseInt(e.target.value, 10))}
                          />
                          <button type="button" className="stepper-btn" onClick={() => handleQuantityChange(viewing.id, 1)}>
                            <AddIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Colour Picker in modal */}
                    <div className="colour-selector-row modal-colour-row">
                      <span className="colour-selector-label">
                        Colour: <strong>{currentColour.name}</strong>
                      </span>
                      <div className="colour-swatches">
                        {palette.map((col) => (
                          <button
                            key={col.name}
                            type="button"
                            className={`colour-swatch ${currentColour.name === col.name ? "selected" : ""}`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                            aria-label={`Select colour ${col.name}`}
                            onClick={() => handleColourChange(viewing.id, col)}
                          >
                            {currentColour.name === col.name && (
                              <CheckIcon sx={{ fontSize: 12, color: isLightColour(col.hex) ? "#1a1a1a" : "#ffffff" }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>

              <DialogActions className="modal-actions-custom">
                <button
                  type="button"
                  className="modal-add-cart-btn"
                  onClick={() => {
                    handleAddToCart(viewing);
                    setViewing(null);
                    setIsCartOpen(true);
                  }}
                >
                  <AddShoppingCartIcon fontSize="small" /> Add to Order &amp; View Cart
                </button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </div>
  );
}

/** Returns true for light colours so checkmark uses dark ink */
function isLightColour(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}
