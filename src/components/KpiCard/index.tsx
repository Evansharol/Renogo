import type { ReactNode } from "react";

export type KpiCardVariant = "blue" | "orange" | "green" | "purple";

type KpiCardProps = {
  label: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  variant: KpiCardVariant;
  onClick?: () => void;
  active?: boolean;
};

export default function KpiCard({
  label,
  value,
  subtitle,
  icon,
  variant,
  onClick,
  active,
}: KpiCardProps) {
  return (
    <article
      className={`manufacturer-kpi-card manufacturer-kpi-card--${variant}${active ? " manufacturer-kpi-card--active" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className="manufacturer-kpi-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="manufacturer-kpi-label">{label}</p>
        <p className="manufacturer-kpi-value">{value}</p>
        <p className="manufacturer-kpi-subtitle">{subtitle}</p>
      </div>
    </article>
  );
}
