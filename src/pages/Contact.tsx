import SectionTitle from "../components/common/SectionTitle";
import TeamMemberCard from "../components/common/TeamMemberCard";
import iconServidor from "../img/icon-servidor.svg";
import iconBackend from "../img/icon-backend.svg";
import iconFrontend from "../img/icon-frontend.svg";
import iconProyecto from "../img/icon-proyecto.svg";

const integrantes = [
  { name: "Diego Luna", role: "Servidor", desc: "Infraestructura, configuracion del servidor, despliegue en la nube, administracion de bases de datos y mantenimiento continuo de la plataforma web.", color: "#6366f1", icon: iconServidor },
  { name: "Deivyd Vidal", role: "Backend", desc: "Logica del servidor, autenticacion de usuarios, seguridad de datos, gestion de API REST y desarrollo de endpoints protegidos.", color: "#2563eb", icon: iconBackend },
  { name: "Diego Carlin", role: "Frontend", desc: "Interfaz de usuario, componentes React, diseno visual responsivo, animaciones y experiencia de usuario en general.", color: "#16a34a", icon: iconFrontend },
  { name: "Tinoco Leon", role: "Soporte", desc: "Soporte tecnico, resolucion de problemas, documentacion tecnica, asistencia al usuario y pruebas de calidad.", color: "#ca8a04", icon: iconProyecto },
  { name: "Ronal de la Cruz", role: "Backend", desc: "Funcionalidades backend, integracion de servicios externos, optimizacion de rendimiento y gestion de datos.", color: "#2563eb", icon: iconBackend },
];

const canales = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    title: "Correo Electronico",
    desc: "Envianos un correo para consultas formales, reportes de problemas o propuestas de colaboracion. Respondemos en 24 a 48 horas habiles.",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "SENATI - Sede",
    desc: "Instituto Tecnologico SENATI - Proyecto de Analisis de Datos con Python. Puedes visitarnos en nuestras instalaciones para consultas presenciales.",
    color: "#16a34a",
    bg: "#ecfdf5",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Horario de Atencion",
    desc: "Lunes a viernes de 8:00 AM a 6:00 PM. Los fines de semana y feriados respondemos dentro de 24 horas.",
    color: "#ca8a04",
    bg: "#fef9e7",
  },
];

const roles = [
  { badge: "Servidor", bg: "#eef2ff", color: "#6366f1", desc: "Problemas de acceso, caidas del servidor, rendimiento lento o configuracion de la plataforma." },
  { badge: "Backend", bg: "#eff6ff", color: "#2563eb", desc: "Errores en el procesamiento de datos, problemas con autenticacion, seguridad o integracion de servicios." },
  { badge: "Frontend", bg: "#ecfdf5", color: "#16a34a", desc: "Problemas de visualizacion, diseno, animaciones, experiencia de usuario o interfaz en general." },
  { badge: "Soporte", bg: "#fef9e7", color: "#ca8a04", desc: "Dudas generales, tutoriales, documentacion, asistencia al usuario y reportes de problemas no criticos." },
];

const colaboraciones = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    title: "Reportar Bugs",
    desc: "Si encuentras un error o comportamiento inesperado, reportalo con detalles para que podamos solucionarlo rapido.",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Sugerir Funcionalidades",
    desc: "Tienes ideas para mejorar la plataforma? Te escuchamos. Las sugerencias de los usuarios nos ayudan a crecer.",
    color: "#16a34a",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Unirse al Equipo",
    desc: "Si eres estudiante SENATI y quieres colaborar en el proyecto, contactanos para discutir como puedes contribuir.",
    color: "#ca8a04",
  },
];

function Contact() {
  return (
    <section className="page">
      <div className="page-inner">
        {/* Hero */}
        <div className="contact-hero">
          <div className="contact-hero-blob-tr" />
          <div className="contact-hero-blob-bl" />
          <SectionTitle subtitle="Comunicate con los integrantes del equipo del proyecto">
            Contacto
          </SectionTitle>
          <p className="contact-hero-desc">
            ¿Tienes preguntas sobre el proyecto, necesitas soporte tecnico, quieres reportar un problema o deseas colaborar con nosotros? Estamos aqui para ayudarte.
          </p>
        </div>

        {/* Contact Channels */}
        <div className="contact-channels">
          {canales.map((c) => (
            <div
              key={c.title}
              className="channel-card"
              style={{ borderColor: `${c.color}20`, borderLeft: `4px solid ${c.color}` }}
            >
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-xl)",
                background: c.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}>
                {c.icon}
              </div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Role-based Contact Guide */}
        <div style={{ marginBottom: "56px" }}>
          <h3 className="subsection-title">¿A Quien Contactar?</h3>
          <p style={{
            textAlign: "center",
            maxWidth: "720px",
            margin: "0 auto 28px",
            color: "var(--text-muted)",
            fontSize: "0.92rem",
          }}>
            Cada miembro del equipo esta especializado en un area diferente. Selecciona al integrante segun tu necesidad para obtener una respuesta mas rapida y precisa.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "720px", margin: "0 auto" }}>
            {roles.map((r) => (
              <div key={r.badge} className="role-item" style={{ borderLeft: `3px solid ${r.color}` }}>
                <span className="role-badge" style={{ background: r.bg, color: r.color }}>{r.badge}</span>
                <span className="role-desc">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <h3 className="subsection-title">Integrantes del Equipo</h3>
        <p style={{
          textAlign: "center",
          maxWidth: "720px",
          margin: "0 auto 28px",
          color: "var(--text-muted)",
          fontSize: "0.92rem",
        }}>
          Conoce a cada miembro del equipo. Todos estamos comprometidos con la calidad del proyecto y la satisfaccion de los usuarios.
        </p>
        <div className="grid-team">
          {integrantes.map((m) => (
            <TeamMemberCard key={m.name} {...m} />
          ))}
        </div>

        {/* Collaboration Cards */}
        <div style={{ marginTop: "56px" }}>
          <h3 className="subsection-title">Formas de Colaborar</h3>
          <div className="collab-grid">
            {colaboraciones.map((c) => (
              <div key={c.title} className="collab-card" style={{ borderLeft: `4px solid ${c.color}` }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-lg)",
                  background: `${c.color}10`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}>
                  {c.icon}
                </div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Footer Card */}
        <div className="contact-institution">
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-lg)",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
            </svg>
          </div>
          <h3 className="contact-institution-title">SENATI</h3>
          <p className="contact-institution-desc">
            Instituto Tecnologico SENATI - Proyecto de Analisis de Datos con Python
          </p>
          <p className="contact-institution-detail">
            Desarrollado como parte del programa de formacion tecnica en Desarrollo de Software.
            Este proyecto demuestra las capacidades tecnicas adquiridas durante la carrera y nuestro compromiso con la innovacion tecnologica.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Contact;