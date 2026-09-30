import "./AvailableModels.css";
import Piechart from "./Piechart";

const models = [
	{ name: "Captur", value: 32, color: "#0088FE" },
	{ name: "Clio", value: 27, color: "#00C49F" },
	{ name: "Austral", value: 23, color: "#FFBB28" },
	{ name: "Arkana", value: 18, color: "#FF8042" },
];

export default function AvailableModels() {
	return (
		<article className="available-models-chart chart-card">
			<div className="chart-heading">
				<div>
					<h2>Available Models</h2>
					<p>Renault inventory by model</p>
				</div>
			</div>
			<div className="model-chart-content">
				<Piechart data={models} />
			</div>
		</article>
	);
}
