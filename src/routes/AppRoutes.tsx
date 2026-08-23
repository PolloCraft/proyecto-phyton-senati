import { Routes, Route, Navigate } from "react-router-dom";
import MainLayouts from "../layouts/MainLayouts";
import ProtectedRoute from "../components/ProtectedRoute";

import Home from "../pages/Home";
import About from "../pages/About";
import Services from "../pages/Services";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import VerificarCodigo from "../pages/VerificarCodigo";

import Dashboard from "../pages/Dashboard";
import Pandas from "../pages/dashboard/Pandas";
import Numpy from "../pages/dashboard/Numpy";
import Graficos from "../pages/dashboard/Graficos";

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas CON navbar y footer */}
      <Route element={<MainLayouts />}>
        <Route path="/" element={<Home />} />
        <Route path="/Nosotros" element={<About />} />
        <Route path="/Servicios" element={<Services />} />
        <Route path="/Contacto" element={<Contact />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Verificar" element={<VerificarCodigo />} />
      </Route>

      {/* Dashboard SIN navbar ni footer */}
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
  );
}

export default AppRoutes;