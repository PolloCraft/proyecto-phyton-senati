import type { ReactNode } from "react";

interface HeroSectionProps {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
}

function HeroSection({ imageSrc, imageAlt, children }: HeroSectionProps) {
  return (
    <div className="hero-section">
      <div className="hero-image-wrapper">
        <img src={imageSrc} alt={imageAlt} className="hero-image" />
      </div>
      <div className="hero-content">
        {children}
      </div>
    </div>
  );
}

export default HeroSection;
