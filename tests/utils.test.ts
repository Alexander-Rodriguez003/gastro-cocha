import { describe, expect, it } from "vitest";
import {
  haversine,
  generateSlug,
  formatPrice,
  formatDistance,
  renderStars,
  isWithinCochabamba,
} from "@/lib/utils";

describe("lib/utils", () => {
  it("calcula distancias haversine coherentes dentro de Cochabamba", () => {
    const samePoint = haversine(-17.3895, -66.1568, -17.3895, -66.1568);
    expect(samePoint).toBe(0);

    // Cercado -> Quillacollo (~13 km aprox)
    const dist = haversine(-17.3895, -66.1568, -17.3923, -66.2784);
    expect(dist).toBeGreaterThan(10);
    expect(dist).toBeLessThan(16);
  });

  it("formatea precios, distancias, estrellas y slugs", () => {
    expect(formatPrice(null)).toBe("Consultar");
    expect(formatPrice(45)).toBe("45 Bs");
    expect(formatDistance(0.42)).toBe("420 m");
    expect(formatDistance(2.34)).toBe("2.3 km");
    expect(formatDistance(15.7)).toBe("16 km");
    expect(renderStars(4.5)).toBe("★★★★½");
    expect(renderStars(3)).toBe("★★★☆☆");
    expect(generateSlug("Germán Jordán")).toBe("german-jordan");
  });

  it("detecta si unas coordenadas pertenecen al rango de Cochabamba", () => {
    expect(isWithinCochabamba(-17.3895, -66.1568)).toBe(true);
    expect(isWithinCochabamba(40.4168, -3.7038)).toBe(false);
  });
});
