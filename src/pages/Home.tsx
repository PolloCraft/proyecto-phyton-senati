import HeroSection from "../components/common/HeroSection";
import SectionTitle from "../components/common/SectionTitle";
import FeatureCard from "../components/common/FeatureCard";
import iconBackend from "../img/icon-backend.svg";
import iconFrontend from "../img/icon-frontend.svg";
import iconServidor from "../img/icon-servidor.svg";
import iconProyecto from "../img/icon-proyecto.svg";

const features = [
  { icon: iconBackend, title: "Limpieza con Pandas", desc: "Carga CSV, detecta vacios, convierte tipos y limpia datos automaticamente." },
  { icon: iconFrontend, title: "NumPy en el navegador", desc: "Estadistica descriptiva, transformaciones vectoriales y operaciones con matrices." },
  { icon: iconServidor, title: "Graficos con Matplotlib", desc: "Barras, lineas, dispersion y circulares con etiquetas y estadisticas." },
  { icon: iconProyecto, title: "Python sin instalar", desc: "Pyodide ejecuta Python via WebAssembly directamente en tu navegador." },
];

function Home() {
  return (
    <section className="page">
      <HeroSection imageSrc="/img/logo.png" imageAlt="Python Logo">
        <h1 className="hero-title">Analisis de Datos con Python</h1>
        <p className="hero-subtitle">
          Plataforma web desarrollada por estudiantes de la SENATI para limpiar, procesar y visualizar datos usando Pandas, NumPy y Matplotlib, directamente desde el navegador.
        </p>
        <p className="hero-hint">
          Carga un archivo CSV, limpia los datos, realiza calculos estadisticos y genera graficos, todo sin instalar nada.
        </p>
      </HeroSection>

      <SectionTitle subtitle="Herramientas principales del proyecto">
        Que podemos hacer
      </SectionTitle>

      <div className="grid-features">
        {features.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.desc} />
        ))}
      </div>
    </section>
  );
}

export default Home;
