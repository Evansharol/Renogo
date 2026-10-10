type AvailabilityProgressBarProps = {
  available: number;
  manufacturing: number;
  total: number;
};

export default function AvailabilityProgressBar({
  available,
  manufacturing,
  total,
}: AvailabilityProgressBarProps) {
  const availablePercentage = total ? Math.round((available / total) * 100) : 0;
  const manufacturingPercentage = total ? Math.round((manufacturing / total) * 100) : 0;

  return (
    <div
      className="manufacturer-allocation-bar"
      aria-label={`${availablePercentage}% available, ${manufacturingPercentage}% manufacturing`}
    >
      <span
        className="manufacturer-allocation-bar-available"
        style={{ width: `${availablePercentage}%` }}
      />
      <span
        className="manufacturer-allocation-bar-manufacturing"
        style={{ width: `${manufacturingPercentage}%` }}
      />
    </div>
  );
}
