import Button from "../../../components/Button";

interface MatrixSectionProps {
  numericColumns: string[];
  matrixColumns: string[];
  onMatrixColumnsChange: (cols: string[]) => void;
  matrixOperation: string;
  onMatrixOperationChange: (val: string) => void;
  onExecute: () => void;
}

function MatrixSection({ numericColumns, matrixColumns, onMatrixColumnsChange, matrixOperation, onMatrixOperationChange, onExecute }: MatrixSectionProps) {
  const toggleColumn = (col: string, checked: boolean) => {
    onMatrixColumnsChange(checked ? [...matrixColumns, col] : matrixColumns.filter((c) => c !== col));
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Matrices</h4>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {numericColumns.map((col) => (
          <label key={col} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "6px", border: "1px solid #e2e8f0", cursor: "pointer", fontSize: "13px", background: matrixColumns.includes(col) ? "#eef2ff" : "#fff" }}>
            <input type="checkbox" checked={matrixColumns.includes(col)} onChange={(e) => toggleColumn(col, e.target.checked)} />
            {col}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <select value={matrixOperation} onChange={(e) => onMatrixOperationChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}>
          <option value="describe">Describir matriz</option>
          <option value="transpose">Transpuesta</option>
          <option value="rowSum">Suma por filas</option>
          <option value="columnSum">Suma por columnas</option>
          <option value="dot">Producto punto</option>
        </select>
        <Button onClick={onExecute}>Ejecutar</Button>
      </div>
    </div>
  );
}

export default MatrixSection;
