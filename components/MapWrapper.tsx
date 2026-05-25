"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
const DynamicMap = dynamic(
  () => import("./InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div 
        className="card-skeleton animate-pulse" 
        style={{ 
          height: 450, 
          borderRadius: 20, 
          background: "rgba(28, 25, 23, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.9rem",
          color: "var(--color-text-muted)"
        }}
      >
        Cargando mapa interactivo...
      </div>
    )
  }
);

export function MapWrapper() {
  return <DynamicMap />;
}
