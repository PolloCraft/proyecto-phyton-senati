import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({ 
  children, 
  variant = "primary", 
  style, 
  ...props 
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    padding: "8px 18px",
    borderRadius: "8px",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: "1px solid transparent",
    ...style,
  };

  const primaryStyle: CSSProperties = {
    ...baseStyle,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    color: "#6366f1",
    borderColor: "rgba(99, 102, 241, 0.3)",
  };

  const secondaryStyle: CSSProperties = {
    ...baseStyle,
    backgroundColor: "transparent",
    color: "#64748b",
    borderColor: "#cbd5e1",
  };

  return (
    <button
      style={variant === "primary" ? primaryStyle : secondaryStyle}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
