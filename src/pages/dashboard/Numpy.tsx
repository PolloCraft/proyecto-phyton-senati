import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import StatBadge from "../../components/common/StatBadge";
import TabSelector from "../../components/common/TabSelector";
import ColumnSelect from "../../components/common/ColumnSelect";
import { cargarDatos } from "../../utils/storage";
import { getPyodide } from "../../utils/pyodide";
import numpyOpsScript from "../../scripts/numpy_ops.py?raw";
import "../dashboard/Dashboard.css";

type Section = "vector" | "descriptive" | "transform" | "matrix" | "operations";

function Numpy() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [cargandoPyodide, setCargandoPyodide] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [section, setSection] = useState<Section>("vector");
  const [result, setResult] = useState("");
  const [vectorColumn, setVectorColumn] = useState("");
  const [vectorBColumn, setVectorBColumn] = useState("");
  const [transform, setTransform] = useState("normalize");
  const [scalar, setScalar] = useState("2");
  const [matrixColumns, setMatrixColumns] = useState<string[]>([]);
  const [matrixOperation, setMatrixOperation] = useState("describe");
  const [operation, setOperation] = useState("add");

  useEffect(() => {
    const guardados = cargarDatos();
    if (guardados && guardados.datosLimpios.length > 0) {
      setData(guardados.datosLimpios);
      setHeaders(guardados.columnas);
    }
    setCargando(false);
  }, []);

  const numericColumns = useMemo(() => {
    return headers.filter((h) => {
      const vals = data.map((r) => {
        const n = Number(String(r[h]).replace(",", "."));
        return Number.isFinite(n) ? n : NaN;
      });
      return vals.filter(Number.isFinite).length > vals.length * 0.5;
    });
  }, [data, headers]);

  useEffect(() => {
    if (!numericColumns.length) return;
    if (!numericColumns.includes(vectorColumn)) setVectorColumn(numericColumns[0]);
    if (!numericColumns.includes(vectorBColumn)) setVectorBColumn(numericColumns[Math.min(1, numericColumns.length - 1)]);
    setMatrixColumns((cur) => {
      const v = cur.filter((c) => numericColumns.includes(c));
      return v.length >= 2 ? v : numericColumns.slice(0, Math.min(3, numericColumns.length));
    });
  }, [numericColumns]);

  const runNumpy = async (op: string, extra?: Record<string, string>): Promise<string> => {
    setCargandoPyodide(true);
    try {
      const py = await getPyodide();
      await py.loadPackage(["numpy"]);
      py.globals.set("data_json", JSON.stringify(data));
      py.globals.set("headers_json", JSON.stringify(headers));
      py.globals.set("col_a", vectorColumn);
      py.globals.set("col_b", vectorBColumn);
      py.globals.set("scalar_val", scalar);
      py.globals.set("matrix_cols", JSON.stringify(matrixColumns));
      py.globals.set("operation", op);
      py.globals.set("transform_type", extra?.transform_type ?? transform);
      py.globals.set("matrix_op", extra?.matrix_op ?? matrixOperation);
      py.globals.set("operator_type", extra?.operator_type ?? operation);
      return await py.runPythonAsync(numpyOpsScript);
    } finally {
      setCargandoPyodide(false);
    }
  };

  const createVector = async () => {
    if (!vectorColumn) return;
    try {
      const res = await runNumpy("create");
      const r = JSON.parse(res);
      setResult("SELECCION DE VECTOR\n\nColumna: " + r.columna + "\nDatos:\n" + JSON.stringify(r.vector) + "\n\nDimension: " + r.dimension + " | Forma: " + r.shape + " | Tipo: " + r.dtype);
    } catch (err: any) { setError2(err); }
  };

  const describeVector = async () => {
    if (!vectorColumn) return;
    try {
      const res = await runNumpy("describe");
      const r = JSON.parse(res);
      setResult("ANALISIS DESCRIPTIVO\n\nVariable: " + r.columna + "\nDatos: " + JSON.stringify(r.datos) + "\n\n--- CENTRALIDAD ---\nMedia: " + r.media + "\nMediana: " + r.mediana + "\nModa: " + r.moda + "\n\n--- DISPERSION ---\nVarianza: " + r.varianza + "\nDesv. std: " + r.desv_est + "\nRango: " + r.rango + "\nIQR: " + r.iqr + "\n\n--- POSICION ---\nMinimo: " + r.minimo + "\nQ1: " + r.q1 + "\nQ3: " + r.q3 + "\nMaximo: " + r.maximo);
    } catch (err: any) { setError2(err); }
  };

  const transformVector = async () => {
    if (!vectorColumn) return;
    try {
      const res = await runNumpy("transform", { transform_type: transform });
      const r = JSON.parse(res);
      setResult("TRANSFORMACION\n\nVector: " + vectorColumn + "\nOriginal:\n" + JSON.stringify(r.original) + "\n\nTransformacion: " + r.formula + "\nResultado:\n" + JSON.stringify(r.resultado));
    } catch (err: any) { setError2(err); }
  };

  const executeMatrix = async () => {
    if (matrixColumns.length < 2) { setResult("Selecciona al menos 2 columnas."); return; }
    try {
      const res = await runNumpy("matrix", { matrix_op: matrixOperation });
      const r = JSON.parse(res);
      if (r.op === "describe") setResult("MATRIZ DESCRIPTIVA\n\nColumnas: " + matrixColumns.join(" | ") + "\nForma: " + r.shape + "\n\n" + r.stats.map((s: any) => s.col + ": n=" + s.n + " | media=" + s.media + " | min=" + s.min + " | max=" + s.max).join("\n"));
      else if (r.op === "transpose") setResult("TRANSPOSADA\n\nOriginal: " + r.original_shape + "\nTranspuesta: " + r.transpuesta_shape);
      else if (r.op === "rowSum") setResult("SUMA POR FILA\n\n" + JSON.stringify(r.suma_filas));
      else if (r.op === "columnSum") setResult("SUMA POR COLUMNA\n\n" + Object.entries(r.suma_col).map(([k, v]) => k + ": " + String(v)).join("\n"));
      else if (r.op === "dot") setResult("PRODUCTO PUNTO\n\nA: " + JSON.stringify(r.a) + "\nB: " + JSON.stringify(r.b) + "\nResultado: " + r.producto_punto);
    } catch (err: any) { setError2(err); }
  };

  const executeOperation = async () => {
    if (!vectorColumn || !vectorBColumn) return;
    try {
      const res = await runNumpy("operator", { operator_type: operation });
      const r = JSON.parse(res);
      if (r.error) { setResult(r.error); return; }
      setResult("OPERACION ENTRE VECTORES\n\nA (" + r.col_a + "): " + JSON.stringify(r.a) + "\nB (" + r.col_b + "): " + JSON.stringify(r.b) + "\n\nA " + r.simbolo + " B:\n" + JSON.stringify(r.resultado));
    } catch (err: any) { setError2(err); }
  };

  const setError2 = (err: any) => { setResult("Error: " + (err?.message || String(err))); };

  const botonesSeccion: { key: Section; label: string }[] = [
    { key: "vector", label: "Vector" },
    { key: "descriptive", label: "Descriptiva" },
    { key: "transform", label: "Transformacion" },
    { key: "matrix", label: "Matrices" },
    { key: "operations", label: "Operadores" },
  ];

  if (!cargando && (!data.length || !numericColumns.length)) {
    return (
      <div className="card">
        <h3>Operaciones NumPy</h3>
        <p style={{ color: "#64748b" }}>No hay datos numericos. Primero procesa un CSV en Pandas.</p>
        <Button onClick={() => navigate("/Dashboard/pandas")}>Ir a Pandas</Button>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <h3 style={{ margin: 0 }}>Operaciones NumPy (Python)</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => navigate("/Dashboard/pandas")} variant="secondary">Pandas</Button>
          <Button onClick={() => navigate("/Dashboard/numpy/graficos")}>Graficos</Button>
        </div>
      </div>

      <div className="dashboard-stats-row">
        {[
          { label: "Filas", val: data.length },
          { label: "Columnas", val: headers.length },
          { label: "Numericas", val: numericColumns.length },
        ].map(({ label, val }) => (
          <StatBadge key={label} label={label} value={val} />
        ))}
      </div>

      {cargandoPyodide && (
        <div className="info-banner" style={{ color: "#6366f1", background: "#eef2ff", borderColor: "#6366f1" }}>
          Cargando Pyodide + numpy (primera vez puede tardar)...
        </div>
      )}

      <TabSelector tabs={botonesSeccion} active={section} onChange={setSection} />

      {section === "vector" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Seleccion de Vector</h4>
          <div className="btn-row">
            <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} />
            <Button onClick={createVector}>Crear Array</Button>
          </div>
        </div>
      )}

      {section === "descriptive" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Analisis Descriptivo</h4>
          <div className="btn-row">
            <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} />
            <Button onClick={describeVector}>Generar</Button>
          </div>
        </div>
      )}

      {section === "transform" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Transformacion Vectorial</h4>
          <div className="btn-row">
            <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} />
            <select value={transform} onChange={(e) => setTransform(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}>
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
              <input type="number" value={scalar} onChange={(e) => setScalar(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px", width: "80px" }} />
            )}
            <Button onClick={transformVector}>Transformar</Button>
          </div>
        </div>
      )}

      {section === "matrix" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Matrices</h4>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {numericColumns.map((col) => (
              <label key={col} className={`matrix-checkbox ${matrixColumns.includes(col) ? "checked" : ""}`}>
                <input type="checkbox" checked={matrixColumns.includes(col)} onChange={(e) => { setMatrixColumns(e.target.checked ? [...matrixColumns, col] : matrixColumns.filter((c) => c !== col)); }} />
                {col}
              </label>
            ))}
          </div>
          <div className="btn-row">
            <select value={matrixOperation} onChange={(e) => setMatrixOperation(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}>
              <option value="describe">Describir matriz</option>
              <option value="transpose">Transpuesta</option>
              <option value="rowSum">Suma por filas</option>
              <option value="columnSum">Suma por columnas</option>
              <option value="dot">Producto punto</option>
            </select>
            <Button onClick={executeMatrix}>Ejecutar</Button>
          </div>
        </div>
      )}

      {section === "operations" && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "#1e293b" }}>Operadores entre Vectores</h4>
          <div className="btn-row">
            <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} prefix="A" />
            <select value={operation} onChange={(e) => setOperation(e.target.value)} style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px" }}>
              <option value="add">A + B</option>
              <option value="subtract">A - B</option>
              <option value="multiply">A x B</option>
              <option value="divide">A / B</option>
              <option value="power">A ^ B</option>
              <option value="modulo">A % B</option>
            </select>
            <ColumnSelect columns={numericColumns} value={vectorBColumn} onChange={setVectorBColumn} prefix="B" />
            <Button onClick={executeOperation}>Ejecutar</Button>
          </div>
        </div>
      )}

      {result && (
        <div className="result-panel">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default Numpy;
