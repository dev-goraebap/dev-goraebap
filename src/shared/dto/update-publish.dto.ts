import z from 'zod';

export const UpdatePublishSchema = z.object({
  isPublished: z.string().transform((val) => val === 'true'),
});

export type UpdatePublishDto = z.infer<typeof UpdatePublishSchema>;
