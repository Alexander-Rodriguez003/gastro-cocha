import { describe, expect, it } from "vitest";
import {
  buildChatbotCacheKey,
  isActionAllowedForRole,
  isRouteAllowedForRole,
  normalizeReviewRating,
  parseChatbotAction,
} from "@/lib/chatbot-rules";

describe("lib/chatbot-rules", () => {
  it("normaliza calificaciones decimales y fuera de rango a enteros 1..5", () => {
    expect(normalizeReviewRating(4.6)).toBe(5);
    expect(normalizeReviewRating(4.2)).toBe(4);
    expect(normalizeReviewRating(0)).toBe(1);
    expect(normalizeReviewRating(9)).toBe(5);
    expect(normalizeReviewRating("invalido")).toBe(5);
  });

  it("restringe rutas por rol y rechaza URLs externas", () => {
    expect(isRouteAllowedForRole("/ranking", "guest")).toBe(true);
    expect(isRouteAllowedForRole("/negocio/feria-del-pichon-dona-maria", "guest")).toBe(true);
    expect(isRouteAllowedForRole("/owner", "guest")).toBe(false);
    expect(isRouteAllowedForRole("/admin", "guest")).toBe(false);

    expect(isRouteAllowedForRole("/owner", "user")).toBe(false);
    expect(isRouteAllowedForRole("/owner", "owner")).toBe(true);
    expect(isRouteAllowedForRole("/admin/solicitudes", "owner")).toBe(false);
    expect(isRouteAllowedForRole("/admin/solicitudes", "admin")).toBe(true);

    expect(isRouteAllowedForRole("https://evil.com", "admin")).toBe(false);
    expect(isRouteAllowedForRole("//evil.com", "admin")).toBe(false);
    expect(isRouteAllowedForRole("/api/admin/platos", "admin")).toBe(false);
  });

  it("restringe acciones del agente según el rol del usuario", () => {
    expect(isActionAllowedForRole({ action: "navigate", url: "/ranking" }, "guest")).toBe(true);
    expect(isActionAllowedForRole({ action: "confirm_review", rating: 5, comentario: "Muy rico" }, "guest")).toBe(false);
    expect(isActionAllowedForRole({ action: "confirm_review", rating: 5, comentario: "Muy rico" }, "user")).toBe(true);

    expect(isActionAllowedForRole({ action: "prefill_owner", tab: "details", telefono: "444" }, "user")).toBe(false);
    expect(isActionAllowedForRole({ action: "prefill_owner", tab: "details", telefono: "444" }, "owner")).toBe(true);

    expect(isActionAllowedForRole({ action: "admin_moderate_solicitud", id: 1, status: "aprobado" }, "owner")).toBe(false);
    expect(isActionAllowedForRole({ action: "admin_moderate_solicitud", id: 1, status: "aprobado" }, "admin")).toBe(true);
    expect(isActionAllowedForRole({ action: "admin_delete_resena", id: 2 }, "user")).toBe(false);
    expect(isActionAllowedForRole({ action: "admin_delete_resena", id: 2 }, "admin")).toBe(true);
  });

  it("extrae y limpia bloques [[ACTION: {...}]] del texto de respuesta", () => {
    const raw = `El mejor plato es el Pichón de Cliza.\n\n[[ACTION: {"action": "navigate", "url": "/ranking"}]]`;
    const parsed = parseChatbotAction(raw);
    expect(parsed.cleanReply).toBe("El mejor plato es el Pichón de Cliza.");
    expect(parsed.action).toEqual({ action: "navigate", url: "/ranking" });

    const reviewRaw = `Preparé tu reseña.\n[[ACTION: {"action": "confirm_review", "plato_slug": "pichon-de-cliza", "rating": 4.6, "comentario": "Muy bueno"}]]`;
    const parsedReview = parseChatbotAction(reviewRaw);
    expect(parsedReview.action).toEqual({
      action: "confirm_review",
      plato_slug: "pichon-de-cliza",
      rating: 5,
      comentario: "Muy bueno",
    });
  });

  it("aisla las claves de caché por rol, ruta y GPS y desactiva caché en paneles", () => {
    const kGuest = buildChatbotCacheKey("guest", "/plato/pichon-de-cliza", "mejor plato", false);
    const kUser = buildChatbotCacheKey("user", "/plato/pichon-de-cliza", "mejor plato", false);
    const kUserGps = buildChatbotCacheKey("user", "/plato/pichon-de-cliza", "mejor plato", true);
    expect(kGuest).not.toBe(kUser);
    expect(kUser).not.toBe(kUserGps);

    expect(buildChatbotCacheKey("owner", "/owner", "mi negocio", false)).toBeNull();
    expect(buildChatbotCacheKey("admin", "/admin", "pendientes", false)).toBeNull();
  });
});
