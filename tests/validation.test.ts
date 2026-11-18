import { describe, expect, it } from "vitest";
import {
  sanitizeText,
  sanitizeOptionalText,
  isValidEmail,
  sanitizeEmail,
  toSlug,
  isValidPhone,
  sanitizePhone,
  isValidUrl,
  isValidImageRef,
  isValidName,
  sanitizeName,
  isValidPassword,
  sanitizeNumber,
  isValidLatitude,
  isValidLongitude,
} from "@/lib/validation";

describe("lib/validation", () => {
  it("preserva tildes y ñ en textos mientras elimina emojis y caracteres de control", () => {
    expect(sanitizeText("Pensión Doña María\n\t - Cliza 🍽️")).toBe("Pensión Doña María - Cliza");
    expect(sanitizeText("a".repeat(250), 100)).toHaveLength(100);
    expect(sanitizeOptionalText("   ")).toBeNull();
    expect(sanitizeOptionalText("  Chorizo Tarateño  ")).toBe("Chorizo Tarateño");
  });

  it("exige ASCII estricto en emails y normaliza acentos/ñ en sanitizeEmail", () => {
    expect(isValidEmail("usuario@gastrococha.bo")).toBe(true);
    expect(isValidEmail("peña@correo.com")).toBe(false);
    expect(isValidEmail("josé@correo.com")).toBe(false);
    expect(isValidEmail("invalido")).toBe(false);
    expect(sanitizeEmail("  María.Peña@GMAIL.com  ")).toBe("maria.pena@gmail.com");
  });

  it("genera slugs ASCII limpios", () => {
    expect(toSlug("Pichón de Cliza")).toBe("pichon-de-cliza");
    expect(toSlug("Chorizo Tarateño #1")).toBe("chorizo-tarateno-1");
  });

  it("valida y normaliza teléfonos, URLs e imágenes", () => {
    expect(isValidPhone("+591 4 4251234")).toBe(true);
    expect(isValidPhone("abc")).toBe(false);
    expect(sanitizePhone("+591 712-34567")).toBe("+59171234567");

    expect(isValidUrl("https://guiagastronomicacohala.dpdns.org")).toBe(true);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidImageRef("/images/silpancho.png")).toBe(true);
    expect(isValidImageRef("https://example.supabase.co/storage/v1/object/public/gastro-images/a.jpg")).toBe(true);
    expect(isValidImageRef("data:text/html,hola")).toBe(false);
  });

  it("valida nombres, contraseñas, números y coordenadas", () => {
    expect(isValidName("Doña Rosa")).toBe(true);
    expect(isValidName("A")).toBe(false);
    expect(sanitizeName("Pedro  Arandia!")).toBe("Pedro Arandia");
    expect(isValidPassword("123456")).toBe(true);
    expect(isValidPassword("12345")).toBe(false);

    expect(sanitizeNumber("45.5")).toBe(45.5);
    expect(sanitizeNumber("")).toBeNull();
    expect(sanitizeNumber("NaN")).toBeNull();

    expect(isValidLatitude(-17.3895)).toBe(true);
    expect(isValidLatitude(-95)).toBe(false);
    expect(isValidLongitude(-66.1568)).toBe(true);
    expect(isValidLongitude(181)).toBe(false);
  });
});
