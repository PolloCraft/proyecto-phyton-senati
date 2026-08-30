import ColumnSelect from "../../../components/common/ColumnSelect";
import Button from "../../../components/Button";

interface OperationsSectionProps {
  numericColumns: string[];
  vectorColumn: string;
  onVectorColumnChange: (val: string) => void;
  vectorBColumn: string;
  onVectorBColumnChange: (val: string) => void;
  operation: string;
  onOperationChange: (val: string) => void;
  onExecute: () => void;
}

function OperationsSection({ numericColumns, vectorColumn, onVectorColumnChange, vectorBColumn, onVectorBColumnChange, operation, onOperationChange, onExecute }: OperationsSectionProps) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Operadores entre Vectores</h4>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={onVectorColumnChange} prefix="A" />
        <select id="vector-operation" name="vector-operation" value={operation} onChange={(e) => onOperationChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}>
          <option value="add">A + B</option>
          <option value="subtract">A - B</option>
          <option value="multiply">A x B</option>
          <option value="divide">A / B</option>
          <option value="power">A ^ B</option>
          <option value="modulo">A % B</option>
        </select>
        <ColumnSelect columns={numericColumns} value={vectorBColumn} onChange={onVectorBColumnChange} prefix="B" />
        <Button onClick={onExecute}>Ejecutar</Button>
      </div>
    </div>
  );
}

export default OperationsSection;
