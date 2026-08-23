import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/auth/FormField";

function VerificarCodigo() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const codeFromUrl = searchParams.get("code") || "";
  const [code, setCode] = useState(codeFromUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) { setError("Ingresa el codigo de verificacion."); return; }
    if (code.length !== 6) { setError("El codigo debe tener 6 digitos."); return; }
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Error al verificar."); setLoading(false); return; }
      login(email);
      navigate("/Dashboard");
    } catch {
      setError("No se pudo conectar con el servidor.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Error al reenviar codigo."); }
      else if (data.code) { alert(`Codigo (modo sin correo): ${data.code}`); setCode(data.code); }
      else { alert("Nuevo codigo enviado a tu correo."); }
    } catch { setError("No se pudo conectar con el servidor."); }
    setResending(false);
  };

  if (!email) {
    return (
      <section className="page">
        <div style={{ maxWidth: "400px", margin: "60px auto", textAlign: "center" }}>
          <h2>Sesion no iniciada</h2>
          <p style={{ color: "#64748b" }}>Primero debes registrarte.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div style={{ maxWidth: "400px", margin: "60px auto" }}>
        <h2>Verificar Codigo</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Se envio un codigo de 6 digitos a <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <FormField
            id="code"
            label="Codigo de verificacion"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(val) => setCode(val.replace(/\D/g, ""))}
            inputStyle={{ fontSize: "1.2rem", textAlign: "center", letterSpacing: "8px", padding: "12px 14px" }}
          />

          {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</p>}

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 18px", borderRadius: "8px", border: "1px solid transparent", backgroundColor: loading ? "#a5b4fc" : "#6366f1", color: "#fff", fontWeight: 500, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem", color: "#64748b" }}>
          No recibiste el codigo?{" "}
          <button onClick={handleResend} disabled={resending} style={{ background: "none", border: "none", color: "#6366f1", cursor: resending ? "not-allowed" : "pointer", fontSize: "0.9rem", padding: 0 }}>
            {resending ? "Reenviando..." : "Reenviar codigo"}
          </button>
        </p>
      </div>
    </section>
  );
}

export default VerificarCodigo;
