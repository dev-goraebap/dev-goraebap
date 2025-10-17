import z from 'zod';

const CursorSchema = z.object({
  id: z.coerce.number(),
  pubDate: z.coerce.date(),
});

export const GetCurationFeedSchema = z.object({
  orderType: z.enum(['traffic', 'latest']).default('traffic'),
  cursor: z.string().optional().transform((val) => {
    if (!val) return undefined;
    try {
      const parsed = JSON.parse(val);
      return CursorSchema.parse(parsed);
    } catch {
      return undefined;
    }
  }),
  sourceId: z.coerce.number().optional(),
  perPage: z.number().min(5).max(10).default(5),
});

export type GetCurationFeedDto = z.infer<typeof GetCurationFeedSchema>;