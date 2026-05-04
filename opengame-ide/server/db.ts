import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, sessions, messages, apiSettings, InsertApiSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(userId: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values({
    userId,
    name,
    description,
  });
  
  return result;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function createSession(projectId: number, userId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sessions).values({
    projectId,
    userId,
    title,
  });
  
  return result;
}

export async function getProjectSessions(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(sessions).where(eq(sessions.projectId, projectId));
}

export async function updateSessionGameCode(sessionId: number, gameCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(sessions).set({ gameCode }).where(eq(sessions.id, sessionId));
}

export async function getSessionMessages(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(messages).where(eq(messages.sessionId, sessionId));
}

export async function addMessage(sessionId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(messages).values({
    sessionId,
    role,
    content,
  });
}

export async function getOrCreateApiSettings(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(apiSettings).where(eq(apiSettings.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  await db.insert(apiSettings).values({ userId });
  const created = await db.select().from(apiSettings).where(eq(apiSettings.userId, userId)).limit(1);
  return created[0];
}

export async function updateApiSettings(userId: number, updates: Partial<InsertApiSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(apiSettings).set(updates as any).where(eq(apiSettings.userId, userId));
}

// TODO: add feature queries here as your schema grows.
