"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Star, MapPin, Compass, AlertCircle, Sparkles, Navigation } from "lucide-react";
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
      const map = L.map(mapContainerRef.current).setView([-17.3895, -66.1568], 11);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
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

          // Add a beautiful special neon pulse marker for the AI action!
          const pulseIcon = L.divIcon({
            className: "neon-map-pulse-marker",
            html: `<div style="
              width: 16px;
              height: 16px;
              background: #10B981;
              border: 3px solid #FFFFFF;
              border-radius: 50%;
              box-shadow: 0 0 15px #10B981, 0 0 30px #06B6D4;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -12px;
                left: -12px;
                width: 34px;
                height: 34px;
                border: 2px solid #06B6D4;
                border-radius: 50%;
                animation: markerPulse 1.2s infinite ease-out;
              "></div>
            </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          const activeMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(mapRef.current);
          activeMarker.bindPopup(`
            <div style="font-family: var(--font-sans); padding: 4px; color: #0f172a; min-width: 160px;">
              <strong style="color: #059669; font-size: 13px; display: flex; align-items: center; gap: 4px;">📍 ${label}</strong>
              <p style="margin: 6px 0 0; font-size: 11px; color: #64748b;">Enfocado por Asistente GastroCocha</p>
              <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="margin-top: 8px; display: block; text-align: center; font-size: 10px; font-weight: 700; color: white; background: linear-gradient(135deg, #10B981, #06B6D4); padding: 6px 10px; border-radius: 6px; text-decoration: none; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">🗺️ Iniciar Maps</a>
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

      // Put new markers
      places.forEach((place: any) => {
        const marker = L.marker([Number(place.lat), Number(place.lng)]);
        marker.bindPopup(`
          <div style="font-family: var(--font-sans); padding: 2px;">
            <strong style="color: var(--color-primary); font-size: 14px;">${place.nombre}</strong>
            <p style="margin: 4px 0 0; font-size: 12px; color: var(--color-text-muted);">${place.direccion || ""}</p>
            <div style="display: flex; gap: 6px; margin-top: 8px; min-width: 170px;">
              <a href="/negocio/${place.slug}" style="display: inline-block; font-size: 10px; font-weight: 700; color: white; background: #10B981; padding: 4px 8px; border-radius: 6px; text-decoration: none; box-shadow: 0 2px 5px rgba(16,185,129,0.3);">⭐ Visitar Local</a>
              <a href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 10px; font-weight: 600; color: var(--color-primary-dark); background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.15); padding: 3px 8px; border-radius: 6px; text-decoration: none;">🗺️ Maps</a>
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

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización.");
      return;
    }

    setStatusMsg("Obteniendo tu ubicación...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });

          // Add user circle marker
          if (mapRef.current) {
            const youMarker = L.circleMarker([lat, lng], {
              radius: 9,
              color: "white",
              fillColor: "#3B82F6",
              fillOpacity: 0.9,
              weight: 2,
            });

            youMarker.bindPopup(`<strong style="color:#3B82F6;">📍 Estás aquí</strong>`).addTo(mapRef.current);
            mapRef.current.setView([lat, lng], 14);
          }

          // Detect nearest province
          setStatusMsg("Detectando provincia...");
          const detectRes = await fetch(`/api/map/provincia-por-coordenadas?lat=${lat}&lng=${lng}`);
          
          if (detectRes.status === 204) {
            setStatusMsg("");
            setErrorMsg("No se detectó provincia cercana.");
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
              .map((c: any) => `• <strong>${c.nombre}</strong> (${c.km.toFixed(2)} km) <a href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); font-weight: 600; text-decoration: underline; font-size: 11px; margin-left: 4px;">Ir 🗺️</a>`)
              .join("<br>");
            
            L.popup()
              .setLatLng([lat, lng])
              .setContent(`
                <div style="font-family: var(--font-sans); font-size: 13px;">
                  <strong style="color:#3B82F6;">📍 Ubicación detectada</strong><br/>
                  <span style="color:#78716C; font-size: 11px;">Provincia: ${detected.nombre}</span><br/><br/>
                  <strong>Locales más cercanos:</strong><br/>
                  ${listHtml}
                </div>
              `)
              .openOn(mapRef.current);
          }

          setStatusMsg(`Provincia detectada: ${detected.nombre} ✅`);
          setTimeout(() => setStatusMsg(""), 2000);
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
          border: "1px solid rgba(220, 38, 38, 0.1)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          alignItems: "center",
        }}
      >
        {/* Province Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            🏔️ Filtrar por Provincia
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => handleProvinceChange(e.target.value)}
            style={{
              padding: "0.65rem 0.9rem",
              borderRadius: 12,
              border: "1px solid #E7E5E4",
              background: "#FFFBF5",
              fontSize: "0.95rem",
              fontWeight: 500,
              outline: "none",
              cursor: "pointer",
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
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            📍 Gastronomía a tu alrededor
          </label>
          <button
            onClick={handleGeolocation}
            className="btn-secondary"
            style={{
              padding: "0.65rem 1rem",
              fontSize: "0.95rem",
              width: "100%",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Compass size={18} className="animate-spin-slow" /> Usar mi ubicación GPS
          </button>
        </div>

        {/* Status / Nearest info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            🔍 Provincia Detectada
          </label>
          <div
            style={{
              padding: "0.65rem 0.9rem",
              borderRadius: 12,
              background: "rgba(217, 119, 6, 0.08)",
              border: "1px solid rgba(217, 119, 6, 0.2)",
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--color-primary)",
              textAlign: "center",
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
            padding: "0.75rem 1rem",
            background: "rgba(217, 119, 6, 0.05)",
            border: "1px solid rgba(217, 119, 6, 0.15)",
            borderRadius: 10,
            fontSize: "0.9rem",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Sparkles size={16} /> {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0.75rem 1rem",
            background: "#FEE2E2",
            border: "1px solid #FECACA",
            borderRadius: 10,
            fontSize: "0.9rem",
            color: "#991B1B",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {/* Map and Dishes Side-by-Side/Stack Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2rem",
        }}
      >
        {/* Leaflet Container */}
        <div
          className="glass-card"
          style={{
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid rgba(28, 25, 23, 0.08)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            ref={mapContainerRef}
            style={{
              height: 450,
              width: "100%",
              zIndex: 1,
            }}
          />
        </div>

        {/* Dynamic Plates List */}
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={20} color="var(--color-primary)" />
              Platos tradicionales de la zona
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
              {selectedSlug 
                ? `Especialidades gastronómicas registradas en ${detectedProvincia}` 
                : "Elige una provincia en el mapa o selector para ver sus platos típicos."}
            </p>
          </div>

          {loadingPlatos ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="card-skeleton" style={{ height: 260 }} />
              ))}
            </div>
          ) : platos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {platos.map((plato) => (
                <PlatoCard key={plato.id} plato={plato} />
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: "rgba(28, 25, 23, 0.02)",
                border: "1px dashed rgba(28, 25, 23, 0.12)",
                borderRadius: 16,
                color: "var(--color-text-muted)",
              }}
            >
              <Navigation size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
              No hay platos listados para mostrar aún. Selecciona una provincia arriba.
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes markerPulse {
          0% { transform: scale(0.35); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
