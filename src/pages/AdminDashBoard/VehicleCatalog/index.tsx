import { useMemo, useState } from "react";
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

type Vehicle = {
    name: string;
    code: string;
    variant: string;
    color: string;
    colorClass: string;
    quantity: number;
    status: "Available" | "Low Stock" | "Limited";
};

const vehicles: Vehicle[] = [
    { name: "Renault Kwid", code: "KWID001", variant: "RXL", color: "Fiery Red", colorClass: "red", quantity: 120, status: "Available" },
    { name: "Renault Kwid", code: "KWID002", variant: "RXT", color: "Ice Cool White", colorClass: "white", quantity: 85, status: "Available" },
    { name: "Renault Triber", code: "TRB001", variant: "RXT", color: "Caspian Blue", colorClass: "blue", quantity: 60, status: "Available" },
    { name: "Renault Triber", code: "TRB002", variant: "RXZ", color: "Moonlight Silver", colorClass: "silver", quantity: 40, status: "Low Stock" },
    { name: "Renault Kiger", code: "KGR001", variant: "RXL", color: "Radiant Orange", colorClass: "orange", quantity: 75, status: "Available" },
    { name: "Renault Kiger", code: "KGR002", variant: "RXZ Turbo", color: "Metallic Black", colorClass: "black", quantity: 30, status: "Low Stock" },
    { name: "Renault Duster", code: "DST001", variant: "RXL", color: "Glacier White", colorClass: "white", quantity: 18, status: "Limited" },
    { name: "Renault Duster", code: "DST002", variant: "RXZ", color: "Slate Grey", colorClass: "grey", quantity: 25, status: "Available" },
];

export default function Admindb() {
    const location = useLocation();
    const loginState = location.state as LoginState | null;
    const adminName = loginState?.name ?? "Admin";
    const [selectedModel, setSelectedModel] = useState("all");
    const [selectedVariant, setSelectedVariant] = useState("all");
    const [selectedColor, setSelectedColor] = useState("all");
    const [selectedAvailability, setSelectedAvailability] = useState("all");
    const filteredVehicles = useMemo(() => {
        return vehicles.filter((vehicle) => (
            (selectedModel === "all" || vehicle.name === selectedModel) &&
            (selectedVariant === "all" || vehicle.variant === selectedVariant) &&
            (selectedColor === "all" || vehicle.color === selectedColor) &&
            (selectedAvailability === "all" || vehicle.status === selectedAvailability)
        ));
    }, [selectedAvailability, selectedColor, selectedModel, selectedVariant]);
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
                        <div className="catalog-summary-card vehicles-card"><DirectionsCarIcon /><span>Total Vehicles<strong>12</strong></span></div>
                        <div className="catalog-summary-card stock-card"><Inventory2OutlinedIcon /><span>Total Available Stock<strong>428</strong></span></div>
                        <div className="catalog-summary-card models-card"><DirectionsCarIcon /><span>Models Available<strong>6</strong></span></div>
                    </section>

                    <section className="catalog-table-card" aria-label="Vehicle catalog table">
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