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
  const focusMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const pickModeRef = useRef<boolean>(false);

  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [detectedProvincia, setDetectedProvincia] = useState<string>("—");
  const [platos, setPlatos] = useState<any[]>([]);
  const [nearestPlaces, setNearestPlaces] = useState<any[]>([]);
  const [pickLocationMode, setPickLocationMode] = useState<boolean>(false);
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
      
      // OpenStreetMap standard tiles (warm-tinted via CSS in globals.css)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);

      mapRef.current = map;
      markersGroupRef.current = markersGroup;

      // Load all places initially
      loadPlacesMarkers();

      // Support clicking the map to manually set user location
      map.on("click", (evt: L.LeafletMouseEvent) => {
        if (!pickModeRef.current) return;
        pickModeRef.current = false;
        setPickLocationMode(false);
        map.getContainer().style.cursor = "";
        applyUserCoordinates(evt.latlng.lat, evt.latlng.lng, 0, true);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    pickModeRef.current = pickLocationMode;
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = pickLocationMode ? "crosshair" : "";
    }
  }, [pickLocationMode]);

  // 1.1 Listen for AI Chatbot Agent Events (Dynamic map focusing/province selection)
  useEffect(() => {
    const processMapAction = (data: any) => {
      if (!data) return;

      if (data.action === "select_map_province" && typeof data.slug === "string") {
        document.getElementById("mapa-gastronomico")?.scrollIntoView({ behavior: "smooth" });
        handleProvinceChange(data.slug);
        return;
      }

      if (data.action === "focus_map") {
        const lat = Number(data.lat);
        const lng = Number(data.lng);
        const label = data.label || "Ubicación recomendada";

        if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
          document.getElementById("mapa-gastronomico")?.scrollIntoView({ behavior: "smooth" });
          mapRef.current.setView([lat, lng], 16);

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

          if (focusMarkerRef.current) {
            focusMarkerRef.current.remove();
          }
          const activeMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(mapRef.current);
          focusMarkerRef.current = activeMarker;
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

    try {
      const pending = sessionStorage.getItem("gastro_pending_action");
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed?.action === "focus_map" || parsed?.action === "select_map_province") {
          sessionStorage.removeItem("gastro_pending_action");
          setTimeout(() => processMapAction(parsed), 300);
        }
      }
    } catch {}

    const handleAiAction = (e: Event) => {
      processMapAction((e as CustomEvent).detail);
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
      setStatusMsg("Listo");
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

  const applyUserCoordinates = async (
    lat: number,
    lng: number,
    accuracyMeters = 0,
    isManual = false
  ) => {
    try {
      setUserCoords({ lat, lng });
      setErrorMsg("");

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

        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }
        const userMarker = L.marker([lat, lng], { icon: youIcon, draggable: true }).addTo(mapRef.current);
        userMarker.on("dragend", () => {
          const pos = userMarker.getLatLng();
          applyUserCoordinates(pos.lat, pos.lng, 0, true);
        });
        userMarkerRef.current = userMarker;
      }

      if (!isCoordsInCochabamba(lat, lng)) {
        setStatusMsg("");
        setErrorMsg("Ubicación fuera del departamento de Cochabamba. Centrando en la capital como referencia.");
        await handleProvinceChange("cercado");
        return;
      }

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

      await handleProvinceChange(detected.slug);
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 14);
      }

      const lugRes = await fetch(`/api/map/lugares`);
      const places = lugRes.ok ? await lugRes.json() : [];

      const nearest = places
        .map((p: any) => ({
          ...p,
          km: haversineKm(lat, lng, Number(p.lat), Number(p.lng)),
        }))
        .sort((a: any, b: any) => a.km - b.km)
        .slice(0, 4);

      setNearestPlaces(nearest);

      if (nearest.length > 0 && mapRef.current) {
        const listHtml = nearest
          .slice(0, 3)
          .map(
            (c: any) =>
              `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #EAE7E0;">
                <a href="/negocio/${c.slug}" style="color:#1A1714;font-weight:600;text-decoration:none;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${c.nombre} <span style="color:#665E57;font-weight:400;">(${c.km.toFixed(1)} km)</span></a>
                <a href="https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}" target="_blank" rel="noopener noreferrer" style="color:#FFFFFF;background:#1A1714;font-weight:600;text-decoration:none;font-size:10px;padding:2px 8px;border-radius:999px;white-space:nowrap;flex-shrink:0;">Ir</a>
              </div>`
          )
          .join("");

        const accuracyHint =
          !isManual && accuracyMeters > 2000
            ? `<div style="color:#665E57;font-size:10px;margin-top:2px;">Aprox. por red (±${Math.round(accuracyMeters / 1000)} km)</div>`
            : `<div style="color:#665E57;font-size:10px;margin-top:2px;">Arrastra el punto azul para ajustar</div>`;

        L.popup({
          maxWidth: 235,
          minWidth: 185,
          autoPan: true,
          autoPanPaddingTopLeft: [16, 48],
          autoPanPaddingBottomRight: [16, 16],
        })
          .setLatLng([lat, lng])
          .setContent(
            `<div style="font-family:var(--font-body);font-size:11px;max-height:165px;overflow-y:auto;">
              <strong style="color:#2A5C3F;font-size:12px;">Zona: ${detected.nombre}</strong>
              ${accuracyHint}
              <div style="margin-top:6px;">${listHtml}</div>
            </div>`
          )
          .openOn(mapRef.current);
      }

      if (isManual) {
        setStatusMsg(`Ubicación fijada manualmente en ${detected.nombre}. Puedes arrastrar el punto azul para afinar.`);
      } else if (accuracyMeters > 2000) {
        setStatusMsg(
          `Zona estimada por red: ${detected.nombre} (±${Math.round(accuracyMeters / 1000)} km). Si estás en otro lugar, usa "Fijar punto".`
        );
      } else {
        setStatusMsg(`Zona detectada: ${detected.nombre}`);
      }
      setTimeout(() => setStatusMsg(""), 4500);
    } catch {
      setErrorMsg("No se pudo detectar la provincia por ubicación.");
      setStatusMsg("");
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Tu navegador no soporta geolocalización. Usa \"Fijar punto en el mapa\".");
      return;
    }

    setPickLocationMode(false);
    setStatusMsg("Obteniendo tu ubicación...");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const accuracyMeters = Math.round(pos.coords.accuracy || 0);
        await applyUserCoordinates(pos.coords.latitude, pos.coords.longitude, accuracyMeters, false);
      },
      () => {
        setStatusMsg("");
        setErrorMsg("Permiso de ubicación denegado o error de GPS. También puedes usar \"Fijar punto en el mapa\".");
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
          <label htmlFor="map-provincia-select" style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)" }}>
            Filtrar por Provincia
          </label>
          <select
            id="map-provincia-select"
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

        {/* GPS Location + Manual Pin Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)" }}>
            Gastronomía a tu alrededor
          </span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleGeolocation}
              className="btn-secondary"
              style={{
                padding: "0.7rem 1rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.85rem",
                fontWeight: 600,
                flex: "1 1 150px",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Compass size={15} className="gps-compass-icon" /> Usar mi GPS
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !pickLocationMode;
                setPickLocationMode(next);
                setErrorMsg("");
                setStatusMsg(next ? "Toca o haz clic en el mapa para fijar tu ubicación exacta." : "");
              }}
              className={pickLocationMode ? "btn-primary" : "btn-ghost"}
              style={{
                padding: "0.7rem 0.95rem",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.82rem",
                fontWeight: 600,
                flex: "1 1 130px",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: pickLocationMode ? "var(--color-amber)" : "var(--color-bg-card)",
                borderColor: pickLocationMode ? "var(--color-amber)" : "var(--color-border)",
                color: pickLocationMode ? "#FFFFFF" : "var(--color-ink)",
              }}
            >
              <MapPin size={14} /> {pickLocationMode ? "Toca el mapa..." : "Fijar punto"}
            </button>
          </div>
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
            className="gastro-map-canvas"
            style={{
              width: "100%",
              zIndex: 1,
            }}
          />
        </div>

        {/* Nearest places strip (easy tap on mobile without fighting popup) */}
        {nearestPlaces.length > 0 && (
          <div
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.1rem 1.25rem",
            }}
          >
            <div style={{ fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-forest)", marginBottom: "0.75rem" }}>
              Locales más cercanos a tu punto {userCoords ? `(${detectedProvincia})` : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
              {nearestPlaces.map((c: any) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.65rem",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-cream)",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <a
                      href={`/negocio/${c.slug}`}
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: "var(--color-ink)",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.nombre}
                    </a>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                      {c.km.toFixed(1)} km
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ padding: "0.35rem 0.8rem", fontSize: "0.75rem", flexShrink: 0 }}
                  >
                    Navegar
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

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
                padding: "1.5rem",
                background: "var(--color-cream)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-muted)" }}>
                Elige una provincia rápida para explorar sus platos típicos en esta vista:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {(provincias.length > 0 ? provincias.slice(0, 8) : [
                  { slug: "cercado", nombre: "Cercado" },
                  { slug: "quillacollo", nombre: "Quillacollo" },
                  { slug: "punata", nombre: "Punata" },
                  { slug: "chapare", nombre: "Chapare" },
                  { slug: "esteban-arce", nombre: "Esteban Arce (Tarata)" },
                  { slug: "german-jordan", nombre: "Germán Jordán (Cliza)" },
                ]).map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => handleProvinceChange(p.slug)}
                    className="btn-ghost"
                    style={{
                      background: "var(--color-bg-card)",
                      color: "var(--color-ink)",
                      fontSize: "0.8rem",
                      padding: "0.45rem 0.9rem",
                    }}
                  >
                    <MapPin size={12} />
                    {p.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .gastro-map-canvas {
          height: 460px;
        }
        @media (max-width: 640px) {
          .gastro-map-canvas {
            height: 340px;
          }
        }
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
