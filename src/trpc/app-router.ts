import { initTRPC } from '@trpc/server'
import { z } from 'zod'

/**
 * Shape mirror of gr-backend `appRouter` for client-side typing only.
 * Keeps procedure paths aligned with the backend; this file is not imported at runtime (type-only).
 */
const t = initTRPC.create()

export const appRouter = t.router({
  discover: t.router({
    recommend: t.procedure
      .input(
        z.object({
          prompt: z.string(),
          events: z.array(z.unknown()),
        }),
      )
      .mutation(() => ({
        reply: '',
        suggestedEventId: null as string | null,
        locationQuery: null as string | null,
      })),
  }),
  events: t.router({
    list: t.procedure
      .input(
        z.object({
          cityId: z.string().optional(),
          categoryId: z.string().optional(),
        }),
      )
      .query(() => [] as unknown[]),
    byId: t.procedure.input(z.object({ id: z.string() })).query(() => null as unknown),
  }),
  feed: t.router({
    get: t.procedure
      .input(
        z.object({
          cursor: z.string().optional(),
          limit: z.number().optional(),
          cityId: z.string().optional(),
        }),
      )
      .query(() => ({ items: [] as unknown[] })),
  }),
  plan: t.router({
    upcoming: t.procedure.query(() => [] as unknown[]),
    past: t.procedure.query(() => [] as unknown[]),
  }),
  profile: t.router({
    get: t.procedure
      .input(z.object({ userId: z.string().optional() }))
      .query(() => null as unknown),
    update: t.procedure
      .input(
        z.object({
          displayName: z.string().optional(),
          username: z.string().optional(),
          bio: z.string().optional(),
          avatarUrl: z.string().url().optional(),
          userTasteCategories: z
            .array(
              z.object({
                label: z.string(),
                accent: z.enum(['true', 'false']),
              }),
            )
            .optional(),
        }),
      )
      .mutation(() => ({
        display_name: '',
        username: '',
        bio: '',
        avatar_url: '',
      })),
    checkUsername: t.procedure
      .input(z.object({ username: z.string() }))
      .mutation(() => ({ available: true })),
  }),
  stripe: t.router({
    createCheckout: t.procedure
      .input(
        z.object({
          priceId: z.string(),
          successUrl: z.string().url(),
          cancelUrl: z.string().url(),
        }),
      )
      .mutation(() => ({})),
  }),
})

export type AppRouter = typeof appRouter
