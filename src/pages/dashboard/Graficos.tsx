import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import TabSelector from "../../components/common/TabSelector";
import StatBadge from "../../components/common/StatBadge";
import { cargarDatos } from "../../utils/storage";
import { getPyodide } from "../../utils/pyodide";
import matplotlibChartScript from "../../scripts/matplotlib_chart.py?raw";
import "../dashboard/Dashboard.css";

type TipoGrafico = "barras" | "lineas" | "dispersion" | "circular";

function Graficos() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [cargandoPyodide, setCargandoPyodide] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [hayDatos, setHayDatos] = useState(false);
  const [columnasNumericas, setColumnasNumericas] = useState<string[]>([]);
  const [columnaSeleccionada, setColumnaSeleccionada] = useState("");
  const [tipo, setTipo] = useState<TipoGrafico>("barras");
  const [imagenGrafico, setImagenGrafico] = useState("");
  const [datosEstadisticos, setDatosEstadisticos] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      const guardados = cargarDatos();
      if (guardados && guardados.datosLimpios.length > 0) {
        const cols = guardados.columnas.filter((col) => {
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

  const generarGrafico = async (tipoGrafico: TipoGrafico) => {
    if (!columnaSeleccionada) return;
    setGenerando(true);
    setTipo(tipoGrafico);
    setImagenGrafico("");
    setDatosEstadisticos(null);
    setError("");

    try {
      const guardados = cargarDatos();
      if (!guardados) return;

      setCargandoPyodide(true);
      let py: any;
      try {
        py = await getPyodide();
        await py.loadPackage(["pandas", "numpy", "matplotlib"]);
      } finally {
        setCargandoPyodide(false);
      }

      py.globals.set("csv_content", guardados.csvRaw);
      py.globals.set("selected_col", columnaSeleccionada);
      py.globals.set("tipo_grafico", tipoGrafico);

      const res = await py.runPythonAsync(matplotlibChartScript);
      const parsed = JSON.parse(res);
      setImagenGrafico(parsed.grafico);
      setDatosEstadisticos(parsed.stats);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || String(err));
    }

    setGenerando(false);
  };

  const tipos: { key: TipoGrafico; label: string }[] = [
    { key: "barras", label: "Barras" },
    { key: "lineas", label: "Lineas" },
    { key: "dispersion", label: "Dispersion" },
    { key: "circular", label: "Circular" },
  ];

  return (
    <div className="card">
      <h3>Graficos con Matplotlib (Python)</h3>

      {cargando ? (
        <p>Cargando...</p>
      ) : !hayDatos ? (
        <div className="dashboard-empty">
          <p>No hay datos. Primero procesa un CSV en Pandas.</p>
          <div style={{ marginTop: "12px" }}>
            <Button onClick={() => navigate("/Dashboard/pandas")}>Ir a Pandas</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="btn-row">
            <label style={{ fontSize: "13px", fontWeight: "bold", color: "#64748b" }}>Columna a graficar:</label>
            <select
              value={columnaSeleccionada}
              onChange={(e) => setColumnaSeleccionada(e.target.value)}
              style={{ padding: "10px 14px", borderRadius: "6px", fontSize: "14px", border: "1px solid #cbd5e1", minWidth: "150px" }}
            >
              {columnasNumericas.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <Button onClick={() => navigate("/Dashboard/numpy")}>Volver a NumPy</Button>
          </div>

          <TabSelector
            tabs={tipos}
            active={tipo}
            onChange={(key) => generarGrafico(key)}
            disabled={generando}
          />

          {cargandoPyodide && (
            <div className="info-banner" style={{ color: "#6366f1", background: "#eef2ff", borderColor: "#6366f1" }}>
              Cargando Pyodide + matplotlib (primera vez puede tardar)...
            </div>
          )}

          {generando && (
            <div className="dashboard-loading">
              Generando grafico con matplotlib...
            </div>
          )}

          {error && (
            <div className="info-banner" style={{ color: "#991b1b", background: "#fef2f2", borderColor: "#ef4444" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Error:</p>
              <pre style={{ marginTop: "8px", fontSize: "13px", whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{error}</pre>
            </div>
          )}

          {imagenGrafico && (
            <div className="chart-container">
              <img src={imagenGrafico} alt="Grafico" />

              {datosEstadisticos && (
                <div className="chart-stats">
                  {Object.entries(datosEstadisticos).map(([key, val]) => (
                    <StatBadge key={key} label={key} value={String(val)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Graficos;
