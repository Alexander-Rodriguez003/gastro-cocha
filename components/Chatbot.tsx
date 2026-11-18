"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Navigation, CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { ChatMessage } from "@/lib/types";
import {
  isActionAllowedForRole,
  parseChatbotAction,
  type ChatbotAction,
  type UserRole,
} from "@/lib/chatbot-rules";

const ROLE_BADGE_LABELS: Record<UserRole, string> = {
  guest: "Invitado",
  user: "Usuario",
  owner: "Propietario",
  admin: "Admin",
};

/** Renderiza texto con **negritas** de forma segura sin HTML crudo. */
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, lineIdx) => {
        const cleanLine = line.replace(/^\*\s+/, "• ");
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
        return (
          <Fragment key={lineIdx}>
            {parts.map((part, partIdx) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
                return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
              }
              return <Fragment key={partIdx}>{part}</Fragment>;
            })}
            {lineIdx < lines.length - 1 && <br />}
          </Fragment>
        );
      })}
    </>
  );
}

type ConfirmableAction =
  | Extract<ChatbotAction, { action: "confirm_review" }>
  | Extract<ChatbotAction, { action: "admin_moderate_solicitud" }>
  | Extract<ChatbotAction, { action: "admin_delete_resena" }>;

export function Chatbot() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente gastronómico de Cochabamba.\n\nPuedo recomendarte platos y restaurantes reales, llevarte a cualquier ficha o al ranking, y usar tu ubicación GPS:\n\n• \"Quiero ver el mejor plato de Cochabamba\"\n• \"Llévame a la página de un negocio cerca de mí\"\n• \"¿Dónde como silpancho económico?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmableAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const nextRole = d?.user?.role;
        if (nextRole === "admin" || nextRole === "owner" || nextRole === "user") {
          setRole(nextRole);
        } else {
          setRole("guest");
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingConfirm]);

  const requestLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => {}
      );
    }
  };

  const dispatchSiteAction = (actionObj: ChatbotAction, effectiveRole: UserRole) => {
    if (!isActionAllowedForRole(actionObj, effectiveRole)) return;

    if (actionObj.action === "navigate") {
      setActiveAction(`Abriendo ${actionObj.url}`);
      setTimeout(() => setActiveAction(null), 4000);
      router.push(actionObj.url);
      return;
    }

    if (
      actionObj.action === "confirm_review" ||
      actionObj.action === "admin_moderate_solicitud" ||
      actionObj.action === "admin_delete_resena"
    ) {
      setPendingConfirm(actionObj);
      return;
    }

    if (actionObj.action === "prefill_owner") {
      setActiveAction("Preparando cambios en Mi Negocio...");
      setTimeout(() => setActiveAction(null), 4000);
      try {
        sessionStorage.setItem("gastro_owner_prefill", JSON.stringify(actionObj));
      } catch {}
      if (!pathname.startsWith("/owner")) {
        router.push("/owner");
      } else {
        window.dispatchEvent(new CustomEvent("gastro_action", { detail: actionObj }));
      }
      return;
    }

    if (actionObj.action === "filter_negocios") {
      setActiveAction("Filtrando negocios...");
      setTimeout(() => setActiveAction(null), 4000);
      if (!pathname.startsWith("/negocios")) {
        const params = new URLSearchParams();
        if (actionObj.query) params.set("q", actionObj.query);
        if (actionObj.provincia) params.set("provincia", actionObj.provincia);
        router.push(`/negocios${params.toString() ? `?${params.toString()}` : ""}`);
      } else {
        window.dispatchEvent(new CustomEvent("gastro_action", { detail: actionObj }));
      }
      return;
    }

    if (actionObj.action === "select_map_province" || actionObj.action === "focus_map") {
      const label =
        actionObj.action === "focus_map"
          ? `Enfocando: ${actionObj.label || "Ubicación"}`
          : `Mostrando provincia en el mapa`;
      setActiveAction(label);
      setTimeout(() => setActiveAction(null), 4500);
      if (pathname !== "/") {
        try {
          sessionStorage.setItem("gastro_pending_action", JSON.stringify(actionObj));
        } catch {}
        router.push("/#mapa-gastronomico");
      } else {
        window.dispatchEvent(new CustomEvent("gastro_action", { detail: actionObj }));
      }
      return;
    }

    if (actionObj.action === "fill_form") {
      setActiveAction("Rellenando formulario de registro...");
      setTimeout(() => setActiveAction(null), 4000);
      if (!pathname.startsWith("/registrar-negocio")) {
        try {
          sessionStorage.setItem("gastro_pending_action", JSON.stringify(actionObj));
        } catch {}
        router.push("/registrar-negocio");
      } else {
        window.dispatchEvent(new CustomEvent("gastro_action", { detail: actionObj }));
      }
      return;
    }

    if (actionObj.action === "filter_list") {
      setActiveAction(`Filtrando platos hasta ${actionObj.max_price} Bs`);
      setTimeout(() => setActiveAction(null), 4500);
      window.dispatchEvent(new CustomEvent("gastro_action", { detail: actionObj }));
    }
  };

  const handleConfirmPending = async () => {
    if (!pendingConfirm || confirmBusy) return;
    setConfirmBusy(true);
    try {
      if (pendingConfirm.action === "confirm_review") {
        const res = await fetch("/api/resenas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plato_slug: pendingConfirm.plato_slug,
            lugar_slug: pendingConfirm.lugar_slug,
            rating: pendingConfirm.rating,
            titulo: pendingConfirm.titulo || "Reseña desde asistente",
            comentario: pendingConfirm.comentario,
          }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.ok
              ? "Listo: tu reseña fue publicada correctamente."
              : `No se pudo publicar la reseña: ${data.error || "revisa tu comentario"}.`,
          },
        ]);
        if (res.ok) router.refresh();
      } else if (pendingConfirm.action === "admin_moderate_solicitud") {
        const res = await fetch("/api/admin/solicitudes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pendingConfirm.id, status: pendingConfirm.status }),
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.ok
              ? `Solicitud #${pendingConfirm.id} marcada como ${pendingConfirm.status}.`
              : "No se pudo actualizar la solicitud.",
          },
        ]);
        if (res.ok) router.refresh();
      } else if (pendingConfirm.action === "admin_delete_resena") {
        const res = await fetch(`/api/admin/resenas?id=${pendingConfirm.id}`, {
          method: "DELETE",
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: res.ok
              ? `Reseña #${pendingConfirm.id} eliminada correctamente.`
              : "No se pudo eliminar la reseña.",
          },
        ]);
        if (res.ok) router.refresh();
      }
      setPendingConfirm(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error de conexión al confirmar la acción." },
      ]);
    } finally {
      setConfirmBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setActiveAction(null);
    setPendingConfirm(null);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          user_lat: userLocation?.lat,
          user_lng: userLocation?.lng,
          pathname,
        }),
      });
      const data = await res.json();
      const effectiveRole: UserRole =
        data.role === "admin" || data.role === "owner" || data.role === "user" || data.role === "guest"
          ? data.role
          : role;
      setRole(effectiveRole);

      const rawReply = data.reply || "Lo siento, hubo un error. Intenta de nuevo.";
      const parsed = parseChatbotAction(rawReply);
      const cleanReply = parsed.cleanReply || rawReply;
      const actionToRun: ChatbotAction | null = data.action || parsed.action;

      if (actionToRun) {
        dispatchSiteAction(actionToRun, effectiveRole);
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
      <button
        onClick={() => {
          setOpen(!open);
          if (!userLocation) requestLocation();
        }}
        aria-label={open ? "Cerrar asistente gastronómico" : "Abrir asistente gastronómico"}
        aria-expanded={open}
        className="gastro-chat-trigger"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "var(--color-ink)" : "var(--color-amber)",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "var(--shadow-lg)",
          transition: "transform 0.25s ease, background 0.25s ease",
          zIndex: 9999,
          border: "2px solid rgba(255,255,255,0.22)",
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Asistente gastronómico GastroCocha"
          style={{
            position: "fixed",
            bottom: "5.75rem",
            right: "1.5rem",
            width: 390,
            maxWidth: "calc(100vw - 2rem)",
            height: 540,
            maxHeight: "calc(100vh - 8rem)",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "chatPanelSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.2rem",
              background: "var(--color-cream)",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: "1.08rem",
                    color: "var(--color-ink)",
                  }}
                >
                  GastroCocha AI
                </span>
                <Sparkles size={14} color="var(--color-amber)" />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--color-amber-light)",
                    color: "var(--color-primary-dark)",
                  }}
                >
                  {ROLE_BADGE_LABELS[role]}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-muted)",
                  marginTop: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Navigation size={11} color="var(--color-forest)" />
                {userLocation ? (
                  <span style={{ color: "var(--color-forest)", fontWeight: 600 }}>Ubicación activada</span>
                ) : (
                  <span>Recomendaciones en Cochabamba</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              style={{
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: "50%",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--color-muted)",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {activeAction && (
            <div
              style={{
                background: "var(--color-forest)",
                color: "#FFFFFF",
                padding: "0.5rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle2 size={14} />
              <span>{activeAction}</span>
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
              background: "var(--color-bg)",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  padding: "0.75rem 1rem",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "var(--color-ink)" : "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  color: msg.role === "user" ? "var(--color-cream)" : "var(--color-ink)",
                  fontSize: "0.85rem",
                  lineHeight: 1.58,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {msg.role === "assistant" ? <FormattedMessage text={msg.content} /> : msg.content}
              </div>
            ))}

            {/* Inline confirmation card for DB writes */}
            {pendingConfirm && (
              <div
                style={{
                  background: "var(--color-amber-light)",
                  border: "1px solid var(--color-amber)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.9rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem",
                  fontSize: "0.82rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--color-ink)" }}>
                  <ShieldCheck size={15} color="var(--color-primary-dark)" />
                  Confirmar acción en GastroCocha
                </div>
                {pendingConfirm.action === "confirm_review" && (
                  <div style={{ color: "var(--color-ink-soft)", lineHeight: 1.45 }}>
                    <div>
                      <strong>Destino:</strong> {pendingConfirm.plato_nombre || pendingConfirm.lugar_nombre || pendingConfirm.plato_slug || pendingConfirm.lugar_slug}
                    </div>
                    <div>
                      <strong>Calificación:</strong> {pendingConfirm.rating}/5 estrellas
                    </div>
                    <div>
                      <strong>Comentario:</strong> {pendingConfirm.comentario}
                    </div>
                  </div>
                )}
                {pendingConfirm.action === "admin_moderate_solicitud" && (
                  <div style={{ color: "var(--color-ink-soft)" }}>
                    Marcar solicitud #{pendingConfirm.id} {pendingConfirm.nombre ? `(${pendingConfirm.nombre}) ` : ""}como{" "}
                    <strong>{pendingConfirm.status}</strong>.
                  </div>
                )}
                {pendingConfirm.action === "admin_delete_resena" && (
                  <div style={{ color: "var(--color-ink-soft)" }}>
                    Eliminar reseña #{pendingConfirm.id}
                    {pendingConfirm.titulo ? ` (${pendingConfirm.titulo})` : ""}.
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem" }}>
                  <button
                    type="button"
                    disabled={confirmBusy}
                    onClick={handleConfirmPending}
                    className="btn-primary"
                    style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
                  >
                    {confirmBusy ? "Guardando..." : "Confirmar"}
                  </button>
                  <button
                    type="button"
                    disabled={confirmBusy}
                    onClick={() => setPendingConfirm(null)}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

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
                Buscando en GastroCocha...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.85rem 1rem",
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
              placeholder="Pregunta o pide ir a una sección..."
              aria-label="Escribe tu consulta gastronómica"
              className="input-editorial"
              style={{ flex: 1, fontSize: "0.85rem", background: "var(--color-cream)" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              aria-label="Enviar mensaje"
              style={{
                padding: "0.7rem 0.85rem",
                borderRadius: "var(--radius-md)",
                background: "var(--color-ink)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
              }}
            >
              <Send size={17} color="#FFFFFF" />
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
        .gastro-chat-trigger:hover {
          transform: scale(1.08);
        }
      `}</style>
    </>
  );
}
