import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";
import FormField from "../components/auth/FormField";
import Turnstile from "../components/auth/Turnstile";

function Registro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const navigate = useNavigate();

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken("");
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("El nombre es requerido."); return; }
    if (!email.trim()) { setError("El correo electronico es requerido."); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Ingresa un correo electronico valido."); return; }

    if (!turnstileToken) { setError("Completa la verificacion anti-bot."); return; }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, turnstileToken }),
      });

      const data = await response.json();

      if (!response.ok) { setError(data.error || "Error al registrarse."); setLoading(false); return; }

      navigate(`/Verificar?email=${encodeURIComponent(email)}`);
    } catch {
      setError("No se pudo conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Registrarse"
      subtitle="Crea tu cuenta para acceder al Dashboard."
      error={error}
      loading={loading}
      submitLabel="Registrarse"
      loadingLabel="Registrando..."
      onSubmit={handleSubmit}
      linkText="Ya tienes cuenta?"
      linkLabel="Inicia sesion"
      linkTo="/Login"
    >
      <FormField id="name" label="Nombre completo" placeholder="Tu nombre" value={name} onChange={setName} autoComplete="name" />
      <FormField id="email" label="Correo electronico" type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} autoComplete="email" />
      <Turnstile onVerify={handleTurnstileVerify} onExpire={handleTurnstileExpire} />
    </AuthForm>
  );
}

export default Registro;
