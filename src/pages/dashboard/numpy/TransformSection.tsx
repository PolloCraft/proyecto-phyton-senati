import ColumnSelect from "../../../components/common/ColumnSelect";
import Button from "../../../components/Button";

interface TransformSectionProps {
  numericColumns: string[];
  vectorColumn: string;
  onColumnChange: (val: string) => void;
  transform: string;
  onTransformChange: (val: string) => void;
  scalar: string;
  onScalarChange: (val: string) => void;
  onExecute: () => void;
}

function TransformSection({ numericColumns, vectorColumn, onColumnChange, transform, onTransformChange, scalar, onScalarChange, onExecute }: TransformSectionProps) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Transformacion Vectorial</h4>
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={onColumnChange} />
        <select id="transform-operation" name="transform-operation" value={transform} onChange={(e) => onTransformChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}>
          <option value="normalize">Normalizar Min-Max</option>
          <option value="standardize">Estandarizar Z-Score</option>
          <option value="add">Sumar escalar</option>
          <option value="subtract">Restar escalar</option>
          <option value="multiply">Multiplicar escalar</option>
          <option value="divide">Dividir escalar</option>
          <option value="square">Cuadrado</option>
          <option value="sqrt">Raiz cuadrada</option>
          <option value="absolute">Valor absoluto</option>
        </select>
        {["add", "subtract", "multiply", "divide"].includes(transform) && (
          <input id="transform-scalar" name="transform-scalar" type="number" value={scalar} onChange={(e) => onScalarChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px", width: "80px" }} />
        )}
        <Button onClick={onExecute}>Transformar</Button>
      </div>
    </div>
  );
}

export default TransformSection;
