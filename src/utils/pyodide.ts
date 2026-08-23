const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar " + src));
    document.head.appendChild(s);
  });
}

let pyInstance: any = null;

export async function getPyodide(): Promise<any> {
  if (pyInstance) return pyInstance;

  await loadScript(PYODIDE_CDN + "pyodide.js");

  const py = await (window as any).loadPyodide({ indexURL: PYODIDE_CDN });
  pyInstance = py;
  return py;
}
