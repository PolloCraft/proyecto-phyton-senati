import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import StatBadge from "../../components/common/StatBadge";
import TabSelector from "../../components/common/TabSelector";
import ColumnSelect from "../../components/common/ColumnSelect";
import { cargarDatos } from "../../utils/storage";
import { getPyodide } from "../../utils/pyodide";
import numpyOpsScript from "../../scripts/numpy_ops.py?raw";


type Section = "vector" | "descriptive" | "transform" | "matrix" | "operations";

interface ParsedResult {
  title: string;
  subtitle?: string;
  sections: { label: string; items: { key: string; value: string; isNumber?: boolean }[] }[];
  stats?: { label: string; value: string | number; icon: string; color: string }[];
  rawArrays?: { label: string; data: number[] }[];
}

const SECTION_ICONS: Record<Section, string> = {
  vector: "→",
  descriptive: "Σ",
  transform: "⇌",
  matrix: "▦",
  operations: "±",
};

const SECTION_COLORS: Record<Section, string> = {
  vector: "#3b82f6",
  descriptive: "#8b5cf6",
  transform: "#f59e0b",
  matrix: "#10b981",
  operations: "#ef4444",
};

function formatNumber(n: string | number): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (!Number.isFinite(num)) return String(n);
  return num % 1 === 0 ? num.toLocaleString("es-PE") : num.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

function formatStatValue(val: any): string {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "number") return formatNumber(val);
  return String(val);
}

function parseResult(raw: string, section: Section): ParsedResult {
  if (raw.startsWith("Error:")) {
    return { title: "Error", sections: [{ label: "Detalle", items: [{ key: "Mensaje", value: raw.replace("Error: ", "") }] }] };
  }

  let json: any = null;
  try {
    json = JSON.parse(raw);
  } catch {
    // Not JSON, treat as text
    return { title: "Resultado", sections: [{ label: "Contenido", items: [{ key: "Resultado", value: raw }] }] };
  }

  if (json.error) {
    return { title: "Error", sections: [{ label: "Detalle", items: [{ key: "Mensaje", value: json.error }] }] };
  }

  if (json.vector !== undefined) {
    return {
      title: "VECTOR CREADO",
      subtitle: `Columna: ${json.columna}`,
      stats: [
        { label: "Dimensión", value: json.dimension, icon: "d", color: "#3b82f6" },
        { label: "Forma", value: json.shape, icon: "◇", color: "#8b5cf6" },
        { label: "Tipo", value: json.dtype, icon: "T", color: "#10b981" },
      ],
      sections: [],
      rawArrays: [{ label: "Elementos", data: json.vector }],
    };
  }

  if (json.media !== undefined) {
    return {
      title: "ANÁLISIS DESCRIPTIVO",
      subtitle: `Variable: ${json.columna}`,
      stats: [
        { label: "Media", value: json.media, icon: "μ", color: "#3b82f6" },
        { label: "Mediana", value: json.mediana, icon: "M", color: "#8b5cf6" },
        { label: "Desv. Est", value: json.desv_est, icon: "σ", color: "#f59e0b" },
        { label: "Varianza", value: json.varianza, icon: "σ²", color: "#ef4444" },
      ],
      sections: [
        {
          label: "CENTRALIDAD",
          items: [
            { key: "Media", value: json.media, isNumber: true },
            { key: "Mediana", value: json.mediana, isNumber: true },
            { key: "Moda", value: json.moda },
          ],
        },
        {
          label: "DISPERSIÓN",
          items: [
            { key: "Varianza", value: json.varianza, isNumber: true },
            { key: "Desv. Estándar", value: json.desv_est, isNumber: true },
            { key: "Rango", value: json.rango, isNumber: true },
            { key: "IQR", value: json.iqr, isNumber: true },
          ],
        },
        {
          label: "POSICIÓN",
          items: [
            { key: "Mínimo", value: json.minimo, isNumber: true },
            { key: "Q1", value: json.q1, isNumber: true },
            { key: "Q3", value: json.q3, isNumber: true },
            { key: "Máximo", value: json.maximo, isNumber: true },
          ],
        },
      ],
      rawArrays: json.datos ? [{ label: "Datos del vector", data: json.datos }] : undefined,
    };
  }

  if (json.original !== undefined && json.resultado !== undefined) {
    return {
      title: "TRANSFORMACIÓN",
      subtitle: `Fórmula: ${json.formula || "N/A"}`,
      sections: [],
      rawArrays: [
        { label: "Original", data: json.original },
        { label: "Resultado", data: json.resultado },
      ],
    };
  }

  if (json.op === "describe" && json.stats) {
    return {
      title: "MATRIZ DESCRIPTIVA",
      subtitle: `Columnas: ${json.stats.map((s: any) => s.col).join(", ")}`,
      sections: [
        {
          label: "Estadísticas por columna",
          items: json.stats.map((s: any) => ({
            key: s.col,
            value: `n=${s.n} | μ=${s.media} | min=${s.min} | max=${s.max}`,
          })),
        },
      ],
    };
  }

  if (json.op === "transpose") {
    return {
      title: "TRANSPOSADA",
      subtitle: `Original: ${json.original_shape} → Transpuesta: ${json.transpuesta_shape}`,
      sections: [],
    };
  }

  if (json.op === "rowSum") {
    return {
      title: "SUMA POR FILA",
      sections: [],
      rawArrays: [{ label: "Suma filas", data: json.suma_filas }],
    };
  }

  if (json.op === "columnSum") {
    return {
      title: "SUMA POR COLUMNA",
      sections: [
        {
          label: "Resultados",
          items: Object.entries(json.suma_col).map(([k, v]) => ({ key: k, value: String(v), isNumber: true })),
        },
      ],
    };
  }

  if (json.op === "dot") {
    return {
      title: "PRODUCTO PUNTO",
      sections: [{ label: "Detalle", items: [{ key: "Resultado", value: json.producto_punto, isNumber: true }] }],
      rawArrays: [
        { label: "Vector A", data: json.a },
        { label: "Vector B", data: json.b },
      ],
    };
  }

  if (json.a !== undefined && json.b !== undefined && json.resultado !== undefined) {
    return {
      title: "OPERACIÓN ENTRE VECTORES",
      subtitle: `${json.col_a} ${json.simbolo} ${json.col_b}`,
      sections: [],
      rawArrays: [
        { label: `A (${json.col_a})`, data: json.a },
        { label: `B (${json.col_b})`, data: json.b },
        { label: "Resultado", data: json.resultado },
      ],
    };
  }

  return { title: "Resultado", sections: [{ label: "Contenido", items: [{ key: "Resultado", value: raw }] }] };
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data.map(Math.abs), 1);
  return (
    <div className="mini-bar-chart">
      {data.slice(0, 30).map((v, i) => (
        <div
          key={i}
          className="mini-bar"
          style={{
            height: `${Math.abs(v) / max * 100}%`,
            backgroundColor: v >= 0 ? color : "#ef4444",
          }}
          title={`${i}: ${formatNumber(v)}`}
        />
      ))}
    </div>
  );
}

function MatrixGrid({ columns }: { columns: string[] }) {
  return (
    <div className="matrix-grid">
      <div className="matrix-grid-header">
        {columns.map((c, i) => (
          <div key={i} className="matrix-cell header">{c}</div>
        ))}
      </div>
      <div className="matrix-grid-preview">
        <div className="matrix-cell dim">n × {columns.length}</div>
      </div>
    </div>
  );
}

function ResultPanel({ result, section }: { result: string; section: Section }) {
  const parsed = useMemo(() => parseResult(result, section), [result, section]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (label: string) => setCollapsed((p) => ({ ...p, [label]: !p[label] }));

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    // Podríamos añadir un toast aquí si existiera en el contexto local
  };

  const handleExport = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `numpy-result-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result-panel-professional animate-fade-in" style={{ marginTop: 24 }}>
      <div className="result-panel-header">
        <div className="result-panel-title">
          <span className="result-panel-icon" style={{ backgroundColor: `${SECTION_COLORS[section]}20`, color: SECTION_COLORS[section] }}>
            {SECTION_ICONS[section]}
          </span>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f8fafc" }}>{parsed.title}</span>
            {parsed.subtitle && <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 400 }}>{parsed.subtitle}</span>}
          </div>
        </div>
        <div className="result-panel-actions">
          <button className="result-btn result-btn-copy" onClick={handleCopy} title="Copiar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          </button>
          <button className="result-btn result-btn-export" onClick={handleExport} title="Exportar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {parsed.stats && parsed.stats.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            {parsed.stats.map((s) => (
              <div key={s.label} className="result-stat-card" style={{ borderLeft: `3px solid ${s.color}`, background: "rgba(30, 41, 59, 0.6)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, border: "1px solid #1e293b", transition: "all 0.15s" }}>
                <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99, 102, 241, 0.1)", borderRadius: 8, fontSize: "0.95rem", fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", fontVariantNumeric: "tabular-nums" }}>{typeof s.value === "number" ? formatNumber(s.value) : formatStatValue(s.value)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {parsed.rawArrays && parsed.rawArrays.map((arr) => {
          return (
          <div key={arr.label} style={{ marginBottom: 20, background: "rgba(30, 41, 59, 0.3)", borderRadius: 12, padding: 16, border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{arr.label}</span>
              <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.2)", color: "#818cf8", padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>{arr.data.length} elementos</span>
            </div>
            <MiniBarChart data={arr.data} color={SECTION_COLORS[section]} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {arr.data.slice(0, 15).map((v, i) => (
                <span key={i} style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", padding: "4px 10px", borderRadius: 6, background: "rgba(15, 23, 42, 0.6)", border: "1px solid #1e293b", fontVariantNumeric: "tabular-nums", color: v >= 0 ? "#34d399" : "#f87171", fontWeight: 500 }}>
                  {formatNumber(v)}
                </span>
              ))}
              {arr.data.length > 15 && <span style={{ fontSize: "0.72rem", color: "#64748b", fontStyle: "italic", display: "flex", alignItems: "center", marginLeft: 4 }}>+{arr.data.length - 15} items...</span>}
            </div>
          </div>
          );
        })}

        {parsed.sections.map((sec) => (
          <div key={sec.label} style={{ marginBottom: 12, overflow: "hidden", borderRadius: 12, border: "1px solid #1e293b", background: "rgba(30, 41, 59, 0.2)" }}>
            <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", fontSize: "0.88rem", fontWeight: 700, color: "#e2e8f0", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit" }} onClick={() => toggle(sec.label)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.75rem", transition: "transform 0.3s", transform: collapsed[sec.label] ? "rotate(-90deg)" : "rotate(0deg)" }}>▼</span>
                <span>{sec.label}</span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>{sec.items.length} métricas</span>
            </button>
            {!collapsed[sec.label] && (
              <div style={{ padding: "0 16px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                {sec.items.map((item) => (
                  <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "rgba(15, 23, 42, 0.4)", border: "1px solid #1e293b" }}>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>{item.key}</span>
                    <span style={{ fontSize: "0.82rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: item.isNumber ? (parseFloat(String(item.value)) >= 0 ? "#34d399" : "#f87171") : "#f1f5f9" }}>
                      {item.isNumber ? formatStatValue(item.value) : item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {parsed.sections.length === 0 && !parsed.stats && !parsed.rawArrays && (
          <pre style={{ padding: 16, background: "#020617", borderRadius: 8, fontSize: "0.78rem", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7, border: "1px solid #1e293b", color: "#818cf8", overflowX: "auto", whiteSpace: "pre-wrap" }}>
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}

function ColumnInfoCard({ column, data }: { column: string; data: any[] }) {
  const values = data.map((r) => Number(String(r[column]).replace(",", "."))).filter(Number.isFinite);
  const sample = data.slice(0, 3).map((r) => r[column]);
  const types = [...new Set(data.map((r) => typeof r[column]))];
  return (
    <div className="column-info-card">
      <div className="column-info-name">{column}</div>
      <div className="column-info-meta">
        <span className="column-info-type">{types.join(", ")}</span>
        <span className="column-info-count">{values.length} numéricos</span>
      </div>
      <div className="column-info-samples">
        {sample.map((s, i) => (
          <span key={i} className="column-info-sample">{String(s)}</span>
        ))}
      </div>
    </div>
  );
}

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
  const [expandedColumns, setExpandedColumns] = useState(false);

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
      setResult(res);
    } catch (err: unknown) { setError2(err); }
  };

  const describeVector = async () => {
    if (!vectorColumn) return;
    try {
      const res = await runNumpy("describe");
      setResult(res);
    } catch (err: unknown) { setError2(err); }
  };

  const transformVector = async () => {
    if (!vectorColumn) return;
    try {
      const res = await runNumpy("transform", { transform_type: transform });
      setResult(res);
    } catch (err: unknown) { setError2(err); }
  };

  const executeMatrix = async () => {
    if (matrixColumns.length < 2) { setResult("Selecciona al menos 2 columnas."); return; }
    try {
      const res = await runNumpy("matrix", { matrix_op: matrixOperation });
      setResult(res);
    } catch (err: unknown) { setError2(err); }
  };

  const executeOperation = async () => {
    if (!vectorColumn || !vectorBColumn) return;
    try {
      const res = await runNumpy("operator", { operator_type: operation });
      setResult(res);
    } catch (err: unknown) { setError2(err); }
  };

  const setError2 = (err: unknown) => { setResult("Error: " + (err instanceof Error ? err.message : String(err))); };

  const botonesSeccion: { key: Section; label: string }[] = [
    { key: "vector", label: "Vector" },
    { key: "descriptive", label: "Descriptiva" },
    { key: "transform", label: "Transformación" },
    { key: "matrix", label: "Matrices" },
    { key: "operations", label: "Operadores" },
  ];

  if (!cargando && (!data.length || !numericColumns.length)) {
    return (
      <div className="card">
        <h3>Operaciones NumPy</h3>
        <div className="dashboard-empty">
          <p>No hay datos numéricos disponibles. Primero procesa un archivo CSV en la sección de Pandas.</p>
          <div style={{ marginTop: "12px" }}>
            <Button onClick={() => navigate("/Dashboard/pandas")}>Ir a Pandas</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card numpy-card">
      <div className="card-header">
        <div>
          <h3>Operaciones NumPy</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>Análisis numérico con Python</p>
        </div>
      </div>

      <div className="dashboard-stats-row">
        {[
          { label: "Filas", val: data.length },
          { label: "Columnas", val: headers.length },
          { label: "Numéricas", val: numericColumns.length },
        ].map(({ label, val }) => (
          <StatBadge key={label} label={label} value={val} />
        ))}
      </div>

      {cargandoPyodide && (
        <div className="loading-state-inline">
          <div className="loading-spinner-small"></div>
          <span>Ejecutando NumPy...</span>
        </div>
      )}

      <TabSelector tabs={botonesSeccion} active={section} onChange={setSection} />

      <div className="numpy-section-content">
        {section === "vector" && (
          <div className="numpy-operation-card">
            <div className="op-card-header">
              <span className="op-card-icon" style={{ color: SECTION_COLORS.vector }}>{SECTION_ICONS.vector}</span>
              <div>
                <h4>Selección de Vector</h4>
                <p className="operation-desc">Selecciona una columna numérica para crear un array de NumPy.</p>
              </div>
            </div>
            <div className="btn-row">
              <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} />
              <Button onClick={createVector}>Crear Array</Button>
            </div>
            {vectorColumn && data.length > 0 && (
              <div className="vector-preview">
                <MiniBarChart
                  data={data.slice(0, 30).map((r) => Number(String(r[vectorColumn]).replace(",", "."))).filter(Number.isFinite)}
                  color={SECTION_COLORS.vector}
                />
                <span className="vector-preview-label">Vista previa: {vectorColumn}</span>
              </div>
            )}
          </div>
        )}

        {section === "descriptive" && (
          <div className="numpy-operation-card">
            <div className="op-card-header">
              <span className="op-card-icon" style={{ color: SECTION_COLORS.descriptive }}>{SECTION_ICONS.descriptive}</span>
              <div>
                <h4>Análisis Descriptivo</h4>
                <p className="operation-desc">Obtén estadísticas completas: media, mediana, moda, varianza, desviación estándar y percentiles.</p>
              </div>
            </div>
            <div className="btn-row">
              <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} />
              <Button onClick={describeVector}>Generar</Button>
            </div>
          </div>
        )}

        {section === "transform" && (
          <div className="numpy-operation-card">
            <div className="op-card-header">
              <span className="op-card-icon" style={{ color: SECTION_COLORS.transform }}>{SECTION_ICONS.transform}</span>
              <div>
                <h4>Transformación Vectorial</h4>
                <p className="operation-desc">Aplica transformaciones matemáticas al vector seleccionado.</p>
              </div>
            </div>
            <div className="btn-row">
              <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} />
              <select id="numpy-transform" name="numpy-transform" value={transform} onChange={(e) => setTransform(e.target.value)} className="numpy-select">
                <option value="normalize">Normalizar Min-Max</option>
                <option value="standardize">Estandarizar Z-Score</option>
                <option value="add">Sumar escalar</option>
                <option value="subtract">Restar escalar</option>
                <option value="multiply">Multiplicar escalar</option>
                <option value="divide">Dividir escalar</option>
                <option value="square">Cuadrado</option>
                <option value="sqrt">Raíz cuadrada</option>
                <option value="absolute">Valor absoluto</option>
              </select>
              {["add", "subtract", "multiply", "divide"].includes(transform) && (
                <input id="numpy-scalar" name="numpy-scalar" type="number" value={scalar} onChange={(e) => setScalar(e.target.value)} className="numpy-input" />
              )}
              <Button onClick={transformVector}>Transformar</Button>
            </div>
          </div>
        )}

        {section === "matrix" && (
          <div className="numpy-operation-card">
            <div className="op-card-header">
              <span className="op-card-icon" style={{ color: SECTION_COLORS.matrix }}>{SECTION_ICONS.matrix}</span>
              <div>
                <h4>Matrices</h4>
                <p className="operation-desc">Selecciona columnas para formar una matriz y ejecutar operaciones.</p>
              </div>
            </div>
            <div className="matrix-columns-select">
              {numericColumns.map((col) => (
                <label key={col} className={`matrix-checkbox ${matrixColumns.includes(col) ? "checked" : ""}`}>
                  <input id={`numpy-matrix-${col}`} name={`numpy-matrix-${col}`} type="checkbox" checked={matrixColumns.includes(col)} onChange={(e) => { setMatrixColumns(e.target.checked ? [...matrixColumns, col] : matrixColumns.filter((c) => c !== col)); }} />
                  {col}
                </label>
              ))}
            </div>
            {matrixColumns.length >= 2 && (
              <MatrixGrid columns={matrixColumns} />
            )}
            <div className="btn-row">
              <select id="numpy-matrix-op" name="numpy-matrix-op" value={matrixOperation} onChange={(e) => setMatrixOperation(e.target.value)} className="numpy-select">
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
          <div className="numpy-operation-card">
            <div className="op-card-header">
              <span className="op-card-icon" style={{ color: SECTION_COLORS.operations }}>{SECTION_ICONS.operations}</span>
              <div>
                <h4>Operadores entre Vectores</h4>
                <p className="operation-desc">Realiza operaciones matemáticas entre dos vectores (columnas).</p>
              </div>
            </div>
            <div className="btn-row">
              <ColumnSelect columns={numericColumns} value={vectorColumn} onChange={setVectorColumn} prefix="A" />
              <select id="numpy-vector-op" name="numpy-vector-op" value={operation} onChange={(e) => setOperation(e.target.value)} className="numpy-select">
                <option value="add">A + B</option>
                <option value="subtract">A - B</option>
                <option value="multiply">A × B</option>
                <option value="divide">A / B</option>
                <option value="power">A ^ B</option>
                <option value="modulo">A % B</option>
              </select>
              <ColumnSelect columns={numericColumns} value={vectorBColumn} onChange={setVectorBColumn} prefix="B" />
              <Button onClick={executeOperation}>Ejecutar</Button>
            </div>
          </div>
        )}
      </div>

      <div className="columns-info-section">
        <button className="columns-toggle" onClick={() => setExpandedColumns(!expandedColumns)}>
          <span>Columnas del dataset ({numericColumns.length} numéricas)</span>
          <span className={`columns-arrow ${expandedColumns ? "expanded" : ""}`}>▾</span>
        </button>
        {expandedColumns && (
          <div className="columns-grid">
            {numericColumns.map((col) => (
              <ColumnInfoCard key={col} column={col} data={data} />
            ))}
          </div>
        )}
      </div>

      {result && <ResultPanel result={result} section={section} />}
    </div>
  );
}

export default Numpy;
