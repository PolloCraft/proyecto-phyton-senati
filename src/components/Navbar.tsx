import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(target) && !(e.target as HTMLElement).closest(".hamburger")) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-content">
        <NavLink to="/" className="logo" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>
          <img src="/img/logo.png" alt="Python" className="logo-img" />
          <span className="logo-text">
            <span>Mi Proyecto</span>
            <span style={{ color: "var(--primary)", fontWeight: 800 }}>Python</span>
          </span>
        </NavLink>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
        </button>

        {menuOpen && (
          <div
            className="nav-overlay"
            onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
          />
        )}

        <nav ref={navRef} className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <NavLink
            to="/"
            end
            onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
          >
            Inicio
          </NavLink>
          <NavLink
            to="/Nosotros"
            onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
          >
            Nosotros
          </NavLink>
          <NavLink
            to="/Servicios"
            onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
          >
            Servicios
          </NavLink>
          <NavLink
            to="/Contacto"
            onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
          >
            Contacto
          </NavLink>

          {isAuthenticated ? (
            <NavLink
              to="/Dashboard"
              onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", verticalAlign: "-2px" }}>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </NavLink>
          ) : (
            <NavLink
              to="/Login"
              onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}
              style={({ isActive }) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                background: isActive ? "var(--indigo-50)" : "linear-gradient(135deg, var(--indigo-500), var(--indigo-600))",
                color: isActive ? "var(--indigo-600)" : "white",
                borderRadius: "var(--radius-md)",
                fontWeight: "600",
                fontSize: "0.88rem",
                boxShadow: isActive ? "none" : "0 2px 6px rgba(99,102,241,0.3)",
                borderBottom: "none",
              })}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Iniciar Sesion
            </NavLink>
          )}

          <div className={`dropdown ${dropdownOpen ? "open" : ""}`} ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Acciones
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dropdown-arrow">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div className="dropdown-menu">
              <NavLink
                to="/Clasificar/imagenes"
                onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                Imagenes
              </NavLink>
              <NavLink
                to="/Clasificar/audios"
                onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
                Audios
              </NavLink>
              <NavLink to="/Clasificar/posturas" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
                Posturas
              </NavLink>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
