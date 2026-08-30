interface StatBadgeProps {
  label: string;
  value: string | number;
}

function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div style={{ background: "#f8f9fa", padding: "8px 14px", borderRadius: "6px", border: "1px solid #e2e8f0", minWidth: "90px" }}>
      <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#1e293b" }}>{String(value)}</div>
    </div>
  );
}

export default StatBadge;
