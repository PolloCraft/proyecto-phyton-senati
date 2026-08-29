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

function parseResult(raw: string, section: Section): ParsedResult {
  if (raw.startsWith("Error:")) {
    return { title: "Error", sections: [{ label: "Detalle", items: [{ key: "Mensaje", value: raw.replace("Error: ", "") }] }] };
  }

  const lines = raw.split("\n").filter(Boolean);
  const title = lines[0] || "Resultado";

  if (section === "descriptive" && raw.includes("ANALISIS DESCRIPTIVO")) {
    const dataMatch = raw.match(/Datos:\s*(\[.*?\])/);
    const arrayData: number[] = dataMatch ? JSON.parse(dataMatch[1]) : [];

    return {
      title: "ANÁLISIS DESCRIPTIVO",
      subtitle: `Variable: ${raw.match(/Variable:\s*(\S+)/)?.[1] || "N/A"}`,
      stats: [
        { label: "Media", value: raw.match(/Media:\s*([\d.eE+-]+)/)?.[1] || "N/A", icon: "μ", color: "#3b82f6" },
        { label: "Mediana", value: raw.match(/Mediana:\s*([\d.eE+-]+)/)?.[1] || "N/A", icon: "M", color: "#8b5cf6" },
        { label: "Desv. Est", value: raw.match(/Desv\. std:\s*([\d.eE+-]+)/)?.[1] || "N/A", icon: "σ", color: "#f59e0b" },
        { label: "Varianza", value: raw.match(/Varianza:\s*([\d.eE+-]+)/)?.[1] || "N/A", icon: "σ²", color: "#ef4444" },
      ],
      sections: [
        {
          label: "CENTRALIDAD",
          items: [
            { key: "Media", value: raw.match(/Media:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Mediana", value: raw.match(/Mediana:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Moda", value: raw.match(/Moda:\s*(.+?)(?:\n|$)/)?.[1]?.trim() || "N/A" },
          ],
        },
        {
          label: "DISPERSIÓN",
          items: [
            { key: "Varianza", value: raw.match(/Varianza:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Desv. Estándar", value: raw.match(/Desv\. std:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Rango", value: raw.match(/Rango:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "IQR", value: raw.match(/IQR:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
          ],
        },
        {
          label: "POSICIÓN",
          items: [
            { key: "Mínimo", value: raw.match(/Minimo:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Q1", value: raw.match(/Q1:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Q3", value: raw.match(/Q3:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
            { key: "Máximo", value: raw.match(/Maximo:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true },
          ],
        },
      ],
      rawArrays: arrayData.length > 0 ? [{ label: "Datos del vector", data: arrayData }] : undefined,
    };
  }

  if (section === "vector" && raw.includes("SELECCION DE VECTOR")) {
    const dataMatch = raw.match(/Datos:\s*(\[.*?\])/);
    const arrayData: number[] = dataMatch ? JSON.parse(dataMatch[1]) : [];
    return {
      title: "VECTOR CREADO",
      subtitle: `Columna: ${raw.match(/Columna:\s*(\S+)/)?.[1] || "N/A"}`,
      stats: [
        { label: "Dimensión", value: raw.match(/Dimension:\s*(\d+)/)?.[1] || "N/A", icon: "d", color: "#3b82f6" },
        { label: "Forma", value: raw.match(/Forma:\s*(.+?)(?:\s*\||\s*$)/)?.[1]?.trim() || "N/A", icon: "◇", color: "#8b5cf6" },
        { label: "Tipo", value: raw.match(/Tipo:\s*(\S+)/)?.[1] || "N/A", icon: "T", color: "#10b981" },
      ],
      sections: [],
      rawArrays: arrayData.length > 0 ? [{ label: "Elementos", data: arrayData }] : undefined,
    };
  }

  if (section === "transform" && raw.includes("TRANSFORMACION")) {
    const origMatch = raw.match(/Original:\s*(\[.*?\])/);
    const resMatch = raw.match(/Resultado:\s*(\[.*?\])/);
    const formulaMatch = raw.match(/Transformacion:\s*(.+?)(?:\n|$)/);
    return {
      title: "TRANSFORMACIÓN",
      subtitle: `Fórmula: ${formulaMatch?.[1]?.trim() || "N/A"}`,
      sections: [{ label: "Detalle", items: [{ key: "Vector", value: raw.match(/Vector:\s*(\S+)/)?.[1] || "N/A" }, { key: "Transformación", value: formulaMatch?.[1]?.trim() || "N/A" }] }],
      rawArrays: [
        ...(origMatch ? [{ label: "Original", data: JSON.parse(origMatch[1]) }] : []),
        ...(resMatch ? [{ label: "Resultado", data: JSON.parse(resMatch[1]) }] : []),
      ],
    };
  }

  if (raw.includes("OPERACION ENTRE VECTORES")) {
    const aMatch = raw.match(/A \((.+?)\):\s*(\[.*?\])/);
    const bMatch = raw.match(/B \((.+?)\):\s*(\[.*?\])/);
    const resMatch = raw.match(/Resultado:\s*(\[.*?\])/);
    const symMatch = raw.match(/A\s+(.)\s*B/);
    return {
      title: "OPERACIÓN ENTRE VECTORES",
      subtitle: `${aMatch?.[1] || "A"} ${symMatch?.[1] || "?"} ${bMatch?.[1] || "B"}`,
      sections: [],
      rawArrays: [
        ...(aMatch ? [{ label: `A (${aMatch[1]})`, data: JSON.parse(aMatch[1]) }] : []),
        ...(bMatch ? [{ label: `B (${bMatch[1]})`, data: JSON.parse(bMatch[1]) }] : []),
        ...(resMatch ? [{ label: "Resultado", data: JSON.parse(resMatch[1]) }] : []),
      ],
    };
  }

  if (raw.includes("MATRIZ DESCRIPTIVA")) {
    const rows = raw.split("\n").filter((l) => l.includes(": n="));
    return {
      title: "MATRIZ DESCRIPTIVA",
      subtitle: `Columnas: ${raw.match(/Columnas:\s*(.+)/)?.[1] || "N/A"}`,
      sections: [
        {
          label: "Estadísticas por columna",
          items: rows.map((row) => {
            const col = row.split(":")[0];
            const n = row.match(/n=(\d+)/)?.[1] || "";
            const media = row.match(/media=([\d.eE+-]+)/)?.[1] || "";
            const min = row.match(/min=([\d.eE+-]+)/)?.[1] || "";
            const max = row.match(/max=([\d.eE+-]+)/)?.[1] || "";
            return { key: col, value: `n=${n} | μ=${media} | min=${min} | max=${max}` };
          }),
        },
      ],
    };
  }

  if (raw.includes("TRANSPOSADA")) {
    return {
      title: "TRANSPOSADA",
      subtitle: `Original: ${raw.match(/Original:\s*(.+?)(?:\n|$)/)?.[1] || "N/A"} → Transpuesta: ${raw.match(/Transpuesta:\s*(.+?)(?:\n|$)/)?.[1] || "N/A"}`,
      sections: [],
    };
  }

  if (raw.includes("SUMA POR FILA")) {
    const match = raw.match(/SUMA POR FILA\n\n(.+)/);
    const arr: number[] = match ? JSON.parse(match[1]) : [];
    return { title: "SUMA POR FILA", sections: [], rawArrays: [{ label: "Suma filas", data: arr }] };
  }

  if (raw.includes("SUMA POR COLUMNA")) {
    const items = raw.split("\n").filter((l) => l.includes(":")).map((l) => {
      const [k, v] = l.split(":");
      return { key: k.trim(), value: v?.trim() || "N/A", isNumber: true };
    });
    return { title: "SUMA POR COLUMNA", sections: [{ label: "Resultados", items }] };
  }

  if (raw.includes("PRODUCTO PUNTO")) {
    return {
      title: "PRODUCTO PUNTO",
      sections: [{ label: "Detalle", items: [{ key: "Resultado", value: raw.match(/Resultado:\s*([\d.eE+-]+)/)?.[1] || "N/A", isNumber: true }] }],
      rawArrays: [
        { label: "Vector A", data: JSON.parse(raw.match(/A:\s*(\[.*?\])/)?.[1] || "[]") },
        { label: "Vector B", data: JSON.parse(raw.match(/B:\s*(\[.*?\])/)?.[1] || "[]") },
      ],
    };
  }

  return { title, sections: [{ label: "Contenido", items: [{ key: "Resultado", value: raw }] }] };
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
    <div className="result-panel-professional animate-fade-in">
      <div className="result-panel-header">
        <div className="result-panel-title">
          <span className="result-panel-icon" style={{ backgroundColor: `${SECTION_COLORS[section]}20`, color: SECTION_COLORS[section] }}>
            {SECTION_ICONS[section]}
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-lg">{parsed.title}</span>
            {parsed.subtitle && <span className="text-xs text-slate-400 font-normal">{parsed.subtitle}</span>}
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

      <div className="result-content-body p-4">
        {parsed.stats && parsed.stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {parsed.stats.map((s) => (
              <div key={s.label} className="result-stat-card bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-slate-800/60" style={{ borderLeft: `3px solid ${s.color}` }}>
                <div className="result-stat-icon text-xl font-bold flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900/50" style={{ color: s.color }}>{s.icon}</div>
                <div className="result-stat-info">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{s.label}</div>
                  <div className="text-base font-bold text-white tabular-nums">{typeof s.value === "number" ? formatNumber(s.value) : s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {parsed.rawArrays && parsed.rawArrays.map((arr) => {
          return (
          <div key={arr.label} className="mb-6 bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{arr.label}</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{arr.data.length} elementos</span>
            </div>
            <MiniBarChart data={arr.data} color={SECTION_COLORS[section]} />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {arr.data.slice(0, 15).map((v, i) => (
                <span key={i} className={`text-[11px] font-mono px-2 py-1 rounded bg-slate-900/60 border border-slate-700/50 tabular-nums ${v >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatNumber(v)}
                </span>
              ))}
              {arr.data.length > 15 && <span className="text-[11px] text-slate-500 italic flex items-center ml-1">+{arr.data.length - 15} items...</span>}
            </div>
          </div>
          );
        })}

        {parsed.sections.map((sec) => (
          <div key={sec.label} className="mb-3 overflow-hidden rounded-xl border border-slate-700/30 bg-slate-800/20">
            <button className="w-full flex items-center justify-between p-3 text-sm font-bold text-slate-200 hover:bg-slate-700/30 transition-colors" onClick={() => toggle(sec.label)}>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] transition-transform duration-300 ${collapsed[sec.label] ? "-rotate-90" : ""}`}>▼</span>
                <span>{sec.label}</span>
              </div>
              <span className="text-[10px] text-slate-500">{sec.items.length} métricas</span>
            </button>
            {!collapsed[sec.label] && (
              <div className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-2 animate-slide-down">
                {sec.items.map((item) => (
                  <div key={item.key} className="flex justify-between items-center p-2 rounded-lg bg-slate-900/40 border border-slate-700/20">
                    <span className="text-xs text-slate-400">{item.key}</span>
                    <span className={`text-xs font-mono font-bold ${item.isNumber ? (parseFloat(item.value) >= 0 ? "text-emerald-400" : "text-rose-400") : "text-white"}`}>
                      {item.isNumber ? formatNumber(item.value) : item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {parsed.sections.length === 0 && !parsed.stats && !parsed.rawArrays && (
          <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono leading-relaxed border border-slate-800 text-indigo-300 overflow-x-auto whitespace-pre-wrap">
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
              <select value={transform} onChange={(e) => setTransform(e.target.value)} className="numpy-select">
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
                <input type="number" value={scalar} onChange={(e) => setScalar(e.target.value)} className="numpy-input" />
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
                  <input type="checkbox" checked={matrixColumns.includes(col)} onChange={(e) => { setMatrixColumns(e.target.checked ? [...matrixColumns, col] : matrixColumns.filter((c) => c !== col)); }} />
                  {col}
                </label>
              ))}
            </div>
            {matrixColumns.length >= 2 && (
              <MatrixGrid columns={matrixColumns} />
            )}
            <div className="btn-row">
              <select value={matrixOperation} onChange={(e) => setMatrixOperation(e.target.value)} className="numpy-select">
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
              <select value={operation} onChange={(e) => setOperation(e.target.value)} className="numpy-select">
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
