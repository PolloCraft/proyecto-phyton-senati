import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/auth/AuthForm";
import FormField from "../components/auth/FormField";

function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("El correo electronico es requerido."); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Ingresa un correo electronico valido."); return; }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) { setError(data.error || "Error al iniciar sesion."); setLoading(false); return; }

      login(email);
      navigate("/Dashboard");
    } catch {
      setError("No se pudo conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Iniciar Sesion"
      subtitle="Ingresa tu correo electronico para acceder al Dashboard."
      error={error}
      loading={loading}
      submitLabel="Entrar"
      loadingLabel="Entrando..."
      onSubmit={handleSubmit}
      linkText="No tienes cuenta?"
      linkLabel="Registrate"
      linkTo="/Registro"
    >
      <FormField id="email" label="Correo electronico" type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} />
    </AuthForm>
  );
}

export default Login;
