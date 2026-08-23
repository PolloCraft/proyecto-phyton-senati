import type { CSSProperties } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  inputStyle?: CSSProperties;
}

function FormField({ id, label, type = "text", placeholder, value, onChange, maxLength, inputStyle }: FormFieldProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        htmlFor={id}
        style={{
          display: "block",
          marginBottom: "6px",
          fontWeight: 500,
          fontSize: "0.9rem",
          color: "#334155",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "0.95rem",
          outline: "none",
          boxSizing: "border-box",
          ...inputStyle,
        }}
      />
    </div>
  );
}

export default FormField;
