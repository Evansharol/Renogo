import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import AddVehicleDialog from "./AddVehicleDialog";
import StockDetailsDialog from "./StockDetailsDialog";
import type { Stock, VehicleStock } from "./types";
import kwidImage from "../../../assets/dealer/kwid.jpg";
import kigerImage from "../../../assets/dealer/kiger.jpg";
import triberImage from "../../../assets/dealer/triber.jpg";
import dusterImage from "../../../assets/dealer/duster.jpg";
import rafale from "../../../assets/rafale.png";
import zoe from "../../../assets/zoe.jpg";
import clio from "../../../assets/clio.jpg";
import twingo from "../../../assets/twingo.jpg";
import megane from "../../../assets/megane.jpg";
import etech from "../../../assets/etech.jpg";
import { useLocation } from "react-router-dom";
import "../../AdminDashBoard/Dashboard/Dashboard.css";
import "../../AdminDashBoard/VehicleCatalog/VehicleCatalog.css";
import "./Stocks.css";

type LoginState = {
  name?: string;
};

const vehicleImages: Record<string, string> = {
  "Renault Kwid": kwidImage, "Renault Kiger": kigerImage, "Renault Triber": triberImage,
  "Renault Duster": dusterImage,"Renault Zoe": zoe,"Renault Clio": clio,"Renault Mégane": megane,
  "Renault twingo": twingo,"Renault Rafale": rafale, "Mégane E-Tech Electric": etech, "Renault Koleos": dusterImage,
};

export default function ManufacturerStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStock | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [fuelType, setFuelType] = useState("all");
  const [transmission, setTransmission] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [vehicleImagesByName, setVehicleImagesByName] = useState(vehicleImages);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleVariant, setNewVehicleVariant] = useState("");
  const [newVehicleColor, setNewVehicleColor] = useState("");
  const [newVehicleQuantity, setNewVehicleQuantity] = useState("");
  const [newVehicleImage, setNewVehicleImage] = useState<File | null>(null);
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [editVehicleName, setEditVehicleName] = useState("");
  const [editVehicleQuantity, setEditVehicleQuantity] = useState("");

  useEffect(() => {
    fetch("/api/vehicle.json")
      .then((response) => response.json() as Promise<Stock[]>)
      .then(setStocks)
      .catch(() => setStocks([]));
  }, []);

  const filteredStocks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return stocks.filter((stock) => {
      const matchesSearch = !query || [stock.name, stock.code, stock.variant, stock.category]
        .some((value) => value.toLowerCase().includes(query));

      return matchesSearch &&
        (category === "all" || stock.category === category) &&
        (fuelType === "all" || stock.fuelType === fuelType) &&
        (transmission === "all" || stock.transmission === transmission) &&
        (availability === "all" || stock.status === availability);
    });
  }, [availability, category, fuelType, searchTerm, stocks, transmission]);

  const vehicleStocks = useMemo(() => {
    const grouped = new Map<string, VehicleStock>();

    filteredStocks.forEach((stock) => {
      const current = grouped.get(stock.name);
      if (current) {
        current.quantity += stock.quantity;
        current.variants.push(stock.variant);
        current.colors.push({ name: stock.color, quantity: stock.quantity, colorClass: stock.colorClass });
        if (current.status !== "Available" && stock.status === "Available") current.status = stock.status;
      } else {
        grouped.set(stock.name, {
          name: stock.name,
          image: vehicleImagesByName[stock.name] ?? "",
          category: stock.category,
          fuelType: stock.fuelType,
          transmission: stock.transmission,
          quantity: stock.quantity,
          status: stock.status,
          variants: [stock.variant],
          colors: [{ name: stock.color, quantity: stock.quantity, colorClass: stock.colorClass }],
        });
      }
    });

    return [...grouped.values()];
  }, [filteredStocks, vehicleImagesByName]);

  const categories = [...new Set(stocks.map((stock) => stock.category))];
  const fuelTypes = [...new Set(stocks.map((stock) => stock.fuelType))];
  const transmissions = [...new Set(stocks.map((stock) => stock.transmission))];

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setFuelType("all");
    setTransmission("all");
    setAvailability("all");
  };

  const closeAddVehicleDialog = () => {
    setIsAddVehicleOpen(false);
    setNewVehicleName("");
    setNewVehicleVariant("");
    setNewVehicleColor("");
    setNewVehicleQuantity("");
    setNewVehicleImage(null);
  };

  const openEditStock = () => {
    if (!selectedVehicle) return;
    setEditVehicleName(selectedVehicle.name);
    setEditVehicleQuantity(String(selectedVehicle.quantity));
    setIsEditingStock(true);
  };

  const closeStockDetails = () => {
    setSelectedVehicle(null);
    setIsEditingStock(false);
  };

  const saveStockEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedVehicle) return;

    const name = editVehicleName.trim();
    const quantity = Number(editVehicleQuantity);
    if (!name || !Number.isInteger(quantity) || quantity < 0) return;

    const matchingStocks = stocks.filter((stock) => stock.name === selectedVehicle.name);
    const currentTotal = matchingStocks.reduce((total, stock) => total + stock.quantity, 0);
    let remainingQuantity = quantity;
    const updatedStocks = stocks.map((stock) => {
      if (stock.name !== selectedVehicle.name) return stock;

      const isLastMatchingStock = matchingStocks[matchingStocks.length - 1].code === stock.code;
      const nextQuantity = isLastMatchingStock
        ? remainingQuantity
        : currentTotal > 0
          ? Math.floor((stock.quantity / currentTotal) * quantity)
          : 0;
      remainingQuantity -= nextQuantity;
      return { ...stock, name, quantity: Math.max(0, nextQuantity) };
    });

    setStocks(updatedStocks);
    setVehicleImagesByName((current) => {
      if (name === selectedVehicle.name) return current;
      const next = { ...current, [name]: current[selectedVehicle.name] ?? "" };
      delete next[selectedVehicle.name];
      return next;
    });
    closeStockDetails();
  };

  const deleteStock = () => {
    if (!selectedVehicle || !window.confirm(`Delete all stock entries for ${selectedVehicle.name}?`)) return;
    setStocks((current) => current.filter((stock) => stock.name !== selectedVehicle.name));
    closeStockDetails();
  };

  const location = useLocation();
  const stored = localStorage.getItem("loginState");
  const loginState = (location.state as LoginState | null) ?? (stored ? JSON.parse(stored) as LoginState : null);
  const manufacturerName = loginState?.name ?? "Manufacturer";

  const addVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = newVehicleName.trim();
    const variant = newVehicleVariant.trim();
    const color = newVehicleColor.trim();
    const quantity = Number(newVehicleQuantity);

    if (!name || !variant || !color || !newVehicleImage || !Number.isInteger(quantity) || quantity <= 0) {
      return;
    }
    const imageUrl = URL.createObjectURL(newVehicleImage);
    const colorClass = color.toLowerCase().replace(/[^a-z]/g, "");
    setVehicleImagesByName((current) => ({ ...current, [name]: imageUrl }));
    setStocks((current) => [
      ...current,
      {
        name, code: `${name.replace(/[^a-z0-9]/gi, "").toUpperCase()}-${Date.now()}`, variant,
        category: "Other",fuelType: "Petrol",transmission: "Manual",color, colorClass,quantity,status: "Available",
      },
    ]);
    closeAddVehicleDialog();
  };

  return (
    <div className="admin-layout">
      <Sidebar variant="manufacturer" />
      <div className="admin-content">
        <Navbar adminName={manufacturerName} />
        <main className="admin-main">
          <div className="stock-page-heading">
            <h1>Stocks</h1>
            <button type="button" className="add-stock-button" onClick={() => setIsAddVehicleOpen(true)}>
              <AddIcon /> Add Vehicle
            </button>
          </div>
          <section className="stock-filters" aria-label="Search and filter stocks">
            <label className="stock-search">
              <span>Search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by vehicle name, model, category"
              />
            </label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="all">All Categories</option>
                {categories.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Fuel Type</span>
              <select value={fuelType} onChange={(event) => setFuelType(event.target.value)}>
                <option value="all">All Fuel Types</option>
                {fuelTypes.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Transmission</span>
              <select value={transmission} onChange={(event) => setTransmission(event.target.value)}>
                <option value="all">All Transmissions</option>
                {transmissions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              <span>Availability Status</span>
              <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
                <option value="all">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Limited">Limited</option>
              </select>
            </label>
            <button type="button" className="reset-stock-filters" onClick={resetFilters}>Reset Filters</button>
          </section>
          <section className="manufacturer-stock-grid" aria-label="Manufacturer vehicle stocks">
            {vehicleStocks.map((vehicle) => (
              <article
                key={vehicle.name}
                className="manufacturer-stock-card"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedVehicle(vehicle)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedVehicle(vehicle);
                  }
                }} >
                <div className="manufacturer-stock-image">
                  {vehicle.image && <img src={vehicle.image} alt={vehicle.name} loading="lazy" />}
                  <span className={`manufacturer-stock-status ${vehicle.status.toLowerCase().replace(" ", "-")}`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="manufacturer-stock-content">
                  <h2>{vehicle.name}</h2>
                  <p>{vehicle.category} · {vehicle.fuelType}</p>
                  <div className="manufacturer-stock-meta">
                    <p>{vehicle.transmission} · {vehicle.variants.length} variants</p>
                    <div className="manufacturer-stock-colours" aria-label="Available colours">
                      {vehicle.colors.map((color, index) => (
                        <span
                          key={`${color.name}-${index}`}
                          className={`stock-colour-dot ${color.colorClass ?? ""}`}
                          title={color.name}
                          aria-label={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="manufacturer-stock-total">
                    <span>Available Quantity</span>
                    <strong>{vehicle.quantity} Units</strong>
                  </div>
                  <button type="button" className="manufacturer-stock-details" onClick={(event) => {
                    event.stopPropagation();
                    setSelectedVehicle(vehicle);
                  }}>
                    View Details
                  </button>
                </div>
              </article>
            ))}
            {vehicleStocks.length === 0 && <p className="manufacturer-stock-empty">No stocks match the selected filters.</p>}
          </section>
        </main>
      </div>
      <AddVehicleDialog
        open={isAddVehicleOpen}
        name={newVehicleName}
        variant={newVehicleVariant}
        color={newVehicleColor}
        quantity={newVehicleQuantity}
        image={newVehicleImage}
        onClose={closeAddVehicleDialog}
        onSubmit={addVehicle}
        onNameChange={setNewVehicleName}
        onVariantChange={setNewVehicleVariant}
        onColorChange={setNewVehicleColor}
        onQuantityChange={setNewVehicleQuantity}
        onImageChange={setNewVehicleImage}
      />
      <StockDetailsDialog
        vehicle={selectedVehicle}
        editing={isEditingStock}
        editName={editVehicleName}
        editQuantity={editVehicleQuantity}
        onClose={closeStockDetails}
        onEdit={openEditStock}
        onDelete={deleteStock}
        onSave={saveStockEdit}
        onEditNameChange={setEditVehicleName}
        onEditQuantityChange={setEditVehicleQuantity}
        onCancelEdit={() => setIsEditingStock(false)}
      />
    </div>
  );
}
