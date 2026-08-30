import ColumnSelect from "../../../components/common/ColumnSelect";
import Button from "../../../components/Button";

interface VectorSectionProps {
  numericColumns: string[];
  vectorColumn: string;
  onColumnChange: (val: string) => void;
  onExecute: () => void;
}

function VectorSection({ numericColumns, vectorColumn, onColumnChange, onExecute }: VectorSectionProps) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Seleccion de Vector</h4>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={onColumnChange} />
        <Button onClick={onExecute}>Crear Array</Button>
      </div>
    </div>
  );
}

export default VectorSection;
