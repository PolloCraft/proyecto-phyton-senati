import SectionTitle from "../components/common/SectionTitle";
import FeatureCard from "../components/common/FeatureCard";
import TechGroup from "../components/common/TechGroup";
import iconBackend from "../img/icon-backend.svg";
import iconServidor from "../img/icon-servidor.svg";
import iconFrontend from "../img/icon-frontend.svg";
import iconProyecto from "../img/icon-proyecto.svg";

const servicios = [
  { icon: iconBackend, title: "Limpieza de Datos", desc: "Carga CSV y limpia automaticamente valores vacios, duplicados y formatos incorrectos con Pandas.", bg: "#eef2ff" },
  { icon: iconBackend, title: "Analisis con NumPy", desc: "Estadistica descriptiva, transformaciones vectoriales, matrices y operaciones numericas.", bg: "#eff6ff" },
  { icon: iconBackend, title: "Graficos con Matplotlib", desc: "Barras, lineas, dispersion y circulares con etiquetas, leyendas y estadisticas.", bg: "#ecfdf5" },
  { icon: iconProyecto, title: "Autenticacion", desc: "Registro con verificacion por email, sesion segura y proteccion de rutas.", bg: "#fef9e7" },
  { icon: iconServidor, title: "Persistencia", desc: "Datos guardados en localStorage, disponibles entre sesiones del navegador.", bg: "#fdf2f8" },
  { icon: iconFrontend, title: "Python en el Navegador", desc: "Pyodide ejecuta Python via WebAssembly, sin necesidad de instalar nada.", bg: "#f0fdf4" },
];

const tecnologias = [
  { category: "Frontend", items: ["React 19", "TypeScript", "Vite", "React Router"] },
  { category: "Backend", items: ["Express", "Node.js", "Nodemailer"] },
  { category: "Python", items: ["Pandas", "NumPy", "Matplotlib", "Pyodide"] },
  { category: "Herramientas", items: ["Git", "VS Code", "localStorage"] },
];

function Services() {
  return (
    <section className="page">
      <div className="page-inner">
        <SectionTitle subtitle="Herramientas completas para el analisis de datos">
          Servicios
        </SectionTitle>

        <div className="grid-features">
          {servicios.map((s) => (
            <FeatureCard key={s.title} {...s} />
          ))}
        </div>

        <h3 className="subsection-title">Tecnologias</h3>

        <div className="grid-tech">
          {tecnologias.map((g) => (
            <TechGroup key={g.category} {...g} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
