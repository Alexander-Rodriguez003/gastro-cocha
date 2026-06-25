"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Navigation, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/lib/types";

export function Chatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente gastronómico de Cochabamba.\n\nPuedo recomendarte platos y restaurantes según tu ubicación o presupuesto. Prueba preguntarme:\n\n• \"¿Dónde puedo comer un silpancho económico?\"\n• \"¿Qué restaurantes hay cerca de mí?\"\n• \"¿Cuál es el mejor pique macho de la ciudad?\"",
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
          if (actionObj.action === "navigate") actionLabel = `Redirigiendo a: ${actionObj.url}`;
          if (actionObj.action === "fill_form") actionLabel = "Rellenando formulario...";
          if (actionObj.action === "filter_list") actionLabel = `Filtrando platos < ${actionObj.max_price} Bs`;
          if (actionObj.action === "add_review") actionLabel = `Agregando reseña...`;
          
          setActiveAction(actionLabel);
          setTimeout(() => setActiveAction(null), 4500);

          // Execute action or route redirection
          if (actionObj.action === "navigate" && actionObj.url) {
            router.push(actionObj.url);
          } else {
            // Dispatch event for other client components
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
          content: "Error de conexión. Verifica tu conexión a internet.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ===== Floating gastronomic trigger button ===== */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!userLocation) requestLocation();
        }}
        aria-label="Abrir chat"
        className="gastro-chat-trigger"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "var(--shadow-lg), 0 4px 20px rgba(217, 119, 6, 0.25)",
          transition: "all 0.3s ease",
          zIndex: 9999,
          border: "none",
          outline: "none",
        }}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* ===== Warm Gastronomic Chat Panel ===== */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "1.5rem",
            width: 380,
            maxWidth: "calc(100vw - 2rem)",
            height: 520,
            maxHeight: "calc(100vh - 8rem)",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg), 0 10px 40px rgba(28, 25, 23, 0.12)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "chatPanelSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1.25rem",
              background: "var(--color-surface-warm)",
              borderBottom: "1px solid var(--color-border)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--color-primary-dark)",
                }}
              >
                GastroCocha AI
              </span>
              <Sparkles size={14} color="var(--color-primary)" />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginTop: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Navigation size={12} color="var(--color-secondary)" />
              {userLocation ? (
                <span style={{ color: "var(--color-secondary-dark)", fontWeight: 600 }}>Ubicación activada</span>
              ) : (
                <span>Recomendaciones globales</span>
              )}
            </div>
          </div>

          {/* Action Pop-up Notification */}
          {activeAction && (
            <div
              style={{
                background: "var(--color-secondary)",
                color: "#FFFFFF",
                padding: "0.5rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "var(--shadow-sm)",
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
              background: "var(--color-bg)",
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
                      ? "var(--color-primary)"
                      : "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  color: msg.role === "user" ? "#FFFFFF" : "var(--color-text)",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  boxShadow: "var(--shadow-sm)",
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
                  color: "var(--color-text-muted)",
                  fontSize: "0.8rem",
                  background: "var(--color-bg-card)",
                  padding: "0.5rem 1rem",
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                }}
              >
                <Loader2
                  size={14}
                  color="var(--color-primary)"
                  className="animate-spin"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Buscando sabores...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              gap: "0.5rem",
              background: "var(--color-bg-card)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="¿Dónde puedo comer silpancho?"
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                fontSize: "0.85rem",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid var(--color-primary)";
                e.target.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid var(--color-border)";
                e.target.style.background = "var(--color-bg)";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: "0.75rem",
                borderRadius: 12,
                background: "var(--color-primary)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-primary)";
              }}
            >
              <Send size={18} color="#FFFFFF" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatPanelSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes actionFlash {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .gastro-chat-trigger:hover {
          transform: scale(1.08);
        }
      `}</style>
    </>
  );
}
