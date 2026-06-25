import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";

// Map to keep track of failed attempts: IP -> { attempts: number, lockUntil: number }
const loginAttempts = new Map<string, { attempts: number; lockUntil: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const now = Date.now();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || (request as any).ip || "127.0.0.1";

    // 1. Check if IP is currently locked out
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

    const result = await login(email, password);
    if (!result) {
      // Increment failed attempts for this IP
      const current = loginAttempts.get(ip) || { attempts: 0, lockUntil: 0 };
      current.attempts += 1;

      if (current.attempts >= 5) {
        // Lock for 15 minutes
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

    // Reset attempts on successful login
    loginAttempts.delete(ip);

    const response = NextResponse.json({ user: result.user });
    response.cookies.set("gastro_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
