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
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

export default FormField;
