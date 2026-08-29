interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
  bg?: string;
}

function FeatureCard({ icon, title, desc, bg = "#fff" }: FeatureCardProps) {
  return (
    <div className="feature-card" style={{ background: bg }}>
      <img src={icon} alt="" className="feature-card-icon" />
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{desc}</p>
    </div>
  );
}

export default FeatureCard;
