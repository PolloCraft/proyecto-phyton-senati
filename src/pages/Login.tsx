import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AuthForm from "../components/auth/AuthForm";
import FormField from "../components/auth/FormField";
import Turnstile from "../components/auth/Turnstile";

function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const { login } = useAuth();
  const { error: toastError, loading: toastLoading } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toastError("Correo requerido", "El correo electrónico es obligatorio para iniciar sesión.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toastError("Correo inválido", "Ingresa un correo electrónico válido.");
      return;
    }

    if (!turnstileToken) {
      toastError("Verificacion requerida", "Completa la verificacion anti-bot.");
      return;
    }

    const { dismiss } = toastLoading("Iniciando sesión", "Verificando credenciales...");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        dismiss("error", data.error || "Credenciales incorrectas o error del servidor.");
        return;
      }

      login(email, data.token);
      dismiss("success", `Has iniciado sesión como ${email}`);
      navigate("/Dashboard");
    } catch {
      dismiss("error", "No se pudo conectar con el servidor. Verifica tu conexión a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Iniciar Sesion"
      subtitle="Ingresa tu correo electronico para acceder al Dashboard."
      loading={loading}
      submitLabel="Entrar"
      loadingLabel="Entrando..."
      onSubmit={handleSubmit}
      linkText="No tienes cuenta?"
      linkLabel="Registrate"
      linkTo="/Registro"
    >
      <FormField id="email" label="Correo electronico" type="email" placeholder="tu@correo.com" value={email} onChange={setEmail} autoComplete="email" />
      <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken("")} />
    </AuthForm>
  );
}

export default Login;
