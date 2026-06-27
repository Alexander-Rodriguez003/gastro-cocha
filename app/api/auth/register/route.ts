import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth";
import { sanitizeName, sanitizeEmail, isValidEmail, isValidPassword } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const cleanName = sanitizeName(name);
    if (cleanName.length < 2) {
      return NextResponse.json({ error: "El nombre debe tener al menos 2 caracteres válidos" }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "El formato del email no es válido" }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const result = await register(cleanName, cleanEmail, password);
    if (!result) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set("gastro_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
