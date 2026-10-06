import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

import { POPULAR_MODELS } from "../DashBoard/types";
import type { VehicleModelData } from "../DashBoard/types";
import "../Dealer.css";
import "./VehicleCatalog.css";

type Props = {
  onOrderRequest: (vehicleName: string) => void;
};

export default function DealerVehicleCatalog({ onOrderRequest }: Props) {
  const [viewing, setViewing] = useState<VehicleModelData | null>(null);

  return (
    <div className="dealer-catalog-view">
      {/* Header */}
      <div className="dealer-page-title-row">
        <div>
          <h1>Renault Vehicle Catalog</h1>
          <p>Explore current lineup, specifications, and raise fleet allocations directly.</p>
        </div>
        <button type="button" className="primary-request-btn" onClick={() => onOrderRequest(POPULAR_MODELS[0].name)}>
          <AddIcon /> Request Fleet Order
        </button>
      </div>

      {/* Vehicle Grid */}
      <div className="catalog-grid-cards">
        {POPULAR_MODELS.map((car) => (
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
              <div className="catalog-specs-grid">
                {(Object.entries({ Engine: car.specs.engine, Transmission: car.specs.transmission, Fuel: car.specs.fuel, Stock: `${car.stockCount} Units` })).map(([k, v]) => (
                  <div key={k} className="spec-item">
                    <span>{k}</span>
                    <strong className={k === "Stock" ? "stock-highlight" : ""}>{v}</strong>
                  </div>
                ))}
              </div>
              <div className="catalog-actions-bar">
                <button type="button" className="catalog-details-btn" onClick={() => setViewing(car)}>View Details</button>
                <button type="button" className="catalog-order-btn"   onClick={() => onOrderRequest(car.name)}>Order for Fleet</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Vehicle Details Modal */}
      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="md" aria-labelledby="vehicle-spec-title">
        {viewing && (
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
                <div className="modal-vehicle-img">
                  <img src={viewing.image} alt={viewing.name} />
                </div>
                <div className="modal-vehicle-meta">
                  <div className="modal-price-box">
                    <span>Fleet Commercial Starting Price</span>
                    <strong>{viewing.startingPrice}</strong>
                  </div>
                  <p className="modal-vehicle-desc">{viewing.description}</p>
                  <div className="modal-specs-table">
                    {[
                      ["Available Stock",     `${viewing.stockCount} Units`],
                      ["Powertrain / Engine", viewing.specs.engine],
                      ["Transmission",        viewing.specs.transmission],
                      ["Fuel Type",           viewing.specs.fuel],
                      ["Seating Capacity",    viewing.specs.seating],
                      ["Plant Inventory",     viewing.status],
                    ].map(([label, value]) => (
                      <div key={label} className="modal-spec-row">
                        <span>{label}</span>
                        <strong className={label === "Available Stock" || label === "Plant Inventory" ? "status-highlight" : ""}>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>

            <DialogActions className="dialog-actions-custom">
              <button type="button" className="btn-cancel" onClick={() => setViewing(null)}>Close</button>
              <button type="button" className="btn-submit" onClick={() => { setViewing(null); onOrderRequest(viewing.name); }}>
                <LocalShippingOutlinedIcon /> Raise Procurement Request
              </button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
