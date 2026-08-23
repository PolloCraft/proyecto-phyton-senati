import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  bg?: string;
}

function FeatureCard({ icon, title, description, bg = "#fff" }: FeatureCardProps) {
  return (
    <div className="feature-card" style={{ background: bg }}>
      <img src={icon} alt="" className="feature-card-icon" />
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{description}</p>
    </div>
  );
}

export default FeatureCard;
