import z from 'zod';

export const GetFeedPostsSchema = z.object({
  orderType: z.string().default('traffic'),
  cursor: z.string().optional(),
  tag: z.string().optional(),
  perPage: z.number().min(5).max(10).default(5),
});

export type GetFeedPostsDto = z.infer<typeof GetFeedPostsSchema>;