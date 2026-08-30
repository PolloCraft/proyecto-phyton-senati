import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useToast } from "../context/ToastContext";
import "./dashboard/Dashboard.css";

interface UserProfile {
  nombre: string;
  rol: string;
  institucion: string;
  avatar: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "";

function Dashboard() {
  const { email, token, logout, getAuthHeaders } = useAuth();
  const { info, success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ nombre: "", rol: "analista", institucion: "SENATI", avatar: null });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/profile`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [token, getAuthHeaders]);

  useEffect(() => {
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = Math.abs(endY - startY);
      if (diffY > 50) return;
      if (startX < 30 && diffX > 60) {
        setMobileSidebarOpen(true);
      } else if (mobileSidebarOpen && diffX < -60) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mobileSidebarOpen]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    info("Cerrando sesion", "Redirigiendo a la pagina de inicio...");
    setTimeout(() => {
      logout();
      success("Sesion cerrada", "Has cerrado sesion correctamente");
      navigate("/Login");
    }, 800);
  };

  const displayName = profile.nombre || email || "Usuario";
  const initials = profile.nombre
    ? profile.nombre.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase()
    : email ? email.charAt(0).toUpperCase() : "U";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      info("Imagen muy grande", "La imagen no debe superar 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const updated = { ...profile, avatar: base64 };
      setProfile(updated);
      try {
        await fetch(`${API_URL}/api/profile`, {
          method: "PUT",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64 }),
        });
        success("Avatar actualizado", "Tu imagen de perfil se ha cambiado.");
      } catch {
        toastError("Error", "No se pudo guardar el avatar en el servidor.");
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    const nombre = (document.getElementById("profile-nombre") as HTMLInputElement)?.value || "";
    const rol = (document.getElementById("profile-rol") as HTMLSelectElement)?.value || "analista";
    const institucion = (document.getElementById("profile-institucion") as HTMLInputElement)?.value || "";
    const updated = { ...profile, nombre, rol, institucion };
    setProfile(updated);
    try {
      await fetch(`${API_URL}/api/profile`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, rol, institucion }),
      });
      success("Perfil guardado", "Los cambios se guardaron correctamente.");
    } catch {
      toastError("Error", "No se pudo guardar el perfil en el servidor.");
    }
    setShowProfileModal(false);
  };

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
            <h1 className="dash-topbar-title">Dashboard Analitico</h1>
            <p className="dash-topbar-subtitle">
              Panel de procesamiento de datos en tiempo real
            </p>
          </div>
          <button
            className="sidebar-toggle-mobile"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            aria-label={mobileSidebarOpen ? "Cerrar menu" : "Abrir menu"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <Outlet />
      </div>

      {mobileSidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="sidebar-logo-text">Analitica</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => {
              if (mobileSidebarOpen) {
                setMobileSidebarOpen(false);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            aria-label="Cerrar barra lateral"
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
            onClick={() => setMobileSidebarOpen(false)}
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

          {!sidebarCollapsed && <span className="sidebar-section-label">Analisis Numerico</span>}

          <NavLink
            to="/Dashboard/numpy"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={() => setMobileSidebarOpen(false)}
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
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div className="sidebar-link-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div className="sidebar-link-text">
              <span className="sidebar-link-name">Graficos</span>
              <span className="sidebar-link-desc">Visualizacion</span>
            </div>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed ? (
            <>
              <div className="sidebar-user" onClick={() => setShowProfileModal(true)} style={{ cursor: "pointer" }}>
                <div className="sidebar-avatar">
                  {profile.avatar ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
                </div>
                <div className="sidebar-user-info">
                  <span className="sidebar-user-email">{displayName}</span>
                  <span className="sidebar-user-role">{profile.rol === "analista" ? "Analista de Datos" : profile.rol === "desarrollador" ? "Desarrollador" : "Estudiante"}</span>
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
                <div className="sidebar-avatar">{profile.avatar ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /> : initials}</div>
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
              <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px", cursor: "pointer" }} onClick={() => avatarInputRef.current?.click()}>
                <div className="profile-avatar-large" style={{ overflow: "hidden" }}>
                  {profile.avatar ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : initials}
                </div>
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid #fff" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-email">Correo Electronico</label>
                <input id="profile-email" name="email" type="email" value={email || ""} readOnly style={{ background: "#f1f5f9", cursor: "not-allowed" }} autoComplete="email" />
                <span className="profile-field-hint">El correo no se puede modificar</span>
              </div>
              <div className="profile-field">
                <label htmlFor="profile-nombre">Nombre Completo</label>
                <input id="profile-nombre" name="nombre" type="text" placeholder="Ingresa tu nombre completo" defaultValue={profile.nombre} autoComplete="name" />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-rol">Rol</label>
                <select id="profile-rol" name="rol" defaultValue={profile.rol}>
                  <option value="analista">Analista de Datos</option>
                  <option value="desarrollador">Desarrollador</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>
              <div className="profile-field">
                <label htmlFor="profile-institucion">Institucion</label>
                <input id="profile-institucion" name="institucion" type="text" placeholder="Ingresa tu institucion" defaultValue={profile.institucion} autoComplete="organization" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={saveProfile}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

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
