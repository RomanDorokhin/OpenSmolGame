import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { buildGamePrompt } from "@shared/interviewFlow";
import type { GameSpec } from "@shared/types";

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

  game: router({
    /**
     * Generate a game based on GameSpec using LLM
     */
    generateGame: publicProcedure
      .input(
        z.object({
          gameSpec: z.record(z.string(), z.string().optional()),
        })
      )
      .mutation(async ({ input }) => {
        const gameSpec = input.gameSpec as GameSpec;
        const prompt = buildGamePrompt(gameSpec);

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'You are an expert game developer. Generate complete, production-ready HTML5 games that work in iframes and on mobile devices.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          });

          const htmlCode = response.choices[0]?.message?.content || '';

          return {
            success: true,
            htmlCode,
            prompt,
            gameSpec,
          };
        } catch (error) {
          console.error('Game generation failed:', error);
          throw new Error('Failed to generate game. Please try again.');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
