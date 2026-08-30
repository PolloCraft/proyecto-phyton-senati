import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}

function SectionTitle({ children, subtitle, align = "center" }: SectionTitleProps) {
  return (
    <div style={{ textAlign: align, marginBottom: "28px" }}>
      <h2 className="section-title">{children}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

export default SectionTitle;
