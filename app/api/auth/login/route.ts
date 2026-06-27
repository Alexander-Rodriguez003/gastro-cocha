import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { sanitizeEmail, isValidEmail } from "@/lib/validation";

const loginAttempts = new Map<string, { attempts: number; lockUntil: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const now = Date.now();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || (request as any).ip || "127.0.0.1";

    const attemptInfo = loginAttempts.get(ip);
    if (attemptInfo && now < attemptInfo.lockUntil) {
      const remainingMinutes = Math.ceil((attemptInfo.lockUntil - now) / (60 * 1000));
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Tu dirección IP está temporalmente bloqueada. Intenta de nuevo en ${remainingMinutes} minutos.` },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "El formato del email no es válido" }, { status: 400 });
    }

    const result = await login(cleanEmail, password);
    if (!result) {
      const current = loginAttempts.get(ip) || { attempts: 0, lockUntil: 0 };
      current.attempts += 1;

      if (current.attempts >= 5) {
        current.lockUntil = now + 15 * 60 * 1000;
        loginAttempts.set(ip, current);
        return NextResponse.json(
          { error: "Demasiados intentos fallidos. Tu IP ha sido bloqueada por 15 minutos para proteger el acceso." },
          { status: 429 }
        );
      }

      loginAttempts.set(ip, current);
      return NextResponse.json(
        { error: `Credenciales incorrectas. Te quedan ${5 - current.attempts} intentos.` },
        { status: 401 }
      );
    }

    loginAttempts.delete(ip);

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
