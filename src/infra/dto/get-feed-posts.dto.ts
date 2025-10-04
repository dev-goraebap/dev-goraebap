import z from 'zod';

const CursorSchema = z.object({
  viewCount: z.number(),
  publishedAt: z.coerce.date(),
});

export const GetFeedPostsSchema = z.object({
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
  tag: z.string().optional(),
  perPage: z.number().min(5).max(10).default(5),
  postType: z.enum(['post', 'patch-note']).optional().default('post')
});

export type GetFeedPostsDto = z.infer<typeof GetFeedPostsSchema>;