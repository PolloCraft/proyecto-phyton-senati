import { Link } from "react-router-dom";

const features = [
  {
    color: "#1e3a5f",
    title: "Limpieza con Pandas",
    desc: "Sube un archivo CSV y la limpieza se ejecuta automaticamente. Pandas detecta valores vacios, duplicados, tipos inconsistentes y formatea los datos para un analisis preciso.",
  },
  {
    color: "#2563eb",
    title: "NumPy en el navegador",
    desc: "Realiza analisis estadistico descriptivo, crea vectores, aplica transformaciones matematicas y opera con matrices, todo usando la potencia de NumPy sin instalar nada.",
  },
  {
    color: "#059669",
    title: "Graficos con Matplotlib",
    desc: "Genera graficos de barras, lineas de tendencia, dispersion y circulares con etiquetas, leyendas, colores personalizados y estadisticas asociadas en tiempo real.",
  },
  {
    color: "#d97706",
    title: "Python sin instalar",
    desc: "Pyodide ejecuta Python via WebAssembly directamente en tu navegador. No necesitas configurar entornos, instalar librerias ni preocuparte por dependencias.",
  },
];

const pasos = [
  {
    num: "1",
    title: "Sube tu archivo CSV",
    desc: "Selecciona o arrastra un archivo CSV desde tu computadora. El sistema detecta automaticamente la estructura, tipos de datos y formato del archivo.",
  },
  {
    num: "2",
    title: "Limpieza automatica",
    desc: "Pandas procesa los datos eliminando duplicados, rellenando valores vacios, convirtiendo tipos de datos y generando un reporte detallado de todos los cambios realizados.",
  },
  {
    num: "3",
    title: "Analiza con NumPy",
    desc: "Obten estadisticas descriptivas completas: media, mediana, moda, varianza, desviacion estandar, percentiles y rangos. Aplica transformaciones y opera con matrices.",
  },
  {
    num: "4",
    title: "Visualiza graficos",
    desc: "Genera graficos profesionales con matplotlib: barras para comparaciones, lineas para tendencias, dispersion para correlaciones y circulares para proporciones.",
  },
];

const stats = [
  { value: "100%", label: "En el navegador" },
  { value: "0", label: "Instalaciones" },
  { value: "3", label: "Librerias Python" },
  { value: "5", label: "Miembros" },
];

const techStack = [
  { name: "React", desc: "Framework de interfaz" },
  { name: "TypeScript", desc: "Tipado estatico" },
  { name: "Python", desc: "Lenguaje de analisis" },
  { name: "Pandas", desc: "Manipulacion de datos" },
  { name: "NumPy", desc: "Computo numerico" },
  { name: "Matplotlib", desc: "Visualizacion grafica" },
];

function Home() {
  return (
    <section className="page" style={{ padding: 0 }}>
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Plataforma de analisis de datos en la nube
          </div>

          <h1 className="home-hero-title" style={{ color: "#ffffff" }}>
            Analisis de Datos con Python
          </h1>

          <p className="home-hero-subtitle">
            Plataforma web desarrollada por estudiantes de la SENATI para limpiar, procesar y visualizar datos usando Pandas, NumPy y Matplotlib, directamente desde tu navegador sin necesidad de instalar nada.
          </p>

          <div className="home-hero-actions">
            <Link to="/Servicios" className="home-btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Comenzar Ahora
            </Link>
            <Link to="/Servicios" className="home-btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              Ver Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="home-stats-bar">
        <div className="home-stats">
          {stats.map((s) => (
            <div key={s.label} className="home-stat">
              <div className="home-stat-value">{s.value}</div>
              <div className="home-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="section-title">Herramientas Principales</h2>
            <p className="section-subtitle">Funcionalidades clave del proyecto para el analisis de datos</p>
          </div>
          <div className="grid-features">
            {features.map((f) => (
              <div key={f.title} className="feature-card" style={{ textAlign: "left" }}>
                <div className="feature-icon" style={{ background: `${f.color}10` }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.color === "#1e3a5f" && (
                      <>
                        <path d="M3 3v18h18" />
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                      </>
                    )}
                    {f.color === "#2563eb" && (
                      <>
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                        <rect x="9" y="9" width="6" height="6" />
                        <line x1="9" y1="1" x2="9" y2="4" />
                        <line x1="15" y1="1" x2="15" y2="4" />
                        <line x1="9" y1="20" x2="9" y2="23" />
                        <line x1="15" y1="20" x2="15" y2="23" />
                      </>
                    )}
                    {f.color === "#059669" && (
                      <>
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </>
                    )}
                    {f.color === "#d97706" && (
                      <>
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </>
                    )}
                  </svg>
                </div>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="home-section home-section-alt">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="section-title">Como Funciona</h2>
            <p className="section-subtitle">Proceso simple en 4 pasos para comenzar a analizar tus datos</p>
          </div>
          <div className="steps-grid">
            {pasos.map((p) => (
              <div key={p.num} className="step-card">
                <div className="step-num">{p.num}</div>
                <div className="step-content">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="section-title">Ventajas del Proyecto</h2>
            <p className="section-subtitle">Por que elegir nuestra plataforma para tu analisis de datos</p>
          </div>
          <div className="advantages-grid">
            <div className="advantage-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <h3>Rapido y Automatico</h3>
              <p>La limpieza de datos se ejecuta automaticamente al subir el archivo CSV. No necesitas hacer clic en botones adicionales ni configurar parametros complicados.</p>
            </div>
            <div className="advantage-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <h3>Funciona en cualquier dispositivo</h3>
              <p>Diseno responsivo que se adapta perfectamente a computadoras de escritorio, tablets y dispositivos moviles sin perder ninguna funcionalidad.</p>
            </div>
            <div className="advantage-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3>Seguro y Privado</h3>
              <p>Todos los datos se procesan localmente en tu navegador. Nada se sube a servidores externos, garantizando la total privacidad de tu informacion.</p>
            </div>
            <div className="advantage-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <h3>Codigo Abierto</h3>
              <p>Proyecto desarrollado con tecnologias modernas y abiertas: React, TypeScript, Python, Pandas, NumPy y Matplotlib. Transparente y modificable.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="home-section home-section-alt">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="section-title">Stack Tecnologico</h2>
            <p className="section-subtitle">Tecnologias que impulsan nuestra plataforma</p>
          </div>
          <div className="home-tech-grid">
            {techStack.map((t) => (
              <div key={t.name} className="home-tech-item">
                <span className="home-tech-name">{t.name}</span>
                <span className="home-tech-desc">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Preview */}
      <div className="home-section home-section-dark">
        <div className="home-section-inner" style={{ maxWidth: 720, textAlign: "center" }}>
          <h2 className="home-dark-title">Nuestro Equipo</h2>
          <p className="home-dark-subtitle">
            Somos un equipo de <strong>5 estudiantes</strong> de la SENATI, especializados en Desarrollo de Software. Este proyecto fue creado como parte de nuestra formacion tecnica, combinando conocimientos en desarrollo web, analisis de datos y tecnologias de vanguardia como WebAssembly para ejecutar Python en el navegador.
          </p>
          <Link to="/Nosotros" className="home-dark-link">
            Conoce al equipo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="home-section home-section-cta">
        <div className="home-section-inner" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2 className="home-cta-title">Comienza a Analizar tus Datos</h2>
          <p className="home-cta-subtitle">
            Sube tu primer archivo CSV y descubre todo lo que puedes hacer con tus datos en segundos.
          </p>
          <Link to="/Servicios" className="home-cta-btn">
            Comenzar Gratis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;