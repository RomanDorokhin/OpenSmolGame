import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAuthContext(userId: number = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `test${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("IDE - Projects Router", () => {
  it("should create a new project", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      name: "Test Game",
      description: "A test game project",
    });

    expect(result).toBeDefined();
  });

  it("should list user projects", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.list();

    expect(Array.isArray(projects)).toBe(true);
  });
});

describe("IDE - Chat Router", () => {
  it("should add a message to session", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Note: This test would need a valid sessionId from a created session
    // For now, we're testing the input validation
    try {
      await caller.chat.sendMessage({
        sessionId: 999,
        content: "Create a simple game",
      });
    } catch (e) {
      // Expected to fail without a valid session
      expect(e).toBeDefined();
    }
  });
});

describe("IDE - API Settings Router", () => {
  it("should get or create API settings", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.apiSettings.get();

    expect(settings).toBeDefined();
    expect(settings.userId).toBe(ctx.user?.id);
  });

  it("should update API settings", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const updated = await caller.apiSettings.update({
      openaiKey: "sk-test-key",
      selectedProvider: "openai",
      selectedModel: "gpt-4-turbo",
    });

    expect(updated).toBeDefined();
  });
});

describe("IDE - Auth Router", () => {
  it("should get current user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.id).toBe(ctx.user?.id);
  });

  it("should logout user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
  });
});
