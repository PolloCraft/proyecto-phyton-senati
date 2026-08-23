import SectionTitle from "../components/common/SectionTitle";
import TeamMemberCard from "../components/common/TeamMemberCard";
import iconServidor from "../img/icon-servidor.svg";
import iconBackend from "../img/icon-backend.svg";
import iconFrontend from "../img/icon-frontend.svg";
import iconProyecto from "../img/icon-proyecto.svg";

const integrantes = [
  { name: "Diego Luna", role: "Servidor", desc: "Infraestructura, configuracion del servidor, despliegue y mantenimiento.", color: "#6366f1", icon: iconServidor },
  { name: "Deivyd Vidal", role: "Backend", desc: "Logica del servidor, autenticacion de usuarios y seguridad.", color: "#2563eb", icon: iconBackend },
  { name: "Diego Carlin", role: "Frontend", desc: "Interfaz de usuario, componentes React y diseno visual.", color: "#16a34a", icon: iconFrontend },
  { name: "Tinoco Leon", role: "Soporte", desc: "Soporte tecnico, resolucion de problemas y asistencia al usuario.", color: "#ca8a04", icon: iconProyecto },
  { name: "Ronal de la Cruz", role: "Backend", desc: "Desarrollo de funcionalidades backend, integracion de servicios y optimizacion.", color: "#2563eb", icon: iconBackend },
];

function About() {
  return (
    <section className="page">
      <div className="page-inner">
        <SectionTitle subtitle="Conoce al equipo detras del proyecto">
          Sobre Nosotros
        </SectionTitle>

        <p className="about-intro">
          Somos un equipo de <strong>5 estudiantes</strong> de la SENATI, dedicados al desarrollo de software y el analisis de datos. Este proyecto fue creado como parte de nuestra formacion tecnica.
        </p>

        <div className="about-image-wrapper">
          <img src="/img/equipo.jpeg" alt="Equipo SENATI" className="about-image" />
        </div>

        <h3 className="subsection-title">Integrantes del Equipo</h3>

        <div className="grid-team">
          {integrantes.map((m) => (
            <TeamMemberCard key={m.name} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
