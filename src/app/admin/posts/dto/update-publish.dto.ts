import z from 'zod';

export const UpdatePostPublishSchema = z.object({
  isPublished: z.string().transform((val) => val === 'true'),
});

export type UpdatePostPublishDto = z.infer<typeof UpdatePostPublishSchema>;
