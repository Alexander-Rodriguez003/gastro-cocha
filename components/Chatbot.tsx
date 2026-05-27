"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, MapPin, Loader2, Sparkles, Navigation, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/lib/types";

export function Chatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "¡Hola! 👋 Soy tu asistente gastronómico de Cochabamba.\n\nPuedo recomendarte platos y restaurantes según tu ubicación o presupuesto.\n\n• \"¿Dónde como silpancho barato?\"\n• \"¿Qué hay cerca de mí?\"\n• \"El mejor plato de Cochabamba\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => console.log("Ubicación denegada")
      );
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setActiveAction(null);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          user_lat: userLocation?.lat,
          user_lng: userLocation?.lng,
        }),
      });
      const data = await res.json();
      
      let cleanReply = data.reply || "Lo siento, hubo un error. Intenta de nuevo.";
      
      // Parse [[ACTION: (...) ]] JSON blocks in the AI response
      const actionRegex = /\[\[ACTION:\s*({.*?})\s*\]\]/;
      const match = cleanReply.match(actionRegex);
      
      if (match) {
        try {
          const actionObj = JSON.parse(match[1]);
          // Strip action block from visible message text
          cleanReply = cleanReply.replace(actionRegex, "").trim();
          
          // Trigger visual notification of the AI's action
          let actionLabel = "Ejecutando acción";
          if (actionObj.action === "focus_map") actionLabel = `📍 Enfocando: ${actionObj.label || "Ubicación"}`;
          if (actionObj.action === "navigate") actionLabel = `⚡ Redirigiendo a: ${actionObj.url}`;
          if (actionObj.action === "fill_form") actionLabel = "📝 Rellenando formulario de registro...";
          if (actionObj.action === "filter_list") actionLabel = `🔍 Filtrando platos < ${actionObj.max_price} Bs`;
          if (actionObj.action === "add_review") actionLabel = `💬 Agregando reseña de 5 estrellas...`;
          
          setActiveAction(actionLabel);
          setTimeout(() => setActiveAction(null), 4500);

          // Execute action or route redirection
          if (actionObj.action === "navigate" && actionObj.url) {
            router.push(actionObj.url);
          } else {
            // Dispatch dynamic Custom Event for map, forms, ranking and filters to hook into client-side!
            window.dispatchEvent(new CustomEvent("gastro_action", { detail: actionObj }));
          }
        } catch (err) {
          console.error("Action parsing error:", err);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cleanReply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error de conexión. Verifica tu internet.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Floating neon pulse trigger button ===== */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!userLocation) requestLocation();
        }}
        aria-label="Abrir chat"
        className="neon-trigger-pulse"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10B981, #06B6D4)", // Vibrant Emerald/Cyan gaming gradient
          color: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 0 25px rgba(16, 185, 129, 0.6), 0 0 50px rgba(6, 182, 212, 0.3)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 9999,
          border: "2px solid #34D399",
          outline: "none",
        }}
      >
        {open ? <X size={26} style={{ strokeWidth: 2.5 }} /> : <MessageCircle size={26} style={{ strokeWidth: 2.5 }} />}
      </button>

      {/* ===== Cyber Neon Glassmorphic Chat Panel (Geometry Dash Essence) ===== */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "1.5rem",
            width: 390,
            maxWidth: "calc(100vw - 2rem)",
            height: 540,
            maxHeight: "calc(100vh - 8rem)",
            background: "rgba(9, 15, 30, 0.95)", // Deep space gaming dark background
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "2px solid #10B981", // Pulse neon Emerald frame
            borderRadius: 24,
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.25), 0 25px 50px rgba(0, 0, 0, 0.6)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "neonPanelSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1.25rem",
              background: "linear-gradient(90deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))",
              borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                  animation: "neonPulse 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1rem",
                  letterSpacing: "0.05em",
                  color: "#FFFFFF",
                  textShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
                }}
              >
                GastroCocha AI Agent
              </span>
              <Sparkles size={14} color="#06B6D4" style={{ filter: "drop-shadow(0 0 4px #06B6D4)" }} />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "0.35rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Navigation size={12} color="#06B6D4" />
              {userLocation ? (
                <span style={{ color: "#34D399", fontWeight: 600 }}>GPS Geolocalizado</span>
              ) : (
                <span>GPS Desactivado · Recomendaciones globales</span>
              )}
            </div>
          </div>

          {/* Action Pop-up Notification (Rhythmic gaming cue) */}
          {activeAction && (
            <div
              style={{
                background: "linear-gradient(90deg, #10B981, #06B6D4)",
                color: "#020617",
                padding: "0.5rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 0 15px rgba(16,185,129,0.4)",
                animation: "actionFlash 0.3s ease",
              }}
            >
              <CheckCircle2 size={14} />
              <span>{activeAction}</span>
            </div>
          )}

          {/* Messages view */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "0.75rem 1rem",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #059669, #047857)" // Neon Green for User
                      : "rgba(255, 255, 255, 0.05)", // Glass dark gray for Assistant
                  border:
                    msg.role === "user"
                      ? "1px solid #10B981"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  boxShadow:
                    msg.role === "user"
                      ? "0 4px 12px rgba(16, 185, 129, 0.15)"
                      : "none",
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#94A3B8",
                  fontSize: "0.8rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "0.5rem 1rem",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <Loader2
                  size={16}
                  color="#10B981"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Procesando consulta...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Futuristic Glowing Input */}
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid rgba(16, 185, 129, 0.2)",
              display: "flex",
              gap: "0.5rem",
              background: "rgba(2, 6, 23, 0.4)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe: 'Márcame La Quillacolleña en el mapa'..."
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: 12,
                border: "1px solid rgba(16, 185, 129, 0.3)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #06B6D4";
                e.target.style.boxShadow = "0 0 10px rgba(6, 182, 212, 0.4)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(16, 185, 129, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: "0.75rem",
                borderRadius: 12,
                background: "linear-gradient(135deg, #10B981, #06B6D4)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Send size={18} color="#020617" style={{ strokeWidth: 2.5 }} />
            </button>
          </div>
        </div>
      )}

      {/* Cyber Animations (Geometry Dash Pulsing Essence) */}
      <style>{`
        @keyframes neonPanelSlideIn {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes neonPulse {
          0% { opacity: 0.5; box-shadow: 0 0 4px #10B981; }
          50% { opacity: 1; box-shadow: 0 0 12px #10B981; }
          100% { opacity: 0.5; box-shadow: 0 0 4px #10B981; }
        }
        @keyframes actionFlash {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .neon-trigger-pulse:hover {
          transform: scale(1.1) rotate(5deg) !important;
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.8), 0 0 70px rgba(6, 182, 212, 0.5) !important;
        }
      `}</style>
    </>
  );
}
