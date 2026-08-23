import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { abrirVentanaDatos } from "../../components/DataViewer";
import { guardarDatos, cargarDatos, limpiarDatosStorage } from "../../utils/storage";
import { getPyodide } from "../../utils/pyodide";
import pandasCleanScript from "../../scripts/pandas_clean.py?raw";
import "../dashboard/Dashboard.css";

function Pandas() {
  const navigate = useNavigate();
  const [, setPy] = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [csvRaw, setCsvRaw] = useState("");
  const [datosOriginales, setDatosOriginales] = useState<Record<string, any>[]>([]);
  const [datosLimpios, setDatosLimpios] = useState<Record<string, any>[]>([]);
  const [columnas, setColumnas] = useState<string[]>([]);
  const [reporteLimpieza, setReporteLimpieza] = useState<{
    totalFilas: number;
    vaciosRellenados: number;
    columnasNumericas: number;
    columnasTexto: number;
  } | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const guardados = cargarDatos();
    if (guardados) {
      setColumnas(guardados.columnas);
      setDatosOriginales(guardados.datosOriginales);
      setDatosLimpios(guardados.datosLimpios);
      setNombreArchivo(guardados.nombreArchivo);
      setCsvRaw(guardados.csvRaw);
      setReporteLimpieza({
        totalFilas: guardados.datosLimpios.length,
        vaciosRellenados: guardados.datosOriginales.length - guardados.datosLimpios.length,
        columnasNumericas: 0,
        columnasTexto: 0,
      });
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNombreArchivo(file.name.replace(".csv", ""));
      file.text().then(setCsvRaw);
      setDatosOriginales([]);
      setDatosLimpios([]);
      setReporteLimpieza(null);
    }
  };

  const ejecutarLimpieza = async () => {
    if (!csvRaw) return;
    setCargando(true);

    try {
      const pyInst = await getPyodide();
      await pyInst.loadPackage(["pandas", "numpy"]);
      setPy(pyInst);

      pyInst.globals.set("csv_content", csvRaw);
      const result = await pyInst.runPythonAsync(pandasCleanScript);
      const parsed = JSON.parse(result);

      setReporteLimpieza({
        totalFilas: parsed.total_filas,
        vaciosRellenados: parsed.vacios_rellenados,
        columnasNumericas: parsed.col_numericas,
        columnasTexto: parsed.col_texto,
      });
      setColumnas(parsed.columnas);
      setDatosOriginales(parsed.originales);
      setDatosLimpios(parsed.limpios);

      guardarDatos({
        columnas: parsed.columnas,
        datosOriginales: parsed.originales,
        datosLimpios: parsed.limpios,
        csvRaw,
        nombreArchivo,
      });
    } catch (err) {
      console.error("Error:", err);
    }

    setCargando(false);
  };

  const recargarArchivo = () => {
    limpiarDatosStorage();
    setCsvRaw("");
    setDatosOriginales([]);
    setDatosLimpios([]);
    setColumnas([]);
    setReporteLimpieza(null);
    setNombreArchivo("");
    setPy(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const descargarCSV = () => {
    if (datosLimpios.length === 0) return;
    const header = columnas.join(",");
    const rows = datosLimpios.map((row) =>
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
    a.download = `${nombreArchivo || "datos"}_limpios.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Paso 1: Limpieza y Preparacion de Datos (Pandas)</h3>
        {csvRaw && (
          <Button onClick={recargarArchivo} variant="secondary">Recargar archivo</Button>
        )}
      </div>

      <div className="btn-row" style={{ justifyContent: "center" }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" />
      </div>

      {csvRaw && (
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <Button onClick={ejecutarLimpieza}>{cargando ? "Procesando..." : "Limpiar Datos"}</Button>
          {datosLimpios.length > 0 && (
            <>
              <Button onClick={descargarCSV}>Descargar CSV Limpio</Button>
              <Button onClick={() => abrirVentanaDatos("Visualizador de Datos", columnas, datosOriginales, datosLimpios)}>Ver Datos Completos</Button>
              <Button onClick={() => navigate("/Dashboard/numpy")}>Continuar a Numpy</Button>
            </>
          )}
        </div>
      )}

      {reporteLimpieza && (
        <div className="info-banner" style={{ color: "#117a65", background: "#e8f8f5", borderColor: "#117a65" }}>
          Limpieza completada: {reporteLimpieza.totalFilas} filas, {reporteLimpieza.vaciosRellenados} vacios corregidos, {reporteLimpieza.columnasNumericas} numericas, {reporteLimpieza.columnasTexto} texto.
        </div>
      )}

      {datosLimpios.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {columnas.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosLimpios.map((row, idx) => (
                <tr key={idx}>
                  {columnas.map((col) => (
                    <td key={col}>
                      {row[col] === 0 ? <span style={{ color: "#94a3b8" }}>0</span> : String(row[col] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Pandas;
