import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthFormProps {
  title: string;
  subtitle: string;
  error?: string;
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
      <div className="auth-card">
        <h2>{title}</h2>
        <p className="auth-subtitle">{subtitle}</p>

        <form onSubmit={onSubmit}>
          {children}

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </form>

        <p className="auth-link">
          {linkText}{" "}
          <Link to={linkTo}>{linkLabel}</Link>
        </p>
      </div>
    </section>
  );
}

export default AuthForm;
