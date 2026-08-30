const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      if ((window as any).loadPyodide) { resolve(); return; }
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
      const wait = (retries: number) => {
        if ((window as any).loadPyodide) { resolve(); return; }
        if (retries <= 0) { reject(new Error("loadPyodide no disponible después de cargar el script")); return; }
        setTimeout(() => wait(retries - 1), 50);
      };
      wait(20);
    };
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
