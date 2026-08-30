const STORAGE_KEY = "dashboard_data";

export interface DashboardData {
  columnas: string[];
  columnasOriginales?: string[];
  datosOriginales: Record<string, any>[];
  datosLimpios: Record<string, any>[];
  csvRaw: string;
  nombreArchivo: string;
}

export function guardarDatos(data: DashboardData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function cargarDatos(): DashboardData | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function limpiarDatosStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}
