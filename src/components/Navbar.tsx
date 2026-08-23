import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <h1 className="logo">
          <img src="/img/logo.png" alt="Python" className="logo-img" />
          Mi Proyecto Python
        </h1>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
        </button>

        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Inicio</NavLink>
          <NavLink to="/Nosotros" onClick={() => setMenuOpen(false)}>Nosotros</NavLink>
          <NavLink to="/Servicios" onClick={() => setMenuOpen(false)}>Servicios</NavLink>
          <NavLink to="/Contacto" onClick={() => setMenuOpen(false)}>Contacto</NavLink>
          {isAuthenticated ? (
            <NavLink to="/Dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          ) : (
            <NavLink to="/Login" onClick={() => setMenuOpen(false)}>Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
