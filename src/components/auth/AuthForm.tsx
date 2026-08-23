import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthFormProps {
  title: string;
  subtitle: string;
  error: string;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
  onSubmit: (e: FormEvent) => void;
  linkText: string;
  linkLabel: string;
  linkTo: string;
  children: ReactNode;
}

function AuthForm({ title, subtitle, error, loading, submitLabel, loadingLabel, onSubmit, linkText, linkLabel, linkTo, children }: AuthFormProps) {
  return (
    <section className="page">
      <div style={{ maxWidth: "400px", margin: "60px auto" }}>
        <h2>{title}</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>{subtitle}</p>

        <form onSubmit={onSubmit}>
          {children}

          {error && (
            <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "1px solid transparent",
              backgroundColor: loading ? "#a5b4fc" : "#6366f1",
              color: "#fff",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem", color: "#64748b" }}>
          {linkText}{" "}
          <Link to={linkTo} style={{ color: "#6366f1", textDecoration: "none" }}>
            {linkLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default AuthForm;
