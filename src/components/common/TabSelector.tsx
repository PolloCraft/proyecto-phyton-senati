interface TabItem<T extends string> {
  key: T;
  label: string;
}

interface TabSelectorProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  disabled?: boolean;
}

function TabSelector<T extends string>({ tabs, active, onChange, disabled }: TabSelectorProps<T>) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          disabled={disabled}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "2px solid",
            borderColor: active === t.key ? "#6366f1" : "#e2e8f0",
            backgroundColor: active === t.key ? "#eef2ff" : "#fff",
            cursor: disabled ? "wait" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            transition: "all 0.2s",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default TabSelector;
