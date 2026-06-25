import { cookies } from "next/headers";
import { simpleHash } from "./utils";
import { USERS_SEED } from "./seed-data";
import { createHmac, randomBytes } from "crypto";
import { loadJSONData, saveJSONData } from "./db_helper";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin" | "owner";
}

const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString("hex");

// Simple signed token to prevent tampering
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
    
    // Verify signature
    const expectedSignature = createHmac("sha256", JWT_SECRET).update(payload).digest("base64");
    if (signature !== expectedSignature) {
      console.warn("Intento de violación de firma en token detectado!");
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

// Mock user store (will be replaced by Supabase queries)
let userIdCounter = 1;
const defaultUsers = [
  ...USERS_SEED.map((u) => ({
    id: userIdCounter++,
    name: u.name,
    email: u.email,
    role: u.role as "user" | "admin" | "owner",
    passwordHash: "", // Will be set on first call
  })),
  {
    id: 100,
    name: "Juana Mamani",
    email: "juana@comedordonajuana.com",
    role: "owner" as const,
    passwordHash: "",
  },
  {
    id: 101,
    name: "Carlos Quispe",
    email: "carlos@truchaselparaiso.com",
    role: "owner" as const,
    passwordHash: "",
  },
  {
    id: 102,
    name: "Palacio Owner",
    email: "silpancho@elpalaciodelsilpancho.com",
    role: "owner" as const,
    passwordHash: "",
  }
];

export let usersDB: any[] = defaultUsers;

export function reloadUsers() {
  const persisted = loadJSONData();
  if (persisted && persisted.users) {
    usersDB = persisted.users;
  }
}

// Initialize password hashes
let initialized = false;
async function initHashes() {
  reloadUsers();
  if (initialized) return;
  for (const u of usersDB) {
    if (u.passwordHash) continue;
    const seed = USERS_SEED.find((s) => s.email === u.email);
    if (seed) {
      u.passwordHash = await simpleHash(seed.password);
    } else if (u.email === "juana@comedordonajuana.com") {
      u.passwordHash = await simpleHash("juana123");
    } else if (u.email === "carlos@truchaselparaiso.com") {
      u.passwordHash = await simpleHash("carlos123");
    } else if (u.email === "silpancho@elpalaciodelsilpancho.com") {
      u.passwordHash = await simpleHash("silpancho123");
    }
  }
  initialized = true;
  saveJSONData({ users: usersDB });
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
  saveJSONData({ users: usersDB });

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

export async function getOwnersList(): Promise<any[]> {
  await initHashes();
  return usersDB.filter(u => u.role === "owner").map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
}

export async function createOwnerAccount(name: string, email: string, passwordPlain: string): Promise<boolean> {
  await initHashes();
  const existing = usersDB.find(u => u.email === email);
  if (existing) {
    existing.role = "owner";
    existing.passwordHash = await simpleHash(passwordPlain);
    saveJSONData({ users: usersDB });
    return true;
  }
  
  const hash = await simpleHash(passwordPlain);
  usersDB.push({
    id: 1000 + Math.floor(Math.random() * 10000),
    name,
    email,
    role: "owner" as const,
    passwordHash: hash
  });
  saveJSONData({ users: usersDB });
  return true;
}

export async function resetUserPassword(email: string, passwordPlain: string): Promise<boolean> {
  await initHashes();
  const user = usersDB.find(u => u.email === email);
  if (!user) return false;
  user.passwordHash = await simpleHash(passwordPlain);
  saveJSONData({ users: usersDB });
  return true;
}
