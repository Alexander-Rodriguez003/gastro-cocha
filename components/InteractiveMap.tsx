"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Star, MapPin, Compass, AlertCircle, Sparkles, Navigation, ChevronRight } from "lucide-react";
import { PlatoCard } from "./PlatoCard";

// Fix for default Leaflet icon paths in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ProvinciaOption {
  nombre: string;
  slug: string;
  centro_lat: number | null;
  centro_lng: number | null;
  zoom_mapa: number | null;
}

interface SelectedProvinciaDetail {
  nombre: string;
  slug: string;
  centro_lat: number | null;
  centro_lng: number | null;
  zoom_mapa: number | null;
  platos: any[];
}

export function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [detectedProvincia, setDetectedProvincia] = useState<string>("—");
  const [platos, setPlatos] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loadingPlatos, setLoadingPlatos] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // 1. Load initial provinces list & init Leaflet Map
  useEffect(() => {
    // Load provinces
    fetch("/api/map/provincias")
      .then((r) => r.json())
      .then((data) => setProvincias(data))
      .catch((err) => {
        console.error(err);
        setErrorMsg("No se pudieron cargar las provincias.");
      });

    // Init Map
    if (mapContainerRef.current && !mapRef.current) {
      // Center in Cochabamba (Cercado)
      const map = L.map(mapContainerRef.current).setView([-17.3895, -66.1568], 11);
      
      // Beautiful, minimalist CartoDB light/cream map style
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/">CartoDB</a>',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);

      mapRef.current = map;
      markersGroupRef.current = markersGroup;

      // Load all places initially
      loadPlacesMarkers();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 1.1 Listen for AI Chatbot Agent Events (Dynamic map focusing/navigation)
  useEffect(() => {
    const handleAiAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      if (!data) return;

      if (data.action === "focus_map") {
        const lat = Number(data.lat);
        const lng = Number(data.lng);
        const label = data.label || "Ubicación recomendada";

        if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
          // Scroll dynamically to map viewport smoothly
          document.getElementById("mapa-gastronomico")?.scrollIntoView({ behavior: "smooth" });

          // Smoothly pan camera to coordinates
          mapRef.current.setView([lat, lng], 16);

          // Add a beautiful special pulse marker for the AI action
          const pulseIcon = L.divIcon({
            className: "gastro-map-pulse-marker",
            html: `<div style="
              width: 16px;
              height: 16px;
              background: var(--color-primary, #C8702A);
              border: 3px solid #FFFFFF;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(200, 112, 42, 0.5);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -12px;
                left: -12px;
                width: 34px;
                height: 34px;
                border: 2px solid var(--color-primary, #C8702A);
                border-radius: 50%;
                opacity: 0.8;
                animation: markerPulse 1.2s infinite ease-out;
              "></div>
            </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const activeMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(mapRef.current);
          activeMarker.bindPopup(`
            <div style="font-family: var(--font-body); padding: 4px; color: var(--color-ink); min-width: 160px;">
              <strong style="color: var(--color-primary); font-size: 13px; display: flex; align-items: center; gap: 4px;">${label}</strong>
              <p style="margin: 6px 0 0; font-size: 11px; color: var(--color-muted);">Enfocado por Asistente GastroCocha</p>
              <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="margin-top: 8px; display: block; text-align: center; font-size: 10px; font-weight: 700; color: white; background: var(--color-ink); padding: 6px 10px; border-radius: 20px; text-decoration: none; transition: background 0.2s;">Ver en Google Maps</a>
            </div>
          `).openPopup();
        }
      }
    };

    window.addEventListener("gastro_action", handleAiAction);
    return () => {
      window.removeEventListener("gastro_action", handleAiAction);
    };
  }, []);

  // Helper to load places markers on map
  const loadPlacesMarkers = async (slug?: string) => {
    if (!markersGroupRef.current) return;
    try {
      const url = slug ? `/api/map/lugares?provincia=${slug}` : "/api/map/lugares";
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const places = await res.json();
      
      // Clear current markers (leaving user location if any)
      markersGroupRef.current.clearLayers();

      // Put new markers with customized premium theme icons
      places.forEach((place: any) => {
        const customIcon = L.divIcon({
          className: "gastro-restaurant-marker",
          html: `<div style="
            width: 28px;
            height: 28px;
            background: var(--color-forest);
            border: 2px solid var(--color-cream);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          " class="marker-inner-circle">
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2A10 10 0 0 0 2 12a9.9 9.9 0 0 0 1.9 5.9L12 22l8.1-4.1A9.9 9.9 0 0 0 22 12a10 10 0 0 0-10-10z" />
            </svg>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28]
        });

        const marker = L.marker([Number(place.lat), Number(place.lng)], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: var(--font-body); padding: 4px; min-width: 180px;">
            <strong style="color: var(--color-ink); font-size: 14px; font-family: var(--font-serif);">${place.nombre}</strong>
            <p style="margin: 4px 0 8px; font-size: 11px; color: var(--color-muted); line-height: 1.4;">${place.direccion || ""}</p>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <a href="/negocio/${place.slug}" style="display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; color: white; background: var(--color-forest); padding: 5px 10px; border-radius: 20px; text-decoration: none; transition: opacity 0.2s;">Ver local</a>
              <a href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; font-size: 10px; font-weight: 600; color: var(--color-ink); background: var(--color-cream); border: 1px solid var(--color-border); padding: 4px 10px; border-radius: 20px; text-decoration: none; transition: background 0.2s;">Navegar</a>
            </div>
          </div>
        `);
        markersGroupRef.current?.addLayer(marker);
      });
    } catch {
      setErrorMsg("Error al cargar los marcadores de locales.");
    }
  };

  // 2. Fetch details when province selection changes
  const handleProvinceChange = async (slug: string) => {
    setSelectedSlug(slug);
    setErrorMsg("");
    
    if (!slug) {
      setPlatos([]);
      setDetectedProvincia("—");
      if (mapRef.current) {
        mapRef.current.setView([-17.3895, -66.1568], 11);
      }
      loadPlacesMarkers();
      return;
    }

    setLoadingPlatos(true);
    try {
      setStatusMsg("Cargando provincia...");
      const res = await fetch(`/api/map/provincia/${slug}`);
      if (!res.ok) throw new Error("No se pudo cargar la provincia.");
      const detail: SelectedProvinciaDetail = await res.json();

      setDetectedProvincia(detail.nombre);
      setPlatos(detail.platos);

      // Recenter Map
      if (mapRef.current) {
        const lat = Number(detail.centro_lat ?? -17.3895);
        const lng = Number(detail.centro_lng ?? -66.1568);
        const zoom = Number(detail.zoom_mapa ?? 11);
        mapRef.current.setView([lat, lng], zoom);
      }

      // Filter Map Markers
      await loadPlacesMarkers(slug);
      setStatusMsg("Listo ✅");
      setTimeout(() => setStatusMsg(""), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al cargar los datos.");
    } finally {
      setLoadingPlatos(false);
    }
  };

  // Geolocation & Distance Calculation (Haversine)
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };

  // Check if coordinates are in Cochabamba roughly
  const isCoordsInCochabamba = (lat: number, lng: number): boolean => {
    return lat >= -18.5 && lat <= -15.5 && lng >= -67.5 && lng <= -64.5;
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización.");
      return;
    }

    setStatusMsg("Obteniendo tu ubicación...");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });

          // Add user circle marker
          if (mapRef.current) {
            const youIcon = L.divIcon({
              className: "gastro-user-location-marker",
              html: `<div style="
                width: 18px;
                height: 18px;
                background: #3B82F6;
                border: 3px solid #FFFFFF;
                border-radius: 50%;
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
                position: relative;
              ">
                <div style="
                  position: absolute;
                  top: -9px;
                  left: -9px;
                  width: 30px;
                  height: 30px;
                  border: 2px solid #3B82F6;
                  border-radius: 50%;
                  opacity: 0.6;
                  animation: markerPulse 1.5s infinite ease-out;
                "></div>
              </div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });

            L.marker([lat, lng], { icon: youIcon })
              .bindPopup(`<strong style="color:#3B82F6; font-family: var(--font-body);">Estás aquí</strong>`)
              .addTo(mapRef.current);
          }

          // Check if coordinates are in Cochabamba
          if (!isCoordsInCochabamba(lat, lng)) {
            setStatusMsg("");
            setErrorMsg("Ubicación fuera del departamento de Cochabamba. Centrando en la capital como referencia.");
            
            // Fallback: load Capital (Cercado)
            await handleProvinceChange("cercado");
            return;
          }

          // Detect nearest province
          setStatusMsg("Detectando provincia...");
          const detectRes = await fetch(`/api/map/provincia-por-coordenadas?lat=${lat}&lng=${lng}`);
          
          if (detectRes.status === 204) {
            setStatusMsg("");
            setErrorMsg("Ubicación fuera de rango de provincias de Cochabamba. Centrando en la capital.");
            await handleProvinceChange("cercado");
            return;
          }

          if (!detectRes.ok) throw new Error();
          const detected = await detectRes.json();

          // Select detected province & load details
          await handleProvinceChange(detected.slug);

          // Get restaurants of this province to find closest ones
          const lugRes = await fetch(`/api/map/lugares?provincia=${detected.slug}`);
          const places = lugRes.ok ? await lugRes.json() : [];

          const nearest = places
            .map((p: any) => ({
              ...p,
              km: haversineKm(lat, lng, Number(p.lat), Number(p.lng)),
            }))
            .sort((a: any, b: any) => a.km - b.km)
            .slice(0, 5);

          if (nearest.length > 0 && mapRef.current) {
            const listHtml = nearest
              .map((c: any) => `<li style="margin-bottom: 6px;"><strong>${c.nombre}</strong> (${c.km.toFixed(2)} km) <a href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); font-weight: 600; text-decoration: underline; font-size: 11px; margin-left: 4px;">Navegar</a></li>`)
              .join("");
            
            L.popup()
              .setLatLng([lat, lng])
              .setContent(`
                <div style="font-family: var(--font-body); font-size: 12px; min-width: 200px;">
                  <strong style="color:#3B82F6; font-size: 13px;">Ubicación detectada</strong><br/>
                  <span style="color:var(--color-muted); font-size: 11px;">Provincia: ${detected.nombre}</span><br/><br/>
                  <strong style="display: block; margin-bottom: 4px;">Locales más cercanos:</strong>
                  <ul style="margin: 0; padding-left: 14px; list-style-type: disc;">
                    ${listHtml}
                  </ul>
                </div>
              `)
              .openOn(mapRef.current);
          }

          setStatusMsg(`Provincia detectada: ${detected.nombre} ✅`);
          setTimeout(() => setStatusMsg(""), 2500);
        } catch (err) {
          setErrorMsg("No se pudo detectar la provincia por ubicación.");
          setStatusMsg("");
        }
      },
      (err) => {
        setStatusMsg("");
        setErrorMsg("Permiso de ubicación denegado o error de GPS.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Map Control Bar */}
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "1.5rem",
          borderRadius: 16,
          border: "1px solid var(--color-border)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          alignItems: "center",
          background: "var(--color-cream)",
        }}
      >
        {/* Province Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)" }}>
            Filtrar por Provincia
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => handleProvinceChange(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%232c251e' stroke-width='2' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'></path></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">— Ver todo el mapa —</option>
            {provincias.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* GPS Location Button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)" }}>
            Gastronomía a tu alrededor
          </label>
          <button
            onClick={handleGeolocation}
            className="btn-secondary"
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.9rem",
              fontWeight: 600,
              width: "100%",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid var(--color-ink)",
              background: "transparent",
              color: "var(--color-ink)",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            <Compass size={16} className="gps-compass-icon" /> Usar mi ubicación GPS
          </button>
        </div>

        {/* Status / Detected info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)" }}>
            Provincia Detectada
          </label>
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-forest)",
              border: "1px solid var(--color-forest)",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "white",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            {detectedProvincia}
          </div>
        </div>
      </div>

      {/* Messages */}
      {statusMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0.85rem 1.25rem",
            background: "rgba(200, 112, 42, 0.05)",
            border: "1px solid rgba(200, 112, 42, 0.15)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-body)",
          }}
        >
          <Sparkles size={16} /> {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0.85rem 1.25rem",
            background: "#FFF5F5",
            border: "1px solid #FFE3E3",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            color: "#C53030",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-body)",
          }}
        >
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Map and Dishes Stack Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2.5rem",
        }}
      >
        {/* Leaflet Container */}
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
            position: "relative",
            zIndex: 1,
            background: "var(--color-cream)",
          }}
        >
          <div
            ref={mapContainerRef}
            style={{
              height: 480,
              width: "100%",
              zIndex: 1,
            }}
          />
        </div>

        {/* Dynamic Plates List */}
        <div>
          <div style={{ marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", display: "flex", alignItems: "center", gap: 10, color: "var(--color-ink)", margin: 0 }}>
              Platos tradicionales de la zona
            </h3>
            <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginTop: 6, fontFamily: "var(--font-body)" }}>
              {selectedSlug 
                ? `Especialidades típicas y recetas patrimoniales listadas en la provincia de ${detectedProvincia}` 
                : "Elige una provincia en el selector o mapa para conocer sus platos típicos."}
            </p>
          </div>

          {loadingPlatos ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: "1.5rem" }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="card-skeleton animate-pulse" style={{ height: 260, borderRadius: 16, background: "rgba(28, 25, 23, 0.05)" }} />
              ))}
            </div>
          ) : platos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {platos.map((plato) => (
                <PlatoCard key={plato.id} plato={plato} />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "4rem 2rem",
                textAlign: "center",
                background: "var(--color-cream)",
                border: "1px dashed var(--color-border)",
                borderRadius: 16,
                color: "var(--color-muted)",
              }}
            >
              <Navigation size={28} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "0.9rem" }}>
                Ninguna provincia seleccionada. Elige una del selector o del mapa para ver sus platos típicos.
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes markerPulse {
          0% { transform: scale(0.35); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .gastro-restaurant-marker:hover .marker-inner-circle {
          transform: scale(1.2) translateY(-2px);
          background: var(--color-primary) !important;
        }
        .btn-secondary:hover {
          background: var(--color-ink) !important;
          color: var(--color-cream) !important;
        }
        .btn-secondary:hover .gps-compass-icon {
          animation: spin 3s infinite linear;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
