interface ColumnSelectProps {
  columns: string[];
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
}

function ColumnSelect({ columns, value, onChange, prefix }: ColumnSelectProps) {
  const selectId = `col-select-${prefix || 'default'}`;
  return (
    <select
      id={selectId}
      name={selectId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}
    >
      {columns.map((col) => (
        <option key={col} value={col}>
          {prefix ? `${prefix}: ${col}` : col}
        </option>
      ))}
    </select>
  );
}

export default ColumnSelect;
