import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import "./VehicleCatalog.css";

type LoginState = {
    name?: string;
};

type VehicleStatus = "Available" | "Low Stock" | "Limited";

type Vehicle = {
    name: string;
    code: string;
    variant: string;
    color: string;
    colorClass: string;
    quantity: number;
    status: VehicleStatus;
};

export default function Admindb() {
    const location = useLocation();
    const loginState = location.state as LoginState | null;
    const adminName = loginState?.name ?? "Admin";
    const [selectedModel, setSelectedModel] = useState("all");
    const [selectedVariant, setSelectedVariant] = useState("all");
    const [selectedColor, setSelectedColor] = useState("all");
    const [selectedAvailability, setSelectedAvailability] = useState("all");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const response = await fetch("/api/vehicle.json");
                if (!response.ok) {
                    throw new Error(`Unable to load vehicle catalog (${response.status})`);
                }
                const data: unknown = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("Vehicle catalog response is invalid");
                }
                setVehicles(data as Vehicle[]);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Unable to load vehicle catalog");
            } finally {
                setIsLoading(false);
            }
        };

        void loadVehicles();
    }, []);

    // Distinct models from all vehicles
    const models = useMemo(() => {
        return [...new Set(vehicles.map((vehicle) => vehicle.name))].sort();
    }, [vehicles]);

    // Available variants based on selected model
    const availableVariants = useMemo(() => {
        const pool = selectedModel === "all" ? vehicles : vehicles.filter((v) => v.name === selectedModel);
        return [...new Set(pool.map((vehicle) => vehicle.variant))].sort();
    }, [vehicles, selectedModel]);

    // Available colors based on selected model and variant
    const availableColors = useMemo(() => {
        let pool = vehicles;
        if (selectedModel !== "all") {
            pool = pool.filter((v) => v.name === selectedModel);
        }
        if (selectedVariant !== "all") {
            pool = pool.filter((v) => v.variant === selectedVariant);
        }
        return [...new Set(pool.map((vehicle) => vehicle.color))].sort();
    }, [vehicles, selectedModel, selectedVariant]);

    // Handle Model change: also reset variant/color if they are no longer applicable
    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        if (model !== "all") {
            const applicableVariants = vehicles.filter((v) => v.name === model).map((v) => v.variant);
            if (selectedVariant !== "all" && !applicableVariants.includes(selectedVariant)) {
                setSelectedVariant("all");
            }
        }
    };

    // Handle Variant change: also reset color if no longer applicable
    const handleVariantChange = (variant: string) => {
        setSelectedVariant(variant);
        if (variant !== "all") {
            const applicableColors = vehicles
                .filter((v) => (selectedModel === "all" || v.name === selectedModel) && v.variant === variant)
                .map((v) => v.color);
            if (selectedColor !== "all" && !applicableColors.includes(selectedColor)) {
                setSelectedColor("all");
            }
        }
    };

    const handleResetFilters = () => {
        setSelectedModel("all");
        setSelectedVariant("all");
        setSelectedColor("all");
        setSelectedAvailability("all");
    };

    const isFiltered = selectedModel !== "all" || selectedVariant !== "all" || selectedColor !== "all" || selectedAvailability !== "all";

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((vehicle) => {
            const matchModel = selectedModel === "all" || vehicle.name.toLowerCase() === selectedModel.toLowerCase();
            const matchVariant = selectedVariant === "all" || vehicle.variant.toLowerCase() === selectedVariant.toLowerCase();
            const matchColor = selectedColor === "all" || vehicle.color.toLowerCase() === selectedColor.toLowerCase();
            const matchAvailability = selectedAvailability === "all" || vehicle.status.toLowerCase() === selectedAvailability.toLowerCase();
            return matchModel && matchVariant && matchColor && matchAvailability;
        });
    }, [selectedAvailability, selectedColor, selectedModel, selectedVariant, vehicles]);

    return (
        <div className="admin-layout">
            <Sidebar />

            <div className="admin-content">
                <Navbar adminName={adminName} />
                <main className="catalog-main">
                    <header className="catalog-heading">
                        <div>
                            <h1>Vehicle Catalog</h1>
                            <p>Browse Renault vehicles, check availability by plant and color, and manage fleet offerings.</p>
                        </div>
                    </header>

                    <section className="catalog-filters" aria-label="Vehicle filters">
                        <label>
                            <span>Model</span>
                            <select value={selectedModel} onChange={(event) => handleModelChange(event.target.value)}>
                                <option value="all">All Models</option>
                                {models.map((model) => <option key={model} value={model}>{model}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Variant</span>
                            <select value={selectedVariant} onChange={(event) => handleVariantChange(event.target.value)}>
                                <option value="all">All Variants</option>
                                {availableVariants.map((variant) => <option key={variant} value={variant}>{variant}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Color</span>
                            <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>
                                <option value="all">All Colors</option>
                                {availableColors.map((color) => <option key={color} value={color}>{color}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Availability</span>
                            <select value={selectedAvailability} onChange={(event) => setSelectedAvailability(event.target.value)}>
                                <option value="all">All</option>
                                <option value="Available">Available</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Limited">Limited</option>
                            </select>
                        </label>
                        <div className="filter-actions">
                            <button
                                type="button"
                                className="catalog-reset-btn"
                                onClick={handleResetFilters}
                                title="Reset all filters"
                                disabled={!isFiltered}
                            >
                                <RestartAltIcon fontSize="small" />
                                <span>Reset</span>
                            </button>
                        </div>
                    </section>

                    <section className="catalog-summary" aria-label="Catalog summary">
                        <div className="catalog-summary-card vehicles-card">
                            <DirectionsCarIcon />
                            <span>
                                Total Vehicles
                                <strong>
                                    {filteredVehicles.length}
                                    {isFiltered && <small style={{ fontWeight: 400, fontSize: "11px", color: "#64748b" }}> (of {vehicles.length})</small>}
                                </strong>
                            </span>
                        </div>
                        <div className="catalog-summary-card stock-card">
                            <Inventory2OutlinedIcon />
                            <span>
                                Total Available Stock
                                <strong>{filteredVehicles.reduce((total, vehicle) => total + vehicle.quantity, 0)}</strong>
                            </span>
                        </div>
                        <div className="catalog-summary-card models-card">
                            <DirectionsCarIcon />
                            <span>
                                Models Available
                                <strong>{[...new Set(filteredVehicles.map((v) => v.name))].length}</strong>
                            </span>
                        </div>
                    </section>

                    <section className="catalog-table-card" aria-label="Vehicle catalog table">
                        {isLoading && <p>Loading vehicle catalog...</p>}
                        {error && <p role="alert">{error}</p>}
                        <table className="catalog-table">
                            <thead>
                                <tr>
                                    <th>Vehicle Name</th>
                                    <th>Model Code</th>
                                    <th>Variant</th>
                                    <th>Colour</th>
                                    <th>Quantity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "#64748b" }}>
                                            No vehicles found matching the selected filters.{" "}
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                                            >
                                                Reset Filters
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle, idx) => (
                                        <tr key={`${vehicle.code}-${vehicle.color}-${vehicle.variant}-${idx}`}>
                                            <td className="vehicle-name">{vehicle.name}</td>
                                            <td>{vehicle.code}</td>
                                            <td><strong>{vehicle.variant}</strong></td>
                                            <td><span className={`color-dot ${vehicle.colorClass}`} />{vehicle.color}</td>
                                            <td>{vehicle.quantity}</td>
                                            <td><span className={`status-badge ${vehicle.status.toLowerCase().replace(" ", "-")}`}>{vehicle.status}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
}