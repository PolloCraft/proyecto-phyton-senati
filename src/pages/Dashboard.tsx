import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/dashboard/Dashboard.css";

function Dashboard() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  return (
    <section className="page" style={{ alignItems: "center", textAlign: "center" }}>
      <div className="dashboard-topbar">
        <button onClick={() => navigate("/")} className="action-btn action-btn-secondary">
          Volver al inicio
        </button>
        <div className="dashboard-topbar-center">
          <h2 style={{ margin: 0 }}>Dashboard Analitico</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
            Sesion de: <strong>{email}</strong>
          </p>
        </div>
        <button onClick={handleLogout} className="action-btn action-btn-secondary">
          Cerrar sesion
        </button>
      </div>

      <p>Selecciona la herramienta que deseas consultar para procesar tus datos.</p>

      <nav className="dashboard-nav">
        <ul className="nav-links">
          <li>
            <NavLink to="/Dashboard/pandas">Pandas (CSV)</NavLink>
          </li>
          <li>
            <NavLink to="/Dashboard/numpy">NumPy (Matrices)</NavLink>
          </li>
        </ul>
      </nav>

      <Outlet />
    </section>
  );
}

export default Dashboard;
