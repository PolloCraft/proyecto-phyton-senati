import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useToast } from "../context/ToastContext";
import "./dashboard/Dashboard.css";

function Dashboard() {
  const { email, logout } = useAuth();
  const { info, success } = useToast();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    info("Cerrando sesión", "Redirigiendo a la página de inicio...");
    setTimeout(() => {
      logout();
      success("Sesión cerrada", "Has cerrado sesión correctamente");
      navigate("/Login");
    }, 800);
  };

  const initials = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <button onClick={() => navigate("/")} className="dash-back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver al Inicio
          </button>
          <div className="dash-topbar-center">
            <h2 className="dash-topbar-title">Dashboard Analitico</h2>
            <p className="dash-topbar-subtitle">
              Panel de procesamiento de datos en tiempo real
            </p>
          </div>
          <div />
        </div>

        <Outlet />
      </div>

      <aside className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="sidebar-logo-text">Analitica</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {!sidebarCollapsed && <span className="sidebar-section-label">Procesamiento de Datos</span>}

          <NavLink
            to="/Dashboard/pandas"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <div className="sidebar-link-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="sidebar-link-text">
              <span className="sidebar-link-name">Pandas</span>
              <span className="sidebar-link-desc">Limpieza de CSV</span>
            </div>
          </NavLink>

          {!sidebarCollapsed && <span className="sidebar-section-label">Análisis Numérico</span>}

          <NavLink
            to="/Dashboard/numpy"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <div className="sidebar-link-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="sidebar-link-text">
              <span className="sidebar-link-name">NumPy</span>
              <span className="sidebar-link-desc">Matrices y Vectores</span>
            </div>
          </NavLink>

          <NavLink
            to="/Dashboard/numpy/graficos"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <div className="sidebar-link-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div className="sidebar-link-text">
              <span className="sidebar-link-name">Gráficos</span>
              <span className="sidebar-link-desc">Visualización</span>
            </div>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <>
              <div className="sidebar-user" onClick={() => setShowProfileModal(true)} style={{ cursor: "pointer" }}>
                <div className="sidebar-avatar">{initials}</div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-email">{email}</span>
                  <span className="sidebar-user-role">Analista</span>
                </div>
              </div>
              <button onClick={handleLogout} className="sidebar-logout" disabled={isLoggingOut}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {isLoggingOut ? (
                  <>
                    <span className="loading-spinner-small" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    Cerrando...
                  </>
                ) : (
                  "Cerrar Sesion"
                )}
              </button>
            </>
          ) : (
            <>
              <button
                className="sidebar-user-collapsed"
                onClick={() => setShowProfileModal(true)}
                aria-label="Perfil de usuario"
              >
                <div className="sidebar-avatar">{initials}</div>
              </button>
              <button
                onClick={handleLogout}
                className="sidebar-logout-collapsed"
                disabled={isLoggingOut}
                aria-label="Cerrar sesion"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Perfil</h3>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar-large">{initials}</div>
              <div className="profile-field">
                <label>Correo Electronico</label>
                <input type="email" value={email || ""} readOnly style={{ background: "#f1f5f9", cursor: "not-allowed" }} />
                <span className="profile-field-hint">El correo no se puede modificar</span>
              </div>
              <div className="profile-field">
                <label>Nombre Completo</label>
                <input type="text" placeholder="Ingresa tu nombre completo" defaultValue="" />
              </div>
              <div className="profile-field">
                <label>Rol</label>
                <select defaultValue="analista">
                  <option value="analista">Analista de Datos</option>
                  <option value="desarrollador">Desarrollador</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>
              <div className="profile-field">
                <label>Institucion</label>
                <input type="text" placeholder="Ingresa tu institucion" defaultValue="SENATI" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancelar</button>
              <button className="btn-primary">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="logout-loading">
            <div className="logout-spinner" />
            <p>Cerrando sesion...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
