import SectionTitle from "../components/common/SectionTitle";
import TeamMemberCard from "../components/common/TeamMemberCard";
import iconServidor from "../img/icon-servidor.svg";
import iconBackend from "../img/icon-backend.svg";
import iconFrontend from "../img/icon-frontend.svg";
import iconProyecto from "../img/icon-proyecto.svg";

const integrantes = [
  { name: "Diego Luna", role: "Servidor", desc: "Infraestructura y despliegue.", color: "#6366f1", icon: iconServidor },
  { name: "Deivyd Vidal", role: "Backend", desc: "Logica del servidor y seguridad.", color: "#2563eb", icon: iconBackend },
  { name: "Diego Carlin", role: "Frontend", desc: "Interfaz de usuario y diseno.", color: "#16a34a", icon: iconFrontend },
  { name: "Tinoco Leon", role: "Soporte", desc: "Soporte tecnico y asistencia.", color: "#ca8a04", icon: iconProyecto },
  { name: "Ronal de la Cruz", role: "Backend", desc: "Servicios backend y optimizacion.", color: "#2563eb", icon: iconBackend },
];

function Contact() {
  return (
    <section className="page">
      <div className="page-inner">
        <SectionTitle subtitle="Comunicate con los integrantes del equipo">
          Contacto
        </SectionTitle>

        <div className="grid-team">
          {integrantes.map((m) => (
            <TeamMemberCard key={m.name} {...m} />
          ))}
        </div>

        <div className="contact-institution">
          <h3 className="contact-institution-title">SENATI</h3>
          <p className="contact-institution-desc">Proyecto de Analisis de Datos con Python</p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
