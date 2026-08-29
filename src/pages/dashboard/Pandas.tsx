import { useState, useEffect, useRef, useMemo, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { abrirVentanaDatos } from "../../components/DataViewer";
import { guardarDatos, cargarDatos, limpiarDatosStorage } from "../../utils/storage";
import { getPyodide } from "../../utils/pyodide";
import pandasCleanScript from "../../scripts/pandas_clean.py?raw";
import { useToast } from "../../context/ToastContext";


type VistaActiva = "limpios" | "originales" | "reporte";

interface CleaningStep {
  label: string;
  done: boolean;
}

interface QualityIssue {
  count: number;
  description: string;
  severity: "critical" | "warning" | "clean";
}

interface FullReporte {
  totalFilasOriginal: number;
  totalFilasLimpias: number;
  columnas: number;
  duplicateRows: QualityIssue;
  missingPerColumn: Record<string, number>;
  textErrors: QualityIssue;
  typeMismatches: QualityIssue;
  dateIssues: QualityIssue;
  outliers: QualityIssue;
  inconsistentCategories: QualityIssue;
  unnecessaryColumns: QualityIssue;
  incorrectRows: QualityIssue;
  cleaningSummary: string[];
}

function Pandas() {
  const navigate = useNavigate();
  const { success, error: toastError, info, loading: toastLoading } = useToast();
  const [, setPy] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [csvRaw, setCsvRaw] = useState("");
  const [datosOriginales, setDatosOriginales] = useState<Record<string, any>[]>([]);
  const [datosLimpios, setDatosLimpios] = useState<Record<string, any>[]>([]);
  const [columnas, setColumnas] = useState<string[]>([]);
  const [fullReport, setFullReport] = useState<FullReporte | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("limpios");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(15);
  const [dragOver, setDragOver] = useState(false);
  const [columnasVisibles, setColumnasVisibles] = useState<Set<string>>(new Set());
  const [showColToggles, setShowColToggles] = useState(false);
  const [cleaningSteps, setCleaningSteps] = useState<CleaningStep[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const guardados = cargarDatos();
    if (guardados) {
      setColumnas(guardados.columnas);
      setDatosOriginales(guardados.datosOriginales);
      setDatosLimpios(guardados.datosLimpios);
      setNombreArchivo(guardados.nombreArchivo);
      setCsvRaw(guardados.csvRaw);
      setColumnasVisibles(new Set(guardados.columnas));

      const origCount = guardados.datosOriginales.length;
      const limpioCount = guardados.datosLimpios.length;
      const dupCount = countDuplicates(guardados.datosOriginales);

      setFullReport({
        totalFilasOriginal: origCount,
        totalFilasLimpias: limpioCount,
        columnas: guardados.columnas.length,
        duplicateRows: {
          count: dupCount,
          description: `${dupCount} fila(s) duplicada(s) eliminada(s)`,
          severity: dupCount > 0 ? "critical" : "clean",
        },
        missingPerColumn: computeMissingPerColumn(guardados.datosOriginales, guardados.columnas),
        textErrors: { count: 0, description: "Errores de formato de texto detectados", severity: "clean" },
        typeMismatches: { count: 0, description: "Tipos de dato inconsistentes", severity: "clean" },
        dateIssues: { count: 0, description: "Fechas con formato inválido", severity: "clean" },
        outliers: { count: 0, description: "Valores atípicos numéricos", severity: "clean" },
        inconsistentCategories: { count: 0, description: "Categorías con variación inconsistente", severity: "clean" },
        unnecessaryColumns: { count: 0, description: "Columnas vacías o sin utilidad", severity: "clean" },
        incorrectRows: { count: 0, description: "Filas con datos erróneos", severity: "clean" },
        cleaningSummary: [],
      });
    }
  }, []);

  const computeMissingPerColumn = (data: Record<string, any>[], cols: string[]): Record<string, number> => {
    const result: Record<string, number> = {};
    cols.forEach((col) => {
      let count = 0;
      data.forEach((row) => {
        const val = row[col];
        if (val === null || val === undefined || val === "" || val === "NaN" || val === "null" || val === "None" || val === "nan") {
          count++;
        }
      });
      if (count > 0) result[col] = count;
    });
    return result;
  };

  const countDuplicates = (data: Record<string, any>[]): number => {
    const claves = data.map((r) => JSON.stringify(r));
    return data.length - new Set(claves).size;
  };

  const ejecutarLimpieza = async (raw: string, nombre: string) => {
    if (!raw || !raw.trim()) {
      toastError("Archivo vacío", "El archivo CSV no contiene datos legibles");
      return;
    }
    if (cargando) return; // Prevent multiple simultaneous executions
    setCargando(true);

    const steps: CleaningStep[] = [
      { label: "Cargando Pyodide + Pandas...", done: false },
      { label: "Leyendo CSV...", done: false },
      { label: "Detectando duplicados...", done: false },
      { label: "Rellenando valores vacíos...", done: false },
      { label: "Corrigiendo errores de texto...", done: false },
      { label: "Verificando tipos de dato...", done: false },
      { label: "Detectando valores atípicos...", done: false },
      { label: "Generando reporte de calidad...", done: false },
    ];
    setCleaningSteps(steps);

    const { dismiss } = toastLoading("Procesando CSV", "Cargando Pyodide y Pandas...");

    try {
      setCleaningSteps((s) => s.map((step, i) => (i === 0 ? { ...step, done: true } : step)));

      const pyInst = await getPyodide();
      await pyInst.loadPackage(["pandas", "numpy"]);
      setPy(pyInst);

      setCleaningSteps((s) => s.map((step, i) => (i === 1 ? { ...step, done: true } : step)));

      pyInst.globals.set("csv_content", raw);
      const result = await pyInst.runPythonAsync(pandasCleanScript);
      
      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch (parseErr) {
        console.error("Error parseando resultado:", parseErr, "Resultado:", result.substring(0, 500));
        throw new Error("Respuesta inválida del procesador de datos");
      }

      if (!parsed || !parsed.columnas || !Array.isArray(parsed.columnas)) {
        throw new Error("Formato de respuesta inválido");
      }

      setCleaningSteps((s) =>
        s.map((step, i) => (i >= 2 && i <= 7 ? { ...step, done: true } : step))
      );

      const missing = parsed.missing_per_column || {};
      const textErr = parsed.text_errors ?? 0;
      const typeMis = parsed.type_mismatches ?? 0;
      const dateIss = parsed.date_issues ?? 0;
      const outl = parsed.outliers ?? 0;
      const incoCat = parsed.inconsistent_categories ?? 0;
      const unnecCols = parsed.unnecessary_columns ?? 0;
      const incorrRows = parsed.incorrect_rows ?? 0;
      const dupRows = parsed.duplicate_rows ?? 0;

      setFullReport({
        totalFilasOriginal: parsed.total_filas_original ?? (parsed.total_filas + dupRows),
        totalFilasLimpias: parsed.total_filas,
        columnas: parsed.columnas.length,
        duplicateRows: {
          count: dupRows,
          description: dupRows > 0 ? `${dupRows} fila(s) duplicada(s) eliminada(s)` : "No se encontraron duplicados",
          severity: dupRows > 0 ? "critical" : "clean",
        },
        missingPerColumn: missing,
        textErrors: {
          count: textErr,
          description: textErr > 0 ? `${textErr} error(es) de texto corregido(s)` : "Sin errores de texto",
          severity: textErr > 0 ? "warning" : "clean",
        },
        typeMismatches: {
          count: typeMis,
          description: typeMis > 0 ? `${typeMis} columna(s) con tipo(s) incorrecto(s)` : "Tipos de dato correctos",
          severity: typeMis > 0 ? "warning" : "clean",
        },
        dateIssues: {
          count: dateIss,
          description: dateIss > 0 ? `${dateIss} fecha(s) con formato inválido` : "Fechas correctas",
          severity: dateIss > 0 ? "warning" : "clean",
        },
        outliers: {
          count: outl,
          description: outl > 0 ? `${outl} valor(es) atípico(s) detectado(s)` : "Sin valores atípicos",
          severity: outl > 0 ? "warning" : "clean",
        },
        inconsistentCategories: {
          count: incoCat,
          description: incoCat > 0 ? `${incoCat} columna(s) con categorías inconsistentes` : "Categorías consistentes",
          severity: incoCat > 0 ? "warning" : "clean",
        },
        unnecessaryColumns: {
          count: unnecCols,
          description: unnecCols > 0 ? `${unnecCols} columna(s) innecesaria(s) identificada(s)` : "Todas las columnas son útiles",
          severity: unnecCols > 0 ? "warning" : "clean",
        },
        incorrectRows: {
          count: incorrRows,
          description: incorrRows > 0 ? `${incorrRows} fila(s) con datos erróneos corregida(s)` : "Datos correctos",
          severity: incorrRows > 0 ? "critical" : "clean",
        },
        cleaningSummary: parsed.cleaning_summary || [],
      });

      setColumnas(parsed.columnas);
      setColumnasVisibles(new Set(parsed.columnas));
      setDatosOriginales(parsed.originales);
      setDatosLimpios(parsed.limpios);
      setPaginaActual(1);

      guardarDatos({
        columnas: parsed.columnas,
        datosOriginales: parsed.originales,
        datosLimpios: parsed.limpios,
        csvRaw: raw,
        nombreArchivo: nombre,
      });

      dismiss("success", `${parsed.total_filas} filas procesadas. ${dupRows} duplicados eliminados. ${textErr} errores de texto corregidos.`);
      window.location.reload();
    } catch (err: any) {
      console.error("Error en limpieza:", err);
      const msg = err?.message?.includes("JSON") || err?.message?.includes("parse") 
        ? "Error procesando la respuesta del servidor" 
        : "No se pudo procesar el archivo CSV. Verifica el formato e intenta de nuevo.";
      dismiss("error", msg);
    }

    setCargando(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toastError("Archivo inválido", "Solo se permiten archivos CSV (.csv)");
      return;
    }

    if (file.size === 0) {
      toastError("Archivo vacío", "El archivo CSV no contiene datos");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toastError("Archivo muy grande", "El archivo supera el límite de 50 MB");
      return;
    }

    const nombre = file.name.replace(/\.csv$/i, "");
    setNombreArchivo(nombre);
    setDatosOriginales([]);
    setDatosLimpios([]);
    setFullReport(null);
    info("Archivo seleccionado", `Leyendo ${file.name}...`);

    file.text()
      .then((raw) => {
        if (!raw || !raw.trim()) {
          toastError("Archivo vacío", "El archivo CSV no contiene datos legibles");
          return;
        }
        setCsvRaw(raw);
        ejecutarLimpieza(raw, nombre);
      })
      .catch((err) => {
        console.error("Error leyendo archivo:", err);
        toastError("Error de lectura", "No se pudo leer el archivo. Verifica permisos e intenta de nuevo.");
      });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toastError("Archivo inválido", "Solo se permiten archivos CSV (.csv)");
      return;
    }

    if (file.size === 0) {
      toastError("Archivo vacío", "El archivo CSV no contiene datos");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toastError("Archivo muy grande", "El archivo supera el límite de 50 MB");
      return;
    }

    const nombre = file.name.replace(/\.csv$/i, "");
    setNombreArchivo(nombre);
    setDatosOriginales([]);
    setDatosLimpios([]);
    setFullReport(null);
    info("Archivo soltado", `Leyendo ${file.name}...`);

    file.text()
      .then((raw) => {
        if (!raw || !raw.trim()) {
          toastError("Archivo vacío", "El archivo CSV no contiene datos legibles");
          return;
        }
        setCsvRaw(raw);
        ejecutarLimpieza(raw, nombre);
      })
      .catch((err) => {
        console.error("Error leyendo archivo:", err);
        toastError("Error de lectura", "No se pudo leer el archivo. Verifica permisos e intenta de nuevo.");
      });
  };

  const cargarDatasetEjemplo = async (path: string, nombre: string) => {
    try {
      info("Cargando dataset", `Descargando ${nombre}...`);
      setNombreArchivo(nombre);
      setDatosOriginales([]);
      setDatosLimpios([]);
      setFullReport(null);
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.text();
      if (!raw || !raw.trim()) {
        toastError("Archivo vacío", "El dataset de ejemplo no contiene datos");
        return;
      }
      setCsvRaw(raw);
      ejecutarLimpieza(raw, nombre);
    } catch (err) {
      console.error("Error al cargar dataset:", err);
      toastError("Error al cargar", "No se pudo cargar el dataset de ejemplo");
    }
  };

  const recargarArchivo = () => {
    limpiarDatosStorage();
    setCsvRaw("");
    setDatosOriginales([]);
    setDatosLimpios([]);
    setColumnas([]);
    setFullReport(null);
    setNombreArchivo("");
    setPaginaActual(1);
    setColumnasVisibles(new Set());
    setCleaningSteps([]);
    setPy(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    info("Nuevo archivo", "Listo para cargar un nuevo CSV");
  };

  const descargarCSV = (limpio: boolean) => {
    const data = limpio ? datosLimpios : datosOriginales;
    if (data.length === 0) {
      toastError("Sin datos", "No hay datos para descargar");
      return;
    }
    const header = columnas.join(",");
    const rows = data.map((row) =>
      columnas.map((col) => {
        const val = row[col];
        return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombreArchivo || "datos"}_${limpio ? "limpios" : "originales"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success("Descarga iniciada", `CSV ${limpio ? "limpio" : "original"} descargado correctamente`);
  };

  const descargarJSON = (limpio: boolean) => {
    const data = limpio ? datosLimpios : datosOriginales;
    if (data.length === 0) {
      toastError("Sin datos", "No hay datos para descargar");
      return;
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombreArchivo || "datos"}_${limpio ? "limpios" : "originales"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success("Descarga iniciada", `JSON ${limpio ? "limpio" : "original"} descargado correctamente`);
  };

  const datosActuales = useMemo(() => {
    return vistaActiva === "limpios" ? datosLimpios : datosOriginales;
  }, [datosLimpios, datosOriginales, vistaActiva]);

  const totalPaginas = Math.ceil(datosActuales.length / filasPorPagina);
  const datosPaginados = datosActuales.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  const columnasVisiblesArr = useMemo(
    () => columnas.filter((col) => columnasVisibles.has(col)),
    [columnas, columnasVisibles]
  );

  const toggleColumna = (col: string) => {
    setColumnasVisibles((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const seleccionarTodasCols = () => setColumnasVisibles(new Set(columnas));
  const ocultarTodasCols = () => setColumnasVisibles(new Set());

  const getSeverityColor = (severity: "critical" | "warning" | "clean") => {
    switch (severity) {
      case "critical": return { bg: "#fef2f2", border: "#dc2626", text: "#991b1b", icon: "✕" };
      case "warning": return { bg: "#fffbeb", border: "#d97706", text: "#92400e", icon: "⚠" };
      case "clean": return { bg: "#f0fdf4", border: "#16a34a", text: "#166534", icon: "✓" };
    }
  };

  const duplicateCount = fullReport?.duplicateRows.count ?? 0;
  const missingTotal = fullReport ? Object.values(fullReport.missingPerColumn).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="card pandas-card">
      <div className="card-header">
        <div>
          <h3>Limpieza y Preparación de Datos</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>Powered by Pandas + Pyodide</p>
        </div>
        {csvRaw && (
          <Button onClick={recargarArchivo} variant="secondary">Nuevo archivo</Button>
        )}
      </div>

      {!csvRaw ? (
        <div>
          <div
            className={`upload-zone${dragOver ? " drag-over" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: "none" }} />
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="upload-text">Arrastra o haz clic para cargar un archivo CSV</p>
            <p className="upload-hint">Los datos se limpiarán automáticamente al subir el archivo</p>
          </div>

          <div style={{ marginTop: 24, padding: "16px 20px", background: "var(--slate-50, #f8fafc)", borderRadius: 12, border: "1px solid var(--border-color, #e2e8f0)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: "1rem" }}>⚡</span>
              <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 600, color: "var(--text-main, #0f172a)" }}>
                Datasets de ejemplo listos para probar:
              </h4>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <div
                onClick={() => cargarDatasetEjemplo("/csv/ventas_ejemplo.csv", "ventas_ejemplo")}
                style={{
                  padding: "12px 14px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1e293b" }}>Ventas Retail</span>
                  <span style={{ fontSize: "0.72rem", background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>20 filas</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Fechas mixtas, nulos y duplicados
                </span>
              </div>

              <div
                onClick={() => cargarDatasetEjemplo("/csv/productos_tecnologia.csv", "productos_tecnologia")}
                style={{
                  padding: "12px 14px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1e293b" }}>Catálogo Tecnología</span>
                  <span style={{ fontSize: "0.72rem", background: "#f0fdf4", color: "#16a34a", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>50 filas</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  50 registros con variedad de categorías
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : cargando ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Procesando y limpiando datos con Pandas...</p>
          <div style={{ marginTop: "1rem", width: "100%", maxWidth: 400, textAlign: "left" }}>
            {cleaningSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0",
                  color: step.done ? "#16a34a" : "#64748b",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ width: 18, textAlign: "center" }}>
                  {step.done ? "✓" : <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#6366f1", animation: "pulse 1s infinite" }} />}
                </span>
                <span style={{ textDecoration: step.done ? "none" : "none", opacity: step.done ? 1 : 0.7 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {fullReport && (
            <div className="stats-grid" style={{ marginBottom: "1rem" }}>
              <div className="stat-card">
                <span className="stat-value">{fullReport.totalFilasOriginal}</span>
                <span className="stat-label">Filas originales</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{fullReport.totalFilasLimpias}</span>
                <span className="stat-label">Filas limpias</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{fullReport.columnas}</span>
                <span className="stat-label">Columnas</span>
              </div>
              <div className="stat-card" style={{ borderColor: duplicateCount > 0 ? "#dc2626" : undefined }}>
                <span className="stat-value" style={{ color: duplicateCount > 0 ? "#dc2626" : undefined }}>{duplicateCount}</span>
                <span className="stat-label">Duplicados</span>
              </div>
              <div className="stat-card" style={{ borderColor: missingTotal > 0 ? "#d97706" : undefined }}>
                <span className="stat-value" style={{ color: missingTotal > 0 ? "#d97706" : undefined }}>{missingTotal}</span>
                <span className="stat-label">Vacíos corregidos</span>
              </div>
              <div className="stat-card" style={{ borderColor: fullReport.textErrors.count > 0 ? "#d97706" : undefined }}>
                <span className="stat-value" style={{ color: fullReport.textErrors.count > 0 ? "#d97706" : undefined }}>{fullReport.textErrors.count}</span>
                <span className="stat-label">Errores de texto</span>
              </div>
              <div className="stat-card" style={{ borderColor: fullReport.outliers.count > 0 ? "#d97706" : undefined }}>
                <span className="stat-value" style={{ color: fullReport.outliers.count > 0 ? "#d97706" : undefined }}>{fullReport.outliers.count}</span>
                <span className="stat-label">Outliers</span>
              </div>
              <div className="stat-card" style={{ borderColor: fullReport.inconsistentCategories.count > 0 ? "#d97706" : undefined }}>
                <span className="stat-value" style={{ color: fullReport.inconsistentCategories.count > 0 ? "#d97706" : undefined }}>{fullReport.inconsistentCategories.count}</span>
                <span className="stat-label">Categorías inco.</span>
              </div>
            </div>
          )}

          <div className="btn-row table-controls" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${vistaActiva === "limpios" ? "active" : ""}`}
                onClick={() => { setVistaActiva("limpios"); setPaginaActual(1); }}
              >
                Datos Limpios
                <span style={{
                  display: "inline-block",
                  marginLeft: "0.4rem",
                  padding: "0.1rem 0.45rem",
                  borderRadius: 999,
                  fontSize: "0.7rem",
                  background: vistaActiva === "limpios" ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                  color: vistaActiva === "limpios" ? "#fff" : "#64748b",
                  fontWeight: 600,
                }}>
                  {datosLimpios.length}
                </span>
              </button>
              <button
                className={`toggle-btn ${vistaActiva === "originales" ? "active" : ""}`}
                onClick={() => { setVistaActiva("originales"); setPaginaActual(1); }}
              >
                Datos Originales
                <span style={{
                  display: "inline-block",
                  marginLeft: "0.4rem",
                  padding: "0.1rem 0.45rem",
                  borderRadius: 999,
                  fontSize: "0.7rem",
                  background: vistaActiva === "originales" ? "rgba(255,255,255,0.25)" : "#e2e8f0",
                  color: vistaActiva === "originales" ? "#fff" : "#64748b",
                  fontWeight: 600,
                }}>
                  {datosOriginales.length}
                </span>
              </button>
              <button
                className={`toggle-btn ${vistaActiva === "reporte" ? "active" : ""}`}
                onClick={() => { setVistaActiva("reporte"); setPaginaActual(1); }}
              >
                Reporte
              </button>
            </div>

            {vistaActiva !== "reporte" && (
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowColToggles(!showColToggles)}
                    style={{
                      padding: "0.45rem 0.7rem",
                      borderRadius: "0.375rem",
                      border: "1px solid #334155",
                      background: showColToggles ? "#334155" : "#1e293b",
                      color: "#e2e8f0",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Columnas ▾
                  </button>
                  {showColToggles && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 4,
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "0.5rem",
                      padding: "0.5rem",
                      zIndex: 50,
                      maxHeight: 250,
                      overflowY: "auto",
                      minWidth: 200,
                    }}>
                      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
                        <button onClick={seleccionarTodasCols} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", cursor: "pointer", background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 4 }}>Todas</button>
                        <button onClick={ocultarTodasCols} style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", cursor: "pointer", background: "#334155", color: "#e2e8f0", border: "none", borderRadius: 4 }}>Ninguna</button>
                      </div>
                      {columnas.map((col) => (
                        <label
                          key={col}
                          style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.2rem 0", fontSize: "0.8rem", color: "#cbd5e1", cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={columnasVisibles.has(col)}
                            onChange={() => toggleColumna(col)}
                            style={{ accentColor: "#6366f1" }}
                          />
                          {col}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <select
                  value={filasPorPagina}
                  onChange={(e) => { setFilasPorPagina(Number(e.target.value)); setPaginaActual(1); }}
                  style={{
                    padding: "0.45rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #334155",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    fontSize: "0.85rem",
                  }}
                >
                  <option value={10}>10 filas</option>
                  <option value={25}>25 filas</option>
                  <option value={50}>50 filas</option>
                  <option value={100}>100 filas</option>
                </select>
              </div>
            )}

            <div className="table-actions">
              {vistaActiva !== "reporte" && (
                <>
                  <Button onClick={() => abrirVentanaDatos("Visualizador de Datos", columnas, datosOriginales, datosLimpios)} variant="secondary">Ver Completo</Button>
                </>
              )}
            </div>
          </div>

          {vistaActiva !== "reporte" && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem", marginBottom: "0.5rem" }}>
              <button
                onClick={() => descargarCSV(vistaActiva === "limpios")}
                style={{
                  padding: "0.35rem 0.65rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#e2e8f0",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                ↓ CSV
              </button>
              <button
                onClick={() => descargarJSON(vistaActiva === "limpios")}
                style={{
                  padding: "0.35rem 0.65rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #334155",
                  background: "#1e293b",
                  color: "#e2e8f0",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                ↓ JSON
              </button>
            </div>
          )}

          {vistaActiva === "reporte" && fullReport ? (
            <div style={{ padding: "1rem 0" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#e2e8f0" }}>Reporte de Calidad de Datos</h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Filas originales", value: fullReport.totalFilasOriginal, detail: `→ ${fullReport.totalFilasLimpias} filas limpias`, severity: "clean" as const },
                  { label: "Duplicados", value: fullReport.duplicateRows.count, detail: fullReport.duplicateRows.description, severity: fullReport.duplicateRows.severity },
                  { label: "Valores vacíos", value: missingTotal, detail: Object.keys(fullReport.missingPerColumn).length > 0 ? `En ${Object.keys(fullReport.missingPerColumn).length} columna(s)` : "Sin valores vacíos", severity: missingTotal > 0 ? "warning" as const : "clean" as const },
                  { label: "Errores de texto", value: fullReport.textErrors.count, detail: fullReport.textErrors.description, severity: fullReport.textErrors.severity },
                  { label: "Tipos incorrectos", value: fullReport.typeMismatches.count, detail: fullReport.typeMismatches.description, severity: fullReport.typeMismatches.severity },
                  { label: "Fechas inválidas", value: fullReport.dateIssues.count, detail: fullReport.dateIssues.description, severity: fullReport.dateIssues.severity },
                  { label: "Valores atípicos", value: fullReport.outliers.count, detail: fullReport.outliers.description, severity: fullReport.outliers.severity },
                  { label: "Categorías inco.", value: fullReport.inconsistentCategories.count, detail: fullReport.inconsistentCategories.description, severity: fullReport.inconsistentCategories.severity },
                  { label: "Columnas innecesarias", value: fullReport.unnecessaryColumns.count, detail: fullReport.unnecessaryColumns.description, severity: fullReport.unnecessaryColumns.severity },
                  { label: "Filas erróneas", value: fullReport.incorrectRows.count, detail: fullReport.incorrectRows.description, severity: fullReport.incorrectRows.severity },
                ].map((item) => {
                  const colors = getSeverityColor(item.severity);
                  return (
                    <div
                      key={item.label}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "0.5rem",
                        padding: "0.85rem 1rem",
                        transition: "transform 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: colors.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>{item.label}</span>
                        <span style={{ fontSize: "0.85rem", color: colors.text }}>{colors.icon}</span>
                      </div>
                      <div style={{ fontSize: "1.6rem", fontWeight: 700, color: colors.text, lineHeight: 1 }}>{item.value}</div>
                      <div style={{ fontSize: "0.78rem", color: colors.text, opacity: 0.85, marginTop: "0.3rem" }}>{item.detail}</div>
                    </div>
                  );
                })}
              </div>

              {Object.keys(fullReport.missingPerColumn).length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#d97706", fontSize: "0.95rem" }}>Valores vacíos por columna</h4>
                  <div style={{ background: "#1e293b", borderRadius: "0.5rem", padding: "0.75rem 1rem" }}>
                    {Object.entries(fullReport.missingPerColumn).map(([col, count]) => (
                      <div key={col} style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0", borderBottom: "1px solid #334155", fontSize: "0.85rem" }}>
                        <span style={{ color: "#94a3b8" }}>{col}</span>
                        <span style={{ color: "#d97706", fontWeight: 600 }}>{count} vacío(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fullReport.cleaningSummary.length > 0 && (
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#6366f1", fontSize: "0.95rem" }}>Resumen de limpieza</h4>
                  <div style={{ background: "#1e293b", borderRadius: "0.5rem", padding: "0.75rem 1rem" }}>
                    {fullReport.cleaningSummary.map((line, i) => (
                      <div key={i} style={{ padding: "0.3rem 0", borderBottom: i < fullReport.cleaningSummary.length - 1 ? "1px solid #334155" : "none", fontSize: "0.85rem", color: "#cbd5e1" }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button
                  onClick={() => descargarCSV(true)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #334155",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  ↓ CSV Limpio
                </button>
                <button
                  onClick={() => descargarCSV(false)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #334155",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  ↓ CSV Original
                </button>
                <button
                  onClick={() => descargarJSON(true)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #334155",
                    background: "#1e293b",
                    color: "#e2e8f0",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  ↓ JSON Limpio
                </button>
              </div>
            </div>
          ) : vistaActiva !== "reporte" ? (
            <>
              <div className="table-wrapper expert-table">
                <table>
                  <thead>
                    <tr>
                      <th className="row-num-col">#</th>
                      {columnasVisiblesArr.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados.map((row, idx) => (
                      <tr key={idx}>
                        <td className="row-num-col">{(paginaActual - 1) * filasPorPagina + idx + 1}</td>
                        {columnasVisiblesArr.map((col) => {
                          const val = row[col];
                          const esVacio = val === null || val === undefined || val === "" || val === "NaN" || val === "null" || val === "None" || val === "nan";
                          const esNumero = typeof val === "number" || (typeof val === "string" && !isNaN(Number(String(val).replace(",", "."))) && val !== "");
                          return (
                            <td key={col} className={esVacio ? "cell-empty" : esNumero ? "cell-number" : "cell-text"}>
                              {esVacio ? <span className="empty-marker">—</span> : String(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className="pagination">
                  <button className="pagination-btn" disabled={paginaActual === 1} onClick={() => setPaginaActual(1)}>&laquo;</button>
                  <button className="pagination-btn" disabled={paginaActual === 1} onClick={() => setPaginaActual((p) => p - 1)}>&lsaquo;</button>
                  <span className="pagination-info">
                    Página {paginaActual} de {totalPaginas} ({datosActuales.length} filas)
                  </span>
                  <button className="pagination-btn" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual((p) => p + 1)}>&rsaquo;</button>
                  <button className="pagination-btn" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(totalPaginas)}>&raquo;</button>
                </div>
              )}
            </>
          ) : null}

          <div className="section-divider"></div>

          <div className="next-steps">
            <h4>Siguientes pasos</h4>
            <div className="next-steps-grid">
              <div className="next-step-card" onClick={() => navigate("/Dashboard/numpy")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <div>
                  <strong>Análisis NumPy</strong>
                  <p>Estadística descriptiva, vectores, matrices y transformaciones</p>
                </div>
              </div>
              <div className="next-step-card" onClick={() => navigate("/Dashboard/numpy/graficos")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <div>
                  <strong>Visualizar Gráficos</strong>
                  <p>Barras, líneas, dispersión y circulares con matplotlib</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Pandas;
