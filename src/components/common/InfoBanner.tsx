import type { CSSProperties, ReactNode } from "react";

interface InfoBannerProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  style?: CSSProperties;
}

function InfoBanner({ children, color = "#6366f1", bg = "#eef2ff", style }: InfoBannerProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: bg,
        borderLeft: `5px solid ${color}`,
        borderRadius: "8px",
        marginBottom: "16px",
        color,
        fontWeight: "bold",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default InfoBanner;
