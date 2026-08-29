interface TechGroupProps {
  category: string;
  items: string[];
}

function TechGroup({ category, items }: TechGroupProps) {
  return (
    <div className="tech-group">
      <h4 className="tech-group-title">{category}</h4>
      <div className="tech-group-items">
        {items.map((t) => (
          <span key={t} className="tech-badge">{t}</span>
        ))}
      </div>
    </div>
  );
}

export default TechGroup;
