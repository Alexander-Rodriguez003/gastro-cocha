import { describe, expect, it } from "vitest";
import { checkOffensiveContent } from "@/lib/moderation";

describe("lib/moderation", () => {
  it("detecta palabras y frases ofensivas incluyendo acentos, repeticiones y mayúsculas", () => {
    expect(checkOffensiveContent("Una PUTA MIERDA de comida").isOffensive).toBe(true);
    expect(checkOffensiveContent("Puuutaaa qué asco, hdp").isOffensive).toBe(true);
    expect(checkOffensiveContent("El dueño es un estafador y son basura").isOffensive).toBe(true);
    expect(checkOffensiveContent("Vayan a cagar, vale verga").isOffensive).toBe(true);
  });

  it("acepta críticas negativas o constructivas sin insultos (cero falsos positivos)", () => {
    expect(
      checkOffensiveContent("La comida llegó fría, tardaron 45 minutos y el precio es alto para la porción.").isOffensive
    ).toBe(false);
    expect(
      checkOffensiveContent("No me gustó el ají, estaba muy salado y el local era pequeño.").isOffensive
    ).toBe(false);
    expect(
      checkOffensiveContent("Excelente pichón de Cliza, muy sabroso y buena atención.").isOffensive
    ).toBe(false);
    expect(checkOffensiveContent("Sin disputa el mejor chorizo tarateño").isOffensive).toBe(false);
  });
});
