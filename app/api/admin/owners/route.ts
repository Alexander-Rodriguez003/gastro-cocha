import { NextResponse } from "next/server";
import { isAdmin, getOwnersList, createOwnerAccount, resetUserPassword } from "@/lib/auth";
import { getAllLugaresAdmin, updateLugarOwnerEmail } from "@/lib/data";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const owners = await getOwnersList();
  const lugares = await getAllLugaresAdmin();

  return NextResponse.json({ success: true, owners, lugares });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { action } = data;

    if (action === "create_owner") {
      const { name, email, password, lugarId } = data;
      if (!name || !email || !password || !lugarId) {
        return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
      }

      // Create owner account
      await createOwnerAccount(name, email, password);

      // Link email to restaurant
      await updateLugarOwnerEmail(Number(lugarId), email);

      return NextResponse.json({ success: true });
    }

    if (action === "reset_password") {
      const { email, password } = data;
      if (!email || !password) {
        return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
      }

      const ok = await resetUserPassword(email, password);
      if (!ok) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "link_only") {
      const { email, lugarId } = data;
      if (!email || !lugarId) {
        return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
      }

      await updateLugarOwnerEmail(Number(lugarId), email);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error interno" }, { status: 500 });
  }
}
