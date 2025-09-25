// components/ui/LoaderRing.tsx
import React from "react";

/** Circular ring with a blue sweeping arc + "Loading..." label */
const LoaderRing: React.FC<{
  size?: number;
  stroke?: number;
  label?: string;
}> = ({
  size = 72, // px diameter (tweak to your taste)
  stroke = 6, // ring thickness
  label = "Loading...",
}) => {
  const track = "rgba(255,255,255,0.22)"; // subtle gray on black bg
  const arc = "#2F6BFF"; // blue from the mock

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        aria-label={label}
        role="status"
        className="rounded-full animate-spin"
        style={{
          width: size,
          height: size,
          // small blue arc + gray rest
          background: `conic-gradient(${arc} 0 18%, ${track} 18% 100%)`,
          // punch the hole to make it a ring
          WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 0)`,
          mask: `radial-gradient(farthest-side, transparent calc(100% - ${stroke}px), #000 0)`,
        }}
      />
      <div className="mt-3 text-white text-lg font-medium">{label}</div>
    </div>
  );
};

export default LoaderRing;
