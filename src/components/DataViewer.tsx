import { useState, useEffect, useMemo, useCallback, type FC } from "react";
import { createRoot } from "react-dom/client";

type TabId = "original" | "limpio" | "calidad";

const CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  .dvo-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:stretch;justify-content:stretch;background:rgba(15,23,42,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:dvoFadeIn .25s ease}
  .dvo-panel{display:flex;flex-direction:column;width:100%;height:100%;background:#f8fafc;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;overflow:hidden}
  .dvo-header{background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);color:#fff;padding:20px 24px 16px;flex-shrink:0}
  .dvo-header-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
  .dvo-title{font-size:20px;font-weight:700;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dvo-close{background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:8px 18px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;flex-shrink:0}
  .dvo-close:hover{background:rgba(255,255,255,0.3)}
  .dvo-stats{display:flex;gap:12px;margin-top:14px;flex-wrap:wrap}
  .dvo-stat{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:10px 16px;min-width:100px}
  .dvo-stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;opacity:.75;font-weight:500}
  .dvo-stat-val{font-size:20px;font-weight:700;margin-top:2px}
  .dvo-tabs-bar{background:#fff;border-bottom:2px solid #e2e8f0;display:flex;padding:0 24px;flex-shrink:0;overflow-x:auto}
  .dvo-tab{padding:14px 20px;font-size:14px;font-weight:600;border:none;background:none;cursor:pointer;color:#64748b;border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap;transition:color .15s,border-color .15s}
  .dvo-tab:hover{color:#334155}
  .dvo-tab--active{color:#4338ca;border-bottom-color:#4338ca}
  .dvo-toolbar{display:flex;align-items:center;gap:10px;padding:12px 24px;background:#fff;border-bottom:1px solid #e2e8f0;flex-shrink:0;flex-wrap:wrap}
  .dvo-search{flex:1;min-width:180px;max-width:400px;padding:10px 14px 10px 38px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:14px;background:#f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z'/%3E%3C/svg%3E") no-repeat 12px center;transition:border-color .15s}
  .dvo-search:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
  .dvo-btn{padding:8px 16px;border-radius:8px;border:1.5px solid #cbd5e1;background:#fff;color:#334155;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
  .dvo-btn:hover{background:#f1f5f9;border-color:#94a3b8}
  .dvo-btn--primary{background:#4338ca;color:#fff;border-color:#4338ca}
  .dvo-btn--primary:hover{background:#3730a3;border-color:#3730a3}
  .dvo-body{flex:1;overflow:auto;padding:20px 24px 24px}
  .dvo-table-wrap{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#fff}
  .dvo-table{width:100%;border-collapse:collapse;font-size:13px}
  .dvo-table th{background:linear-gradient(135deg,#312e81,#4338ca);color:#fff;padding:12px 14px;text-align:left;white-space:nowrap;position:sticky;top:0;z-index:2;cursor:pointer;user-select:none;border-right:1px solid rgba(255,255,255,0.15);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.03em}
  .dvo-table th:hover{background:linear-gradient(135deg,#3730a3,#4f46e5)}
  .dvo-table th .dvo-sort-icon{margin-left:6px;opacity:.6;font-size:10px}
  .dvo-table th .dvo-sort-icon.active{opacity:1}
  .dvo-table td{padding:10px 14px;border-bottom:1px solid #f1f5f9;white-space:nowrap;font-size:13px;color:#334155}
  .dvo-table tbody tr:nth-child(even){background:#f8fafc}
  .dvo-table tbody tr:hover{background:#eef2ff}
  .dvo-table tbody tr.dvo-zero{color:#94a3b8}
  .dvo-empty{padding:48px 24px;text-align:center;color:#94a3b8;font-size:15px}
  .dvo-empty svg{margin-bottom:12px;opacity:.4}
  .dvo-row-count{padding:10px 14px;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:right}
  .dvo-quality{padding:24px}
  .dvo-quality h3{font-size:15px;color:#334155;margin-bottom:14px;font-weight:700}
  .dvo-quality-item{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:10px}
  .dvo-quality-item .dvo-q-badge{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .dvo-quality-item .dvo-q-label{font-weight:600;color:#334155;font-size:14px}
  .dvo-quality-item .dvo-q-val{color:#64748b;font-size:13px}
  .dvo-tooltip-wrap{position:relative;display:inline-block}
  .dvo-tooltip{display:none;position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#1e293b;color:#f1f5f9;padding:8px 12px;border-radius:8px;font-size:12px;white-space:nowrap;z-index:10;pointer-events:none;box-shadow:0 4px 12px rgba(0,0,0,0.2)}
  .dvo-tooltip-wrap:hover .dvo-tooltip{display:block}
  .dvo-tooltip::before{content:'';position:absolute;bottom:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-bottom-color:#1e293b}
  @keyframes dvoFadeIn{from{opacity:0}to{opacity:1}}
  @media(max-width:640px){
    .dvo-header{padding:14px 16px 12px}
    .dvo-title{font-size:17px}
    .dvo-tabs-bar{padding:0 12px}
    .dvo-tab{padding:12px 14px;font-size:13px}
    .dvo-toolbar{padding:10px 12px;gap:8px}
    .dvo-search{min-width:140px;max-width:100%}
    .dvo-body{padding:14px 12px 20px}
    .dvo-stats{gap:8px}
    .dvo-stat{padding:8px 12px;min-width:80px}
    .dvo-stat-val{font-size:17px}
    .dvo-table th,.dvo-table td{padding:10px 10px;font-size:12px}
    .dvo-btn{padding:7px 12px;font-size:12px}
  }
`;

function csvEscape(v: any): string {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadCsv(data: Record<string, any>[], columnas: string[], filename: string) {
  const header = columnas.map(csvEscape).join(",");
  const rows = data.map((row) => columnas.map((col) => csvEscape(row[col])).join(","));
  const csv = header + "\n" + rows.join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function estimateMemory(data: Record<string, any>[], columnas: string[]): string {
  let bytes = 0;
  for (const row of data) {
    for (const col of columnas) {
      const val = row[col];
      if (val != null) bytes += String(val).length * 2;
    }
  }
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

interface OverlayProps {
  titulo: string;
  columnas: string[];
  datosOriginales: Record<string, any>[];
  datosLimpios: Record<string, any>[];
  onClose: () => void;
}

const DataViewerOverlay: FC<OverlayProps> = ({
  titulo,
  columnas,
  datosOriginales,
  datosLimpios,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("original");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const activeData = activeTab === "original" ? datosOriginales : datosLimpios;

  const colInfo = useMemo(() => {
    return columnas.map((col) => {
      let type = "text";
      let nonNull = 0;
      for (const row of activeData) {
        const v = row[col];
        if (v !== null && v !== undefined && v !== "") {
          nonNull++;
          if (type === "text" && typeof v === "number") type = "number";
        }
      }
      return { name: col, type, nonNull };
    });
  }, [activeData, columnas]);

  const filteredData = useMemo(() => {
    let data = [...activeData];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((row) =>
        columnas.some((col) => {
          const v = row[col];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (sortCol) {
      data.sort((a, b) => {
        const va = a[sortCol];
        const vb = b[sortCol];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        const na = Number(va);
        const nb = Number(vb);
        if (!isNaN(na) && !isNaN(nb)) return sortAsc ? na - nb : nb - na;
        return sortAsc
          ? String(va).localeCompare(String(vb), "es")
          : String(vb).localeCompare(String(va), "es");
      });
    }
    return data;
  }, [activeData, search, sortCol, sortAsc, columnas]);

  const handleSort = useCallback(
    (col: string) => {
      if (sortCol === col) {
        setSortAsc(!sortAsc);
      } else {
        setSortCol(col);
        setSortAsc(true);
      }
    },
    [sortCol, sortAsc]
  );

  const qualityItems = useMemo(() => {
    if (!activeData.length) return [];
    const total = activeData.length;
    const items: { label: string; value: string; color: string }[] = [];

    for (const col of columnas) {
      let nullCount = 0;
      let emptyCount = 0;
      const seen = new Set<string>();

      for (const row of activeData) {
        const v = row[col];
        if (v === null || v === undefined) {
          nullCount++;
        } else {
          const s = String(v);
          if (s === "") emptyCount++;
          seen.add(s);
        }
      }

      if (nullCount > 0) {
        items.push({
          label: `${col} — Valores nulos`,
          value: `${nullCount} de ${total} (${((nullCount / total) * 100).toFixed(1)}%)`,
          color: nullCount / total > 0.1 ? "#ef4444" : "#eab308",
        });
      }
      if (emptyCount > 0) {
        items.push({
          label: `${col} — Valores vacíos`,
          value: `${emptyCount} de ${total} (${((emptyCount / total) * 100).toFixed(1)}%)`,
          color: "#f97316",
        });
      }
    }

    items.push({ label: "Registros totales", value: `${total} filas`, color: "#22c55e" });
    items.push({ label: "Columnas", value: `${columnas.length} columnas`, color: "#6366f1" });
    items.push({ label: "Memoria estimada", value: estimateMemory(activeData, columnas), color: "#8b5cf6" });

    return items;
  }, [activeData, columnas]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "original", label: "Datos Originales" },
    { id: "limpio", label: "Datos Limpios" },
    { id: "calidad", label: "Reporte de Calidad" },
  ];

  const sortIcon = (col: string) => {
    if (sortCol !== col) return <span className="dvo-sort-icon">⇅</span>;
    return <span className="dvo-sort-icon active">{sortAsc ? "▲" : "▼"}</span>;
  };

  return (
    <div className="dvo-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dvo-panel">
        <style>{CSS}</style>

        <div className="dvo-header">
          <div className="dvo-header-top">
            <div className="dvo-title">{titulo}</div>
            <button className="dvo-close" onClick={onClose}>✕ Cerrar</button>
          </div>
          <div className="dvo-stats">
            <div className="dvo-stat">
              <div className="dvo-stat-label">Original</div>
              <div className="dvo-stat-val">{datosOriginales.length.toLocaleString()}</div>
            </div>
            <div className="dvo-stat">
              <div className="dvo-stat-label">Limpia</div>
              <div className="dvo-stat-val">{datosLimpios.length.toLocaleString()}</div>
            </div>
            <div className="dvo-stat">
              <div className="dvo-stat-label">Columnas</div>
              <div className="dvo-stat-val">{columnas.length}</div>
            </div>
            <div className="dvo-stat">
              <div className="dvo-stat-label">Memoria est.</div>
              <div className="dvo-stat-val">{estimateMemory(activeData, columnas)}</div>
            </div>
          </div>
        </div>

        <div className="dvo-tabs-bar">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`dvo-tab ${activeTab === t.id ? "dvo-tab--active" : ""}`}
              onClick={() => { setActiveTab(t.id); setSearch(""); setSortCol(null); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="dvo-toolbar">
          {activeTab !== "calidad" && (
            <input
              type="text"
              className="dvo-search"
              placeholder="Buscar en filas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <button
            className="dvo-btn dvo-btn--primary"
            onClick={() => downloadCsv(datosLimpios, columnas, titulo.replace(/\s+/g, "_") + "_limpio.csv")}
          >
            ↓ CSV Limpio
          </button>
          <button
            className="dvo-btn"
            onClick={() => downloadCsv(datosOriginales, columnas, titulo.replace(/\s+/g, "_") + "_original.csv")}
          >
            ↓ CSV Original
          </button>
        </div>

        <div className="dvo-body">
          {activeTab === "calidad" ? (
            <div className="dvo-quality">
              <h3>Reporte de Calidad — {titulo}</h3>
              {qualityItems.length === 0 ? (
                <div className="dvo-empty">No hay datos para analizar</div>
              ) : (
                qualityItems.map((item, i) => (
                  <div key={i} className="dvo-quality-item">
                    <div className="dvo-q-badge" style={{ background: item.color }} />
                    <div>
                      <div className="dvo-q-label">{item.label}</div>
                      <div className="dvo-q-val">{item.value}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="dvo-empty">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <div>{search ? `No se encontraron resultados para "${search}"` : "No hay datos disponibles"}</div>
            </div>
          ) : (
            <>
              <div className="dvo-table-wrap">
                <table className="dvo-table">
                  <thead>
                    <tr>
                      {columnas.map((col) => {
                        const info = colInfo.find((c) => c.name === col);
                        return (
                          <th key={col} onClick={() => handleSort(col)}>
                            <div className="dvo-tooltip-wrap">
                              {col}
                              {sortIcon(col)}
                              {info && (
                                <div className="dvo-tooltip">
                                  Tipo: {info.type} · No nulos: {info.nonNull}/{activeData.length}
                                </div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 200).map((row, idx) => (
                      <tr key={idx}>
                        {columnas.map((col) => {
                          const v = row[col];
                          const isZero = v === 0;
                          return (
                            <td key={col} style={isZero ? { color: "#94a3b8" } : undefined}>
                              {v == null ? "" : String(v)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="dvo-row-count">
                Mostrando {Math.min(filteredData.length, 200).toLocaleString()} de{" "}
                {filteredData.length.toLocaleString()} filas
                {search && ` (filtrado de ${activeData.length.toLocaleString()})`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export function abrirVentanaDatos(
  titulo: string,
  columnas: string[],
  datosOriginales: Record<string, any>[],
  datosLimpios: Record<string, any>[]
) {
  const container = document.createElement("div");
  container.id = "data-viewer-root";
  document.body.appendChild(container);

  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  root.render(
    <DataViewerOverlay
      titulo={titulo}
      columnas={columnas}
      datosOriginales={datosOriginales}
      datosLimpios={datosLimpios}
      onClose={handleClose}
    />
  );
}

function DataViewer() {
  return null;
}
export default DataViewer;
