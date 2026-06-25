import { cookies } from "next/headers";
import { createHmac, randomBytes } from "crypto";
import { getServiceSupabase } from "./supabase";
import type { User } from "./types";

const db = () => getServiceSupabase();

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "owner";
}

const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString("hex");

function encode(data: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64");
  const signature = createHmac("sha256", JWT_SECRET).update(payload).digest("base64");
  return `${payload}.${signature}`;
}

function decode(token: string): SessionUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expectedSignature = createHmac("sha256", JWT_SECRET).update(payload).digest("base64");
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

function hashPassword(password: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(password + "gastro-cocha-salt").digest("hex");
}

export async function login(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  const hash = hashPassword(password);
  const { data } = await db()
    .from("users")
    .select("id, name, email, role")
    .eq("email", email)
    .eq("password_hash", hash)
    .single();

  if (!data) return null;

  const session: SessionUser = {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
  return { user: session, token: encode(session) };
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  const { data: existing } = await db().from("users").select("id").eq("email", email).single();
  if (existing) return null;

  const hash = hashPassword(password);
  const { data, error } = await db()
    .from("users")
    .insert({ name, email, password_hash: hash, role: "user" })
    .select("id, name, email, role")
    .single();

  if (error || !data) return null;

  const session: SessionUser = {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
  return { user: session, token: encode(session) };
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("gastro_session")?.value;
  if (!token) return null;
  return decode(token);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

export async function getOwnersList(): Promise<any[]> {
  const { data } = await db()
    .from("users")
    .select("id, name, email, role")
    .eq("role", "owner");

  return data || [];
}

export async function createOwnerAccount(name: string, email: string, passwordPlain: string): Promise<boolean> {
  const hash = hashPassword(passwordPlain);
  const { data: existing } = await db().from("users").select("id").eq("email", email).single();

  if (existing) {
    const { error } = await db()
      .from("users")
      .update({ role: "owner", password_hash: hash })
      .eq("id", existing.id);
    return !error;
  }

  const { error } = await db()
    .from("users")
    .insert({ name, email, password_hash: hash, role: "owner" });
  return !error;
}

export async function resetUserPassword(email: string, passwordPlain: string): Promise<boolean> {
  const hash = hashPassword(passwordPlain);
  const { error } = await db()
    .from("users")
    .update({ password_hash: hash })
    .eq("email", email);
  return !error;
}
