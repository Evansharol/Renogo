import type { ReactNode } from "react";

export type KpiCardVariant = "blue" | "orange" | "green" | "purple";

type KpiCardProps = {
  label: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  variant: KpiCardVariant;
};

export default function KpiCard({
  label,
  value,
  subtitle,
  icon,
  variant,
}: KpiCardProps) {
  return (
    <article className={`manufacturer-kpi-card manufacturer-kpi-card--${variant}`}>
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
