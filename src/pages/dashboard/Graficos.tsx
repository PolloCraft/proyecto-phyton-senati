import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { cargarDatos } from "../../utils/storage";
import { getPyodide } from "../../utils/pyodide";
import matplotlibChartScript from "../../scripts/matplotlib_chart.py?raw";
import { useToast } from "../../context/ToastContext";

type TipoGrafico = "barras" | "lineas" | "dispersion" | "circular" | "histograma" | "caja" | "violin" | "todos";

const ChartIcon = ({ type, size = 18, style }: { type: TipoGrafico; size?: number; style?: React.CSSProperties }) => {
  const s = size;
  const sw = 2;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style };
  switch (type) {
    case "barras":
      return (
        <svg {...common}>
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      );
    case "lineas":
      return (
        <svg {...common}>
          <polyline points="3 17 8 11 13 14 21 5" />
          <circle cx="3" cy="17" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="8" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="13" cy="14" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="21" cy="5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "dispersion":
      return (
        <svg {...common}>
          <circle cx="7" cy="15" r="2" />
          <circle cx="12" cy="9" r="2" />
          <circle cx="17" cy="13" r="2" />
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="19" cy="7" r="1.5" />
        </svg>
      );
    case "circular":
      return (
        <svg {...common}>
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      );
    case "histograma":
      return (
        <svg {...common}>
          <rect x="3" y="16" width="3" height="5" rx="0.5" />
          <rect x="7" y="11" width="3" height="10" rx="0.5" />
          <rect x="11" y="6" width="3" height="15" rx="0.5" />
          <rect x="15" y="9" width="3" height="12" rx="0.5" />
          <rect x="19" y="13" width="3" height="8" rx="0.5" />
        </svg>
      );
    case "caja":
      return (
        <svg {...common}>
          <rect x="8" y="7" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <line x1="12" y1="4" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" />
          <line x1="12" y1="17" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "violin":
      return (
        <svg {...common}>
          <path d="M12 4c-4 6 4 10 0 16s4-10 0-16z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "todos":
      return (
        <svg {...common}>
          <rect x="2" y="2" width="8" height="8" rx="1" />
          <rect x="14" y="2" width="8" height="8" rx="1" />
          <rect x="2" y="14" width="8" height="8" rx="1" />
          <rect x="14" y="14" width="8" height="8" rx="1" />
        </svg>
      );
  }
};

const CHART_TYPES: { key: TipoGrafico; label: string; description: string }[] = [
  { key: "barras", label: "Barras", description: "Distribución de valores" },
  { key: "lineas", label: "Líneas", description: "Tendencias secuenciales" },
  { key: "dispersion", label: "Dispersión", description: "Correlación y outliers" },
  { key: "circular", label: "Circular", description: "Proporciones categóricas" },
  { key: "histograma", label: "Histograma", description: "Distribución de frecuencias" },
  { key: "caja", label: "Caja", description: "Quartiles y outliers" },
  { key: "violin", label: "Violín", description: "Densidad de distribución" },
];

function Graficos() {
  const navigate = useNavigate();
  const { success, error: toastError, loading: toastLoading } = useToast();
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [hayDatos, setHayDatos] = useState(false);
  const [columnasNumericas, setColumnasNumericas] = useState<string[]>([]);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState("");
  const [tipo, setTipo] = useState<TipoGrafico>("barras");
  const [imagenesGraficos, setImagenesGraficos] = useState<Record<string, string>>({});
  const [datosEstadisticos, setDatosEstadisticos] = useState<any>(null);
  const [timestamp, setTimestamp] = useState("");
  const [error, setError] = useState("");
  const [vistaActual, setVistaActual] = useState<"single" | "multi">("single");
  const [expandedChart, setExpandedChart] = useState<{ type: string; src: string; stats: any } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchDist = useRef(0);

  const openExpandedChart = (type: string, src: string, stats: any) => {
    setExpandedChart({ type, src, stats });
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const closeExpandedChart = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setExpandedChart(null);
  };

  useEffect(() => {
    async function init() {
      const guardados = cargarDatos();
      if (guardados && guardados.datosLimpios && guardados.datosLimpios.length > 0) {
        const allCols = guardados.columnas;
        const cols = allCols.filter((col) => {
          const vals = guardados.datosLimpios.map((r) => Number(String(r[col]).replace(",", ".")));
          return vals.filter((v) => Number.isFinite(v)).length > vals.length * 0.5;
        });
        setColumnasNumericas(cols);
        if (cols.length > 0) setColumnaSeleccionada(cols[0]);
        setHayDatos(true);
      }
      setCargando(false);
    }
    init();
  }, []);

  const generarGrafico = async (tipoGrafico: TipoGrafico, multi = false) => {
    if (!columnaSeleccionada) {
      toastError("Sin columna", "Selecciona una columna numérica para generar el gráfico");
      return;
    }
    setGenerando(true);
    setTipo(tipoGrafico);
    setImagenesGraficos({});
    setDatosEstadisticos(null);
    setTimestamp("");
    setError("");
    setVistaActual(multi ? "multi" : "single");

    const { dismiss } = toastLoading(
      multi ? "Generando múltiples gráficos" : "Generando gráfico",
      "Cargando Pyodide y matplotlib..."
    );

    try {
      const guardados = cargarDatos();
      if (!guardados) return;

      let py: any;
      try {
        py = await getPyodide();
        await py.loadPackage(["pandas", "numpy", "matplotlib"]);
      } finally {
      }

      const datosLimpios = guardados.datosLimpios;
      const columnas = guardados.columnas;
      const header = columnas.join(",");
      const rows = datosLimpios.map((row: Record<string, any>) =>
        columnas.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return "";
          return typeof val === "string" && val.includes(",") ? `"${val}"` : String(val);
        }).join(",")
      );
      const cleanedCsv = [header, ...rows].join("\n");

      py.globals.set("csv_content", cleanedCsv);
      py.globals.set("selected_col", columnaSeleccionada);
      py.globals.set("tipo_grafico", tipoGrafico);
      py.globals.set("multi_chart", multi);

      const res = await py.runPythonAsync(matplotlibChartScript);
      const parsed = JSON.parse(res);
      
      if (parsed.graficos) {
        setImagenesGraficos(parsed.graficos);
        setDatosEstadisticos(parsed.stats);
        if (multi) {
          const count = Object.keys(parsed.graficos).filter(k => parsed.graficos[k]).length;
          dismiss("success", `${count} de 7 gráficos creados correctamente`);
        } else {
          dismiss("success", `${chartLabels[tipoGrafico]} creado correctamente`);
        }
      } else {
        dismiss("warning", "No se pudo generar el gráfico");
      }
      setTimestamp(parsed.timestamp || "");
    } catch (err: any) {
      console.error("Error:", err);
      dismiss("error", err?.message || "Error desconocido en Matplotlib");
      setError(err?.message || String(err));
    }

    setGenerando(false);
  };

  const descargarChart = (chartType: string, imgSrc: string) => {
    if (!imgSrc) {
      toastError("Sin imagen", "No hay gráfico para descargar");
      return;
    }
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `grafico_${chartType}_${columnaSeleccionada}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success("Descarga iniciada", `Gráfico ${chartLabels[chartType as TipoGrafico] || chartType} descargado`);
  };

  const statLabelMap: Record<string, string> = {
    total: "Total registros",
    media: "Media",
    mediana: "Mediana",
    desviacion: "Desv. Estándar",
    minimo: "Mínimo",
    maximo: "Máximo",
    q1: "Q1 (25%)",
    q3: "Q3 (75%)",
    iqr: "Rango Intercuartílico",
    columna: "Columna",
    etiquetas: "Etiqueta",
    categories: "Categorías",
    top_category: "Categoría principal",
    bins: "Intervalos",
    trend_slope: "Pendencia tendencia",
    r_squared: "R²",
  };

  const chartLabels: Record<TipoGrafico, string> = {
    barras: "Barras",
    lineas: "Líneas",
    dispersion: "Dispersión",
    circular: "Circular",
    histograma: "Histograma",
    caja: "Diagrama de Caja",
    violin: "Violín",
    todos: "Todos",
  };

  const renderSingleChart = () => {
    const imgSrc = imagenesGraficos[tipo];
    const currentStats = datosEstadisticos?.por_tipo?.[tipo] || datosEstadisticos;
    const hasError = currentStats?.error;
    const isEmpty = !imgSrc || imgSrc.length === 0;

    if (isEmpty || hasError) {
      return (
        <div className="chart-container" style={{ marginBottom: 24, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <ChartIcon type={tipo} size={24} style={{ color: hasError ? "#ef4444" : "#94a3b8" }} />
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: hasError ? "#ef4444" : "#0f172a" }}>
              {chartLabels[tipo]}
              {hasError && <span style={{ fontSize: 12, marginLeft: 8 }}>⚠</span>}
            </h4>
          </div>
          <div style={{ padding: 32, background: hasError ? "#fef2f2" : "#f8fafc", borderRadius: 8, border: `1px solid ${hasError ? "#fecaca" : "#e2e8f0"}` }}>
            <p style={{ margin: "0 0 8px", color: hasError ? "#991b1b" : "#64748b", fontWeight: 600 }}>
              {hasError ? "Error al generar gráfico:" : "No hay datos disponibles para este tipo de gráfico"}
            </p>
            {hasError && <pre style={{ fontSize: 11, color: "#7f1d1d", textAlign: "left", background: "#fff", padding: 8, borderRadius: 4, overflow: "auto" }}>{currentStats.error}</pre>}
          </div>
        </div>
      );
    }

    return (
      <div ref={chartContainerRef} className="chart-container" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ChartIcon type={tipo} size={20} style={{ color: "#1e3a5f" }} />
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                {chartLabels[tipo]}
              </h4>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{timestamp}</span>
            </div>
          </div>
          <Button onClick={() => descargarChart(tipo, imgSrc)} variant="secondary" style={{ fontSize: 12, padding: "6px 14px" }}>
            Descargar PNG
          </Button>
        </div>
        <img 
          src={imgSrc} 
          alt={`Gráfico ${tipo}`} 
          style={{ width: "100%", borderRadius: 8, cursor: "zoom-in" }}
          onClick={() => openExpandedChart(tipo, imgSrc, currentStats)}
        />

        {currentStats && !currentStats.error && (
          <div style={{ marginTop: 16, padding: 14, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <h5 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#334155" }}>Estadísticas</h5>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {Object.entries(currentStats).map(([key, val]) => (
                <div key={key} style={{
                  padding: "8px 12px",
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>
                    {statLabelMap[key] || key}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMultiChart = () => {
    if (Object.keys(imagenesGraficos).length === 0) return null;

    const chartEntries = Object.entries(imagenesGraficos);

    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              Vista Múltiple: {columnaSeleccionada}
            </h4>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{timestamp}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chartEntries
              .filter(([, imgSrc]) => imgSrc && imgSrc.length > 0)
              .map(([chartType]) => (
                <Button
                  key={chartType}
                  onClick={() => descargarChart(chartType, imagenesGraficos[chartType])}
                  variant="secondary"
                  style={{ fontSize: 11, padding: "5px 10px" }}
                >
                  {chartLabels[chartType as TipoGrafico]}
                </Button>
              ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 16 }}>
          {chartEntries.map(([chartType, imgSrc]) => {
            const chartStats = datosEstadisticos?.por_tipo?.[chartType];
            const hasError = chartStats?.error;
            const isEmpty = !imgSrc || imgSrc.length === 0;

            return (
              <div key={chartType} className="chart-container" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ChartIcon type={chartType as TipoGrafico} size={18} style={{ color: hasError ? "#ef4444" : "#1e3a5f" }} />
                    <span style={{ fontWeight: 600, color: hasError ? "#ef4444" : "#0f172a", fontSize: "0.95rem" }}>
                      {chartLabels[chartType as TipoGrafico]}
                      {hasError && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 500, marginLeft: 6 }}>⚠</span>}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {!isEmpty && !hasError && (
                      <Button
                        onClick={() => openExpandedChart(chartType, imgSrc, chartStats)}
                        variant="secondary"
                        style={{ fontSize: 11, padding: "4px 10px" }}
                        title="Expandir gráfico"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6" />
                          <path d="M9 21H3v-6" />
                          <path d="M21 3l-7 7" />
                          <path d="M3 21l7-7" />
                        </svg>
                      </Button>
                    )}
                    {!isEmpty && !hasError && (
                      <Button
                        onClick={() => descargarChart(chartType, imgSrc)}
                        variant="secondary"
                        style={{ fontSize: 11, padding: "4px 10px" }}
                      >
                        Descargar
                      </Button>
                    )}
                  </div>
                </div>
                {isEmpty || hasError ? (
                  <div style={{ padding: 32, textAlign: "center", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                    <p style={{ margin: "0 0 8px", color: "#991b1b", fontWeight: 600 }}>
                      {hasError ? "Error al generar:" : "No disponible"}
                    </p>
                    {hasError && <pre style={{ fontSize: 11, color: "#7f1d1d", textAlign: "left", background: "#fff", padding: 8, borderRadius: 4, overflow: "auto" }}>{chartStats.error}</pre>}
                  </div>
                ) : (
                  <>
                    <img 
                      src={imgSrc} 
                      alt={`Gráfico ${chartType}`} 
                      style={{ width: "100%", borderRadius: 6, cursor: "zoom-in" }}
                      onClick={() => openExpandedChart(chartType, imgSrc, chartStats)}
                    />
                    {chartStats && !chartStats.error && (
                      <div style={{ marginTop: 10, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: 10 }}>
                          {Object.entries(chartStats).map(([key, val]) => (
                            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>
                                {statLabelMap[key] || key}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                                {String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        {datosEstadisticos && (
          <div style={{ marginTop: 24, padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <h5 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#334155" }}>Resumen Estadístico Global</h5>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {["total", "media", "mediana", "desviacion", "minimo", "maximo", "q1", "q3", "iqr"].map((key) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 2 }} data-value={datosEstadisticos[key]}>
                  <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>
                    {statLabelMap[key] || key}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    {typeof datosEstadisticos[key] === 'number' ? datosEstadisticos[key].toFixed(4) : String(datosEstadisticos[key] || '-')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.5, 5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.5, 0.5));
  const handleZoomReset = () => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: panStart.current.x + (e.clientX - dragStart.current.x),
      y: panStart.current.y + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStart.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current > 0) {
        const scale = dist / lastTouchDist.current;
        setZoomLevel((z) => Math.min(Math.max(z * scale, 0.5), 5));
      }
      lastTouchDist.current = dist;
    } else if (isDragging && e.touches.length === 1) {
      setPanOffset({
        x: panStart.current.x + (e.touches[0].clientX - dragStart.current.x),
        y: panStart.current.y + (e.touches[0].clientY - dragStart.current.y),
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDist.current = 0;
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) { handleZoomReset(); }
    else { setZoomLevel(2); }
  };

  return (
    <>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0f172a" }}>Gráficos con Matplotlib (Python)</h3>
        </div>

        {cargando ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Cargando datos...</p>
          </div>
        ) : !hayDatos ? (
          <div className="dashboard-empty">
            <p>No hay datos. Primero procesa un CSV en Pandas.</p>
            <div style={{ marginTop: "12px" }}>
              <Button onClick={() => navigate("/Dashboard/pandas")}>Ir a Pandas</Button>
            </div>
          </div>
        ) : (
          <>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Columna principal</label>
            <select
              id="graficos-columna"
              name="graficos-columna"
              value={columnaSeleccionada}
              onChange={(e) => setColumnaSeleccionada(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14, border: "1px solid #cbd5e1", background: "#fff" }}
            >
              {columnasNumericas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#f1f5f9", padding: 4, borderRadius: 8 }}>
            <button
              onClick={() => setVistaActual("single")}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: vistaActual === "single" ? "#1e3a5f" : "transparent",
                color: vistaActual === "single" ? "#fff" : "#334155",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              Vista Simple
            </button>
            <button
              onClick={() => generarGrafico("barras", true)}
              disabled={generando}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: vistaActual === "multi" ? "#059669" : "transparent",
                color: vistaActual === "multi" ? "#fff" : "#334155",
                fontWeight: 600,
                fontSize: 13,
                cursor: generando ? "wait" : "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                opacity: generando ? 0.5 : 1,
              }}
            >
              <ChartIcon type="todos" size={14} style={{ marginRight: 6 }} />
              Vista Múltiple (7 gráficos)
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {CHART_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => generarGrafico(t.key, false)}
                disabled={generando}
                title={t.description}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "2px solid",
                  borderColor: tipo === t.key && imagenesGraficos[tipo] ? "#1e3a5f" : "#e2e8f0",
                  background: tipo === t.key && imagenesGraficos[tipo] ? "#eef2ff" : "#fff",
                  cursor: generando ? "wait" : "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                  transition: "all 0.2s",
                  opacity: generando ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                  color: tipo === t.key && imagenesGraficos[tipo] ? "#1e3a5f" : "#334155",
                }}
              >
                <ChartIcon type={t.key} size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {generando && (
            <div className="loading-state" style={{ padding: 20 }}>
              <div className="loading-spinner" />
              <p>{vistaActual === "multi" ? "Generando 7 gráficos con matplotlib..." : "Generando gráfico con matplotlib..."}</p>
            </div>
          )}

          {error && (
            <div className="info-banner" style={{ color: "#991b1b", background: "#fef2f2", borderColor: "#ef4444", padding: 14, borderRadius: 10, marginBottom: 16, borderLeft: "4px solid #ef4444" }}>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: 13 }}>Error:</p>
              <pre style={{ marginTop: 8, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: "monospace", color: "#7f1d1d" }}>{error}</pre>
            </div>
          )}

          {vistaActual === "multi" ? renderMultiChart() : renderSingleChart()}
        </>
      )}
    </div>

    {/* Expanded Chart Modal */}
    {expandedChart && (
      <div
        className="modal-overlay"
        onClick={closeExpandedChart}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "var(--radius-xl)",
            maxWidth: "95vw",
            maxHeight: "95vh",
            width: "90vw",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            animation: "scaleIn 0.2s ease-out",
            overflow: "hidden",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid #e2e8f0",
            flexShrink: 0,
            flexWrap: "wrap",
            gap: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <ChartIcon type={expandedChart.type as TipoGrafico} size={22} style={{ color: "#1e3a5f", flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {chartLabels[expandedChart.type as TipoGrafico]}
                </h3>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{timestamp}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
              {/* Zoom controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", borderRadius: 8, padding: "3px 6px", marginRight: 6 }}>
                <button onClick={handleZoomOut} title="Alejar" style={{ width: 32, height: 32, borderRadius: 6, border: "none", background: "transparent", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, fontFamily: "inherit" }}>−</button>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", minWidth: 38, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{Math.round(zoomLevel * 100)}%</span>
                <button onClick={handleZoomIn} title="Acercar" style={{ width: 32, height: 32, borderRadius: 6, border: "none", background: "transparent", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, fontFamily: "inherit" }}>+</button>
                {zoomLevel !== 1 && (
                  <button onClick={handleZoomReset} title="Restablecer" style={{ width: 32, height: 32, borderRadius: 6, border: "none", background: "transparent", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                )}
              </div>
              <Button
                onClick={() => descargarChart(expandedChart.type, expandedChart.src)}
                variant="secondary"
                style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Descargar
              </Button>
              <button
                onClick={closeExpandedChart}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={imgContainerRef}
            style={{
              flex: 1,
              overflow: zoomLevel > 1 ? "hidden" : "auto",
              padding: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              touchAction: zoomLevel > 1 ? "none" : "auto",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={expandedChart.src}
              alt={`Gráfico ${expandedChart.type} ampliado`}
              onDoubleClick={handleDoubleClick}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: 8,
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.2s ease",
                userSelect: "none",
              }}
            />
          </div>
          {expandedChart.stats && !expandedChart.stats.error && (
            <div style={{
              padding: "16px 20px",
              borderTop: "1px solid #e2e8f0",
              background: "#f8fafc",
              flexShrink: 0,
              maxHeight: "30vh",
              overflow: "auto",
            }}>
              <h5 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: "#334155" }}>Estadísticas</h5>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {Object.entries(expandedChart.stats).map(([key, val]) => (
                  <div key={key} style={{
                    padding: "8px 12px",
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.03em", fontWeight: 600 }}>
                      {statLabelMap[key] || key}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

export default Graficos;