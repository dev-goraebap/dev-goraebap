import z from 'zod';

export const CreateBlockedIpSchema = z.object({
  ipAddress: z.string(),
  reason: z.string().optional(),
});

export type CreateBlockedIpDto = z.infer<typeof CreateBlockedIpSchema>;
