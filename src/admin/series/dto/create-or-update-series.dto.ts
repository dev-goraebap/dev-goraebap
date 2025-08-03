import { z } from 'zod';

export const CreateOrUpdateSeriesSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  description: z.string().optional(),
});

export type CreateOrUpdateSeriesDto = z.infer<
  typeof CreateOrUpdateSeriesSchema
>;
