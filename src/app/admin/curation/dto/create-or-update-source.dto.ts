import { z } from 'zod';

// 소스 생성 스키마
export const CreateSourceSchema = z.object({
  name: z.string().min(1, '소스 이름을 입력해주세요').max(100),
  url: z.string().url('올바른 URL을 입력해주세요'),
  isActiveYn: z.enum(['Y', 'N']).default('Y'),
});

export type CreateSourceDto = z.infer<typeof CreateSourceSchema>;

// 소스 수정 스키마
export const UpdateSourceSchema = z.object({
  name: z.string().min(1, '소스 이름을 입력해주세요').max(100).optional(),
  url: z.string().url('올바른 URL을 입력해주세요').optional(),
  isActiveYn: z.enum(['Y', 'N']).optional(),
});

export type UpdateSourceDto = z.infer<typeof UpdateSourceSchema>;
