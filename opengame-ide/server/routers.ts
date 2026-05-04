import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getUserProjects(ctx.user.id);
    }),
    create: protectedProcedure
      .input((val: any) => {
        if (typeof val.name !== "string") throw new Error("Invalid input");
        return val as { name: string; description?: string };
      })
      .mutation(({ ctx, input }) => {
        return db.createProject(ctx.user.id, input.name, input.description);
      }),
  }),

  sessions: router({
    list: protectedProcedure
      .input((val: any) => {
        if (typeof val.projectId !== "number") throw new Error("Invalid input");
        return val as { projectId: number };
      })
      .query(({ input }) => {
        return db.getProjectSessions(input.projectId);
      }),
    create: protectedProcedure
      .input((val: any) => {
        if (typeof val.projectId !== "number" || typeof val.title !== "string") throw new Error("Invalid input");
        return val as { projectId: number; title: string };
      })
      .mutation(({ ctx, input }) => {
        return db.createSession(input.projectId, ctx.user.id, input.title);
      }),
    updateGameCode: protectedProcedure
      .input((val: any) => {
        if (typeof val.sessionId !== "number" || typeof val.gameCode !== "string") throw new Error("Invalid input");
        return val as { sessionId: number; gameCode: string };
      })
      .mutation(({ input }) => {
        return db.updateSessionGameCode(input.sessionId, input.gameCode);
      }),
  }),

  chat: router({
    messages: protectedProcedure
      .input((val: any) => {
        if (typeof val.sessionId !== "number") throw new Error("Invalid input");
        return val as { sessionId: number };
      })
      .query(({ input }) => {
        return db.getSessionMessages(input.sessionId);
      }),
    sendMessage: protectedProcedure
      .input((val: any) => {
        if (typeof val.sessionId !== "number" || typeof val.content !== "string") throw new Error("Invalid input");
        return val as { sessionId: number; content: string };
      })
      .mutation(({ input }) => {
        return db.addMessage(input.sessionId, "user", input.content);
      }),
  }),

  apiSettings: router({
    get: protectedProcedure.query(({ ctx }) => {
      return db.getOrCreateApiSettings(ctx.user.id);
    }),
    update: protectedProcedure
      .input((val: any) => {
        return val as {
          openaiKey?: string | null;
          anthropicKey?: string | null;
          geminiKey?: string | null;
          selectedProvider?: "openai" | "anthropic" | "gemini";
          selectedModel?: string;
        };
      })
      .mutation(({ ctx, input }) => {
        return db.updateApiSettings(ctx.user.id, input as any);
      }),
  }),
});

export type AppRouter = typeof appRouter;
