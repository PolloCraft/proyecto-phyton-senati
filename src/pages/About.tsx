import { Link } from "react-router-dom";

const integrantes = [
  {
    name: "Diego Luna",
    role: "Servidor",
    desc: "Infraestructura, configuracion del servidor, despliegue en la nube, administracion de bases de datos y mantenimiento continuo de la plataforma.",
    color: "#6366f1",
  },
  {
    name: "Deivyd Vidal",
    role: "Backend",
    desc: "Logica del servidor, autenticacion de usuarios, seguridad de datos, gestion de API REST y desarrollo de endpoints protegidos.",
    color: "#2563eb",
  },
  {
    name: "Diego Carlin",
    role: "Frontend",
    desc: "Interfaz de usuario, componentes React, diseno visual responsivo, animaciones y experiencia de usuario en general.",
    color: "#16a34a",
  },
  {
    name: "Tinoco Leon",
    role: "Soporte",
    desc: "Soporte tecnico, resolucion de problemas, documentacion tecnica, asistencia al usuario y pruebas de calidad.",
    color: "#ca8a04",
  },
  {
    name: "Ronal de la Cruz",
    role: "Backend",
    desc: "Desarrollo de funcionalidades backend, integracion de servicios externos, optimizacion de rendimiento y gestion de datos.",
    color: "#2563eb",
  },
];

const timeline = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Fase de Investigacion",
    desc: "Analizamos las necesidades de los estudiantes y las herramientas disponibles para el analisis de datos en Python, identificando la oportunidad de crear una solucion web.",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Diseno y Arquitectura",
    desc: "Disenamos la arquitectura del sistema, seleccionamos las tecnologias (React, Pyodide, Pandas) y planificamos la estructura de componentes y rutas.",
    color: "#16a34a",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Desarrollo Frontend y Backend",
    desc: "Implementamos la interfaz con React y TypeScript, desarrollamos el backend con Node.js e integramos Pyodide para ejecutar scripts de Python en el navegador.",
    color: "#ca8a04",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Pruebas y Despliegue",
    desc: "Realizamos pruebas exhaustivas, optimizamos el rendimiento y desplegamos la plataforma en Vercel para que este disponible las 24 horas del dia.",
    color: "#dc2626",
  },
];

const values = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Innovacion Tecnologica",
    desc: "Utilizamos tecnologias de vanguardia como Pyodide y WebAssembly para ejecutar Python directamente en el navegador, algo que antes era imposible en la web.",
    bg: "#eef2ff",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Trabajo en Equipo",
    desc: "Trabajamos de forma colaborativa como equipo multidisciplinario, combinando habilidades en servidor, backend, frontend y soporte tecnico.",
    bg: "#ecfdf5",
    color: "#16a34a",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Accesibilidad Total",
    desc: "Creemos que el analisis de datos debe ser accesible para todos, sin barreras tecnicas ni economicas. Por eso nuestra plataforma es completamente gratuita.",
    bg: "#fef9e7",
    color: "#ca8a04",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Calidad y Seguridad",
    desc: "Nos comprometemos a mantener estandares altos de calidad en codigo, diseno y experiencia de usuario, garantizando la seguridad de los datos.",
    bg: "#fdf2f8",
    color: "#dc2626",
  },
];

function About() {
  return (
    <section className="page" style={{ padding: 0 }}>
      {/* Team Header */}
      <div className="about-hero">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "999px",
              marginBottom: "24px",
              fontSize: "0.82rem",
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Conoce al equipo
          </div>
          <h1 className="about-hero-title">
            Sobre Nosotros
          </h1>
          <p className="about-hero-desc">
            Somos un equipo de <strong style={{ color: "#c7d2fe" }}>5 estudiantes</strong> de la SENATI, dedicados al desarrollo de software y el analisis de datos. Nuestra mision es democratizar el acceso al analisis de datos mediante herramientas web accesibles y profesionales.
          </p>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: "48px" }}>
        {/* Vision & Mission Cards */}
        <div className="about-vision">
          <div className="vision-card">
            <div className="vision-icon" style={{ background: "#eef2ff", color: "#6366f1" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
            </div>
            <h2 className="subsection-title">Nuestra Vision</h2>
            <p>Ser la plataforma web de referencia en Latinoamerica para el analisis de datos con Python, ofreciendo herramientas accesibles, gratuitas y profesionales que permitan a cualquier persona realizar procesos completos de limpieza, transformacion y visualizacion de datos.</p>
          </div>
          <div className="vision-card">
            <div className="vision-icon" style={{ background: "#ecfdf5", color: "#16a34a" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="subsection-title">Nuestra Mision</h2>
            <p>Democratizar el analisis de datos proporcionando una herramienta web gratuita y accesible que permita a cualquier persona realizar procesos de limpieza, transformacion y visualizacion de datos usando las herramientas mas populares del ecosistema Python.</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="about-values">
          <h3 className="subsection-title">Nuestros Valores Fundamentales</h3>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon" style={{ background: v.bg }}>
                  {v.icon}
                </div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="about-history">
          <h3 className="subsection-title">Nuestro Proceso de Desarrollo</h3>
          <div className="timeline">
            {timeline.map((t, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ background: t.color }}>
                  {t.icon}
                </div>
                <div className="timeline-content">
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div style={{ marginBottom: "48px" }}>
          <h3 className="subsection-title">Integrantes del Equipo</h3>
          <p className="about-detail-text" style={{ marginBottom: "24px" }}>
            Cada miembro aporto habilidades unicas al proyecto. Juntos, combinamos experiencia en infraestructura, desarrollo backend, frontend, soporte tecnico y optimizacion para crear una plataforma completa y funcional.
          </p>
          <div className="grid-team">
            {integrantes.map((m) => (
              <div key={m.name} className="team-card">
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: `${m.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {m.role === "Servidor" && (
                      <>
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </>
                    )}
                    {m.role === "Backend" && (
                      <>
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </>
                    )}
                    {m.role === "Frontend" && (
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </>
                    )}
                    {m.role === "Soporte" && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </>
                    )}
                  </svg>
                </div>
                <h4 className="team-card-name">{m.name}</h4>
                <div className="team-card-role" style={{ color: m.color }}>{m.role}</div>
                <p className="team-card-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="about-contact-cta">
          <p>¿Tienes preguntas, sugerencias o quieres colaborar con nosotros en futuros proyectos?</p>
          <Link to="/Contacto" className="cta-link">
            Contactanos
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

export default About;