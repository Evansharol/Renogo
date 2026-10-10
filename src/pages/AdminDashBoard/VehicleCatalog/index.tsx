import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
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

    const filteredVehicles = useMemo(() => {
        return vehicles.filter((vehicle) => (
            (selectedModel === "all" || vehicle.name === selectedModel) &&
            (selectedVariant === "all" || vehicle.variant === selectedVariant) &&
            (selectedColor === "all" || vehicle.color === selectedColor) &&
            (selectedAvailability === "all" || vehicle.status === selectedAvailability)
        ));
    }, [selectedAvailability, selectedColor, selectedModel, selectedVariant, vehicles]);
    const models = [...new Set(vehicles.map((vehicle) => vehicle.name))];
    const variants = [...new Set(vehicles.map((vehicle) => vehicle.variant))];
    const colors = [...new Set(vehicles.map((vehicle) => vehicle.color))];
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
                        <button type="button" className="add-vehicle-button"><AddIcon /> Add Vehicle</button>
                    </header>

                    <section className="catalog-filters" aria-label="Vehicle filters">
                        <label><span>Model</span><select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}><option value="all">All Models</option>{models.map((model) => <option key={model} value={model}>{model}</option>)}</select></label>
                        <label><span>Variant</span><select value={selectedVariant} onChange={(event) => setSelectedVariant(event.target.value)}><option value="all">All Variants</option>{variants.map((variant) => <option key={variant} value={variant}>{variant}</option>)}</select></label>
                        <label><span>Color</span><select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}><option value="all">All Colors</option>{colors.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
                        <label><span>Availability</span><select value={selectedAvailability} onChange={(event) => setSelectedAvailability(event.target.value)}><option value="all">All</option><option value="Available">Available</option><option value="Low Stock">Low Stock</option><option value="Limited">Limited</option></select></label>
                    </section>

                    <section className="catalog-summary" aria-label="Catalog summary">
                        <div className="catalog-summary-card vehicles-card"><DirectionsCarIcon /><span>Total Vehicles<strong>{vehicles.length}</strong></span></div>
                        <div className="catalog-summary-card stock-card"><Inventory2OutlinedIcon /><span>Total Available Stock<strong>{vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0)}</strong></span></div>
                        <div className="catalog-summary-card models-card"><DirectionsCarIcon /><span>Models Available<strong>{models.length}</strong></span></div>
                    </section>

                    <section className="catalog-table-card" aria-label="Vehicle catalog table">
                        {isLoading && <p>Loading vehicle catalog...</p>}
                        {error && <p role="alert">{error}</p>}
                        <table className="catalog-table">
                        <thead><tr><th>Vehicle Name</th><th>Model</th><th>Colour</th><th>Quantity</th><th>status</th></tr></thead>
                            <tbody>
                            {filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.code}>
                                    <td className="vehicle-name">{vehicle.name}</td><td>{vehicle.code}</td>
                                    <td><span className={`color-dot ${vehicle.colorClass}`} />{vehicle.color}</td><td>{vehicle.quantity}</td>
                                    <td><span className={`status-badge ${vehicle.status.toLowerCase().replace(" ", "-")}`}>{vehicle.status}</span></td>
                                    </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
}