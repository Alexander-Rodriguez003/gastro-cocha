"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, MapPin, Loader2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

export function Chatbot() {
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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Lo siento, hubo un error. Intenta de nuevo.",
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
      {/* Floating trigger button — all inline styles for reliability */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!userLocation) requestLocation();
        }}
        aria-label="Abrir chat"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D97706, #9F1239)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(217,119,6,0.4), 0 4px 10px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          zIndex: 9999,
          border: "none",
          outline: "none",
        }}
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "1.5rem",
            width: 380,
            maxWidth: "calc(100vw - 2rem)",
            maxHeight: 520,
            background: "#FFFFFF",
            border: "1px solid #E7E5E4",
            borderRadius: 24,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column" as const,
            overflow: "hidden",
            animation: "chatSlideUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "linear-gradient(135deg, #D97706, #9F1239)",
              color: "white",
            }}
          >
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              🍽️ Asistente GastroCocha
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                opacity: 0.9,
                marginTop: "0.15rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <MapPin size={12} />
              {userLocation
                ? "Ubicación detectada"
                : "Sin ubicación — activa GPS para mejores recomendaciones"}
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto" as const,
              padding: "1rem",
              display: "flex",
              flexDirection: "column" as const,
              gap: "0.75rem",
              minHeight: 200,
              maxHeight: 340,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "0.65rem 0.9rem",
                  borderRadius:
                    msg.role === "user"
                      ? "12px 12px 4px 12px"
                      : "12px 12px 12px 4px",
                  background:
                    msg.role === "user" ? "#D97706" : "#F5F5F4",
                  color: msg.role === "user" ? "white" : "#1C1917",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap" as const,
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
                  gap: "0.4rem",
                  color: "#78716C",
                  fontSize: "0.85rem",
                }}
              >
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Buscando recomendaciones...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid #E7E5E4",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="¿Qué quieres comer hoy?"
              style={{
                flex: 1,
                padding: "0.6rem 0.9rem",
                borderRadius: 12,
                border: "1px solid #E7E5E4",
                background: "#FFFBF5",
                color: "#1C1917",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: 12,
                background: "linear-gradient(135deg, #D97706, #B45309)",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Keyframe for animation */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
