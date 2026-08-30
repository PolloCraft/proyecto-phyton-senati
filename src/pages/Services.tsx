import { useState } from "react";
import SectionTitle from "../components/common/SectionTitle";
import TechGroup from "../components/common/TechGroup";

const servicios = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: "Limpieza de Datos Automatica",
    desc: "Carga un archivo CSV y la limpieza se ejecuta automaticamente. Pandas detecta y corrige valores vacios, elimina duplicados, formatea tipos de datos y genera un reporte detallado de todos los cambios realizados en tus datos.",
    bg: "#eef2ff",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Analisis Estadistico con NumPy",
    desc: "Obtén estadisticas descriptivas completas: media, mediana, moda, varianza, desviacion estandar, percentiles y rangos. Crea vectores, aplica transformaciones matematicas y opera con matrices en tiempo real.",
    bg: "#ecfdf5",
    color: "#16a34a",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    title: "Graficos Profesionales",
    desc: "Genera graficos de barras, lineas de tendencia, dispersion y circulares con matplotlib. Incluye etiquetas automaticas, leyendas, colores personalizados y estadisticas asociadas a cada grafico.",
    bg: "#fef9e7",
    color: "#d97706",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Autenticacion Segura",
    desc: "Sistema completo de registro y login con verificacion por email, sesiones seguras con JWT, contrasenas encriptadas con bcrypt y proteccion de rutas autenticadas en el frontend.",
    bg: "#fef2f2",
    color: "#dc2626",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    title: "Persistencia de Datos",
    desc: "Tus datos se guardan en localStorage del navegador y permanecen disponibles entre sesiones. Puedes descargar el CSV limpio en cualquier momento para usarlo en otras herramientas.",
    bg: "#f5f3ff",
    color: "#7c3aed",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    title: "Python en el Navegador",
    desc: "Pyodide ejecuta scripts de Python via WebAssembly directamente en tu navegador. No necesitas instalar Python, pip, conda ni ninguna libreria. Todo funciona de forma nativa en la web.",
    bg: "#ecfdf5",
    color: "#059669",
  },
];

const tecnologias = [
  { category: "Frontend", items: ["React 19", "TypeScript", "Vite", "React Router", "CSS3"] },
  { category: "Backend", items: ["Express", "Node.js", "Nodemailer", "JWT", "Bcrypt"] },
  { category: "Python", items: ["Pandas", "NumPy", "Matplotlib", "Pyodide", "WebAssembly"] },
  { category: "Herramientas", items: ["Git", "VS Code", "localStorage", "Vercel", "Render"] },
];

const pasos = [
  { num: "01", title: "Sube tu archivo CSV", desc: "Selecciona o arrastra un archivo CSV desde tu computadora. El sistema detecta automaticamente la estructura, los tipos de datos y el formato general." },
  { num: "02", title: "Limpieza automatica con Pandas", desc: "Elimina filas duplicadas, rellena valores vacios, convierte tipos de datos inconsistentes y genera un reporte detallado de todos los cambios." },
  { num: "03", title: "Analisis estadistico con NumPy", desc: "Obtén estadisticas descriptivas completas: centralidad, dispersion, posicion y distribucion. Opera con vectores y matrices para un analisis profundo." },
  { num: "04", title: "Visualizacion con Matplotlib", desc: "Genera graficos profesionales en diferentes formatos: barras, lineas, dispersion y circulares. Cada grafico incluye etiquetas y estadisticas." },
];

const beneficios = [
  "Sin instalacion de software",
  "Procesamiento 100% local",
  "Limpieza automatica de datos",
  "Graficos profesionales al instante",
  "Compatible con todos los navegadores",
  "Descarga de datos limpios en CSV",
  "Privacidad total garantizada",
  "Disponible las 24 horas",
  "100% gratuito y sin registro",
];

const faqItems = [
  { q: "¿Necesito instalar algo para usar la plataforma?", a: "No. La plataforma funciona directamente en tu navegador. Python, Pandas, NumPy y Matplotlib se ejecutan via WebAssembly sin necesidad de instalaciones." },
  { q: "¿Mis datos se envian a un servidor?", a: "No. Todos los datos se procesan localmente en tu navegador. Nada se sube a servidores externos, garantizando total privacidad." },
  { q: "¿Que formatos de archivo soporta?", a: "Actualmente soportamos archivos CSV. Puedes subir cualquier archivo CSV y el sistema detectara automaticamente su estructura y tipos de datos." },
  { q: "¿Puedo descargar los datos limpios?", a: "Si. Despues de la limpieza automatica, puedes descargar un archivo CSV con todos los cambios aplicados para usarlo en Excel, Google Sheets u otras herramientas." },
  { q: "¿Funciona en movil?", a: "Si. La plataforma es completamente responsiva y funciona en cualquier dispositivo con navegador moderno. Sin embargo, para mejor experiencia se recomienda usar una pantalla grande." },
];

function Services() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <section className="page">
      <div className="page-inner">
        {/* Hero Section */}
        <div className="services-hero">
          <div className="services-hero-blob-tr" />
          <div className="services-hero-blob-bl" />
          <SectionTitle subtitle="Herramientas completas para el analisis de datos sin instalaciones">
            Servicios
          </SectionTitle>
          <p className="services-hero-desc">
            Nuestra plataforma ofrece un conjunto completo de herramientas para el analisis de datos, desde la limpieza automatica hasta la visualizacion grafica profesional. Todo se ejecuta directamente en tu navegador.
          </p>
        </div>

        {/* 6 Service Cards */}
        <div className="services-grid">
          {servicios.map((s) => (
            <div
              key={s.title}
              className="feature-card"
              style={{ background: s.bg, textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", borderLeft: `4px solid ${s.color}` }}
            >
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "var(--radius-lg)",
                background: `${s.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}>
                {s.icon}
              </div>
              <h3 className="feature-card-title" style={{ textAlign: "left" }}>{s.title}</h3>
              <p className="feature-card-desc" style={{ textAlign: "left" }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* How it Works */}
        <div className="services-how">
          <h3 className="subsection-title">Como Funciona la Plataforma</h3>
          <div className="detail-steps">
            {pasos.map((p) => (
              <div key={p.num} className="detail-step">
                <div className="detail-step-num">{p.num}</div>
                <div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <h3 className="subsection-title">Tecnologias Utilizadas</h3>
        <p style={{
          textAlign: "center",
          maxWidth: "680px",
          margin: "0 auto 24px",
          color: "var(--text-muted)",
          fontSize: "1.02rem",
          lineHeight: "1.75",
        }}>
          Stack tecnologico moderno y robusto que combina lo mejor del desarrollo web con las herramientas de analisis de datos mas populares de Python.
        </p>
        <div className="grid-tech">
          {tecnologias.map((g) => (
            <TechGroup key={g.category} {...g} />
          ))}
        </div>

        {/* Benefits */}
        <div style={{ marginBottom: "56px" }}>
          <h3 className="subsection-title">Beneficios de Nuestra Plataforma</h3>
          <div className="benefits-list">
            {beneficios.map((b) => (
              <div key={b} className="benefit-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div style={{ marginBottom: "56px" }}>
          <h3 className="subsection-title">Preguntas Frecuentes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "720px", margin: "0 auto" }}>
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="faq-item"
                style={{
                  cursor: "pointer",
                  borderColor: faqOpen === i ? "var(--indigo-300)" : undefined,
                  background: faqOpen === i ? "var(--indigo-50)" : undefined,
                  transition: "all 0.2s ease",
                }}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, flex: 1 }}>{item.q}</h4>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: faqOpen === i ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      flexShrink: 0,
                      marginLeft: "12px",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div style={{
                  maxHeight: faqOpen === i ? "200px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease",
                }}>
                  <p style={{ margin: 0, paddingTop: faqOpen === i ? "12px" : "0" }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="services-cta">
          <h3 className="services-cta-title">
            Comienza a Analizar tus Datos
          </h3>
          <p className="services-cta-desc">
            Registrate gratis y accede a todas las herramientas de analisis de datos sin restricciones.
          </p>
          <a href="/Servicios" className="services-cta-btn">
            Explorar Servicios
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Services;