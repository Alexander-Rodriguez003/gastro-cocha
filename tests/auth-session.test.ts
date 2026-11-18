import { describe, expect, it } from "vitest";
import { encode, decode, type SessionUser } from "@/lib/auth";

describe("lib/auth session tokens", () => {
  it("firma y verifica correctamente una sesión HMAC", () => {
    const user: SessionUser = {
      id: 42,
      name: "María López",
      email: "maria@gastrococha.bo",
      role: "owner",
    };

    const token = encode(user);
    expect(token.split(".")).toHaveLength(2);
    expect(decode(token)).toEqual(user);
  });

  it("rechaza tokens alterados o malformados", () => {
    const token = encode({
      id: 1,
      name: "Usuario",
      email: "user@gastrococha.bo",
      role: "user",
    });

    const [payload, sig] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ id: 1, name: "Admin", email: "user@gastrococha.bo", role: "admin" })
    ).toString("base64");

    expect(decode(`${tamperedPayload}.${sig}`)).toBeNull();
    expect(decode(`${payload}.invalid`)).toBeNull();
    expect(decode("sin-punto")).toBeNull();
  });
});
