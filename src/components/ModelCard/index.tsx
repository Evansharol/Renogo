type ModelCardProps = {
  name: string;
  image: string;
  units: number;
  stockLevel: number;
  availability: "available" | "low";
};

export default function ModelCard({
  name,
  image,
  units,
  stockLevel,
  availability,
}: ModelCardProps) {
  const availabilityLabel = availability === "available" ? "Available" : "Low Stock";

  return (
    <article className="manufacturer-model-card">
      <div className="manufacturer-model-image">
        <img src={image} alt={name} loading="lazy" />
      </div>
      <div className="manufacturer-model-content">
        <div className="manufacturer-model-heading">
          <h3>{name}</h3>
          <span className={`manufacturer-stock-badge manufacturer-stock-badge--${availability}`}>
            {availabilityLabel}
          </span>
        </div>
        <p className="manufacturer-model-units">
          Available Units: <strong>{units}</strong>
        </p>
        <div className="manufacturer-stock-progress" aria-label={`${stockLevel}% stock level`}>
          <span
            className={`manufacturer-stock-progress-bar manufacturer-stock-progress-bar--${availability}`}
            style={{ width: `${stockLevel}%` }}
          />
        </div>
      </div>
    </article>
  );
}
