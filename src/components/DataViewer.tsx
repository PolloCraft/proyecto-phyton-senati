export function abrirVentanaDatos(
  titulo: string,
  columnas: string[],
  datosOriginales: Record<string, any>[],
  datosLimpios: Record<string, any>[]
) {
  const renderTabla = (data: Record<string, any>[], label: string, color: string) => {
    if (!data.length) return '<div style="margin-bottom:32px"><h3 style="color:' + color + ';margin:0 0 8px;font-size:16px">' + label + ' (0 filas)</h3><p>No hay datos</p></div>';

    let rows = "";
    const maxRows = Math.min(data.length, 100);
    for (let idx = 0; idx < maxRows; idx++) {
      const row = data[idx];
      const bg = idx % 2 === 0 ? "#fff" : "#f8f9fa";
      const cells = columnas.map((col) => {
        const val = row[col] === 0 ? '<span style="color:#94a3b8">0</span>' : String(row[col] ?? "");
        return '<td style="padding:6px 10px;border:1px solid #e2e8f0;white-space:nowrap">' + val + '</td>';
      }).join("");
      rows += '<tr style="background:' + bg + '">' + cells + '</tr>';
    }

    const headers = columnas.map((col) =>
      '<th style="padding:8px 12px;border:1px solid rgba(255,255,255,0.3);text-align:left;white-space:nowrap;position:sticky;top:0;z-index:1">' + col + '</th>'
    ).join("");

    const footer = data.length > 100 ? '<div style="padding:8px 12px;color:#64748b;font-size:12px">Mostrando 100 de ' + data.length + ' filas</div>' : '';

    return '<div style="margin-bottom:32px">' +
      '<h3 style="color:' + color + ';margin:0 0 8px;font-size:16px">' + label + ' (' + data.length + ' filas)</h3>' +
      '<div style="max-height:400px;overflow:auto;border:1px solid #cbd5e1;border-radius:8px">' +
      '<table style="width:100%;min-width:max-content;border-collapse:collapse;font-size:13px">' +
      '<thead><tr style="background:' + color + ';color:#fff">' + headers + '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>' +
      footer +
      '</div></div>';
  };

  const html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + titulo + '</title>' +
    '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a;padding:24px}h2{font-size:20px;margin-bottom:20px}.stats{display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap}.stat{background:#fff;padding:12px 16px;border-radius:8px;border:1px solid #e2e8f0}.stat-label{font-size:11px;color:#64748b;text-transform:uppercase}.stat-value{font-size:18px;font-weight:bold;color:#1e293b}.close-btn{position:fixed;top:16px;right:16px;background:#ef4444;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;z-index:100}.close-btn:hover{background:#dc2626}</style>' +
    '</head><body>' +
    '<button class="close-btn" onclick="window.close()">Cerrar</button>' +
    '<h2>' + titulo + '</h2>' +
    '<div class="stats">' +
    '<div class="stat"><div class="stat-label">Original</div><div class="stat-value">' + datosOriginales.length + ' filas</div></div>' +
    '<div class="stat"><div class="stat-label">Limpiada</div><div class="stat-value">' + datosLimpios.length + ' filas</div></div>' +
    '<div class="stat"><div class="stat-label">Columnas</div><div class="stat-value">' + columnas.length + '</div></div>' +
    '</div>' +
    renderTabla(datosOriginales, "Tabla Original", "#2c3e50") +
    renderTabla(datosLimpios, "Tabla Limpiada", "#27ae60") +
    '</body></html>';

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

function DataViewer() { return null; }
export default DataViewer;
