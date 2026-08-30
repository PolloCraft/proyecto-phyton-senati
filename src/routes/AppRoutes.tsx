import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayouts from "../layouts/MainLayouts";
import ProtectedRoute from "../components/ProtectedRoute";

const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const Services = lazy(() => import("../pages/Services"));
const Contact = lazy(() => import("../pages/Contact"));
const Login = lazy(() => import("../pages/Login"));
const Registro = lazy(() => import("../pages/Registro"));
const VerificarCodigo = lazy(() => import("../pages/VerificarCodigo"));

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Pandas = lazy(() => import("../pages/dashboard/Pandas"));
const Numpy = lazy(() => import("../pages/dashboard/Numpy"));
const Graficos = lazy(() => import("../pages/dashboard/Graficos"));

const ClasificarImagenes = lazy(() => import("../pages/Clasificar/ClasificarImagenes"));
const ClasificarAudios = lazy(() => import("../pages/Clasificar/ClasificarAudios"));
const ClasificarPosturas = lazy(() => import("../pages/Clasificar/ClasificarPosturas"));

const Loading = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", color: "#64748b" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
      Cargando...
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<MainLayouts />}>
          <Route path="/" element={<Home />} />
          <Route path="/Nosotros" element={<About />} />
          <Route path="/Servicios" element={<Services />} />
          <Route path="/Contacto" element={<Contact />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Registro" element={<Registro />} />
          <Route path="/Verificar" element={<VerificarCodigo />} />
          <Route path="/Clasificar/imagenes" element={<ClasificarImagenes />} />
          <Route path="/Clasificar/audios" element={<ClasificarAudios />} />
          <Route path="/Clasificar/posturas" element={<ClasificarPosturas />} />
        </Route>

        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="pandas" replace />} />
          <Route path="pandas" element={<Pandas />} />
          <Route path="numpy" element={<Numpy />} />
          <Route path="numpy/graficos" element={<Graficos />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
