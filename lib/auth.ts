import { cookies } from "next/headers";
import { simpleHash } from "./utils";
import { USERS_SEED } from "./seed-data";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

// Simple JWT-like token (in production, use proper JWT or Supabase Auth)
function encode(data: SessionUser): string {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function decode(token: string): SessionUser | null {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

// Mock user store (will be replaced by Supabase queries)
let userIdCounter = 1;
const usersDB = USERS_SEED.map((u) => ({
  id: userIdCounter++,
  name: u.name,
  email: u.email,
  role: u.role,
  passwordHash: "", // Will be set on first call
}));

// Initialize password hashes
let initialized = false;
async function initHashes() {
  if (initialized) return;
  for (const u of usersDB) {
    const seed = USERS_SEED.find((s) => s.email === u.email);
    if (seed) {
      u.passwordHash = await simpleHash(seed.password);
    }
  }
  initialized = true;
}

export async function login(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  await initHashes();
  const hash = await simpleHash(password);
  const user = usersDB.find((u) => u.email === email && u.passwordHash === hash);
  if (!user) return null;

  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return { user: session, token: encode(session) };
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string } | null> {
  await initHashes();
  if (usersDB.find((u) => u.email === email)) return null; // Email exists

  const hash = await simpleHash(password);
  const newUser = {
    id: ++userIdCounter,
    name,
    email,
    role: "user" as const,
    passwordHash: hash,
  };
  usersDB.push(newUser);

  const session: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
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
