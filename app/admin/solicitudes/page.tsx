"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, X, MapPin, Phone } from "lucide-react";

interface Solicitud {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  nombre_propietario: string;
  provincia: string;
  lat: number;
  lng: number;
  platos_que_sirve: string;
  fecha: string;
  status: "pendiente" | "aprobado" | "rechazado";
}

const MOCK_SOLICITUDES: Solicitud[] = [
  {
    id: 1, nombre: "Comedor Doña Juana", direccion: "Carretera Cbba-Oruro Km 15, al lado del puente",
    telefono: "+591 71222333", nombre_propietario: "Juana Mamani", provincia: "Quillacollo",
    lat: -17.41, lng: -66.35, platos_que_sirve: "Fricasé, Chicharrón, Trancapecho",
    fecha: "2026-05-20", status: "pendiente",
  },
  {
    id: 2, nombre: "Truchas El Paraíso", direccion: "Entrada a Villa Tunari, curva del río",
    telefono: "+591 71444555", nombre_propietario: "Carlos Quispe", provincia: "Chapare",
    lat: -16.98, lng: -65.42, platos_que_sirve: "Trucha frita, Tambaquí, Surubí",
    fecha: "2026-05-21", status: "pendiente",
  },
];

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(MOCK_SOLICITUDES);

  const updateStatus = (id: number, status: "aprobado" | "rechazado") => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const pendientes = solicitudes.filter((s) => s.status === "pendiente");
  const procesadas = solicitudes.filter((s) => s.status !== "pendiente");

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 4, color: "#78716C", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Panel Admin
      </Link>

      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.75rem", marginBottom: "0.5rem" }}>
        📋 Solicitudes de Registro
      </h1>
      <p style={{ color: "#78716C", marginBottom: "2rem", fontSize: "0.9rem" }}>
        Revisa y aprueba los negocios que quieren aparecer en la guía.
      </p>

      {/* Pendientes */}
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem", color: "#D97706" }}>
        ⏳ Pendientes ({pendientes.length})
      </h2>
      {pendientes.length === 0 ? (
        <p style={{ color: "#78716C", fontStyle: "italic", marginBottom: "2rem" }}>No hay solicitudes pendientes 🎉</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2.5rem" }}>
          {pendientes.map((sol) => (
            <div key={sol.id} className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #D97706" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}>{sol.nombre}</h3>
                  <div style={{ color: "#78716C", fontSize: "0.82rem", marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                    <span><MapPin size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {sol.direccion} — {sol.provincia}</span>
                    <span><Phone size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {sol.telefono} ({sol.nombre_propietario})</span>
                    <span>🍽️ {sol.platos_que_sirve}</span>
                    <span>📅 Enviado: {sol.fecha}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${sol.lat},${sol.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "#D97706", marginTop: 6, display: "inline-block" }}
                  >
                    📍 Ver en Google Maps →
                  </a>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => updateStatus(sol.id, "aprobado")}
                    style={{ padding: "0.5rem 1rem", borderRadius: 10, background: "#059669", color: "white", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}
                  >
                    <Check size={16} /> Aprobar
                  </button>
                  <button
                    onClick={() => updateStatus(sol.id, "rechazado")}
                    style={{ padding: "0.5rem 1rem", borderRadius: 10, background: "#EF4444", color: "white", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}
                  >
                    <X size={16} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Procesadas */}
      {procesadas.length > 0 && (
        <>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "1rem" }}>
            ✅ Procesadas ({procesadas.length})
          </h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {procesadas.map((sol) => (
              <div key={sol.id} className="card" style={{ padding: "1rem 1.25rem", opacity: 0.7, borderLeft: `4px solid ${sol.status === "aprobado" ? "#059669" : "#EF4444"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{sol.nombre}</span>
                  <span style={{
                    padding: "2px 10px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600,
                    background: sol.status === "aprobado" ? "#D1FAE5" : "#FEE2E2",
                    color: sol.status === "aprobado" ? "#047857" : "#991B1B",
                  }}>
                    {sol.status === "aprobado" ? "✅ Aprobado" : "❌ Rechazado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
