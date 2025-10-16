import { z } from 'zod';

// 소스 생성 스키마
export const CreateSourceSchema = z.object({
  source: z.object({
    name: z.string().min(1, '소스 이름을 입력해주세요').max(100),
    url: z.string().url('올바른 URL을 입력해주세요'),
    fetchIntervalMinutes: z.coerce.number().int().min(10, '최소 10분 이상이어야 합니다').default(60),
    isActiveYn: z.enum(['Y', 'N']).default('Y'),
  })
});

export type CreateSourceDto = z.infer<typeof CreateSourceSchema>['source'];

// 소스 수정 스키마
export const UpdateSourceSchema = z.object({
  source: z.object({
    name: z.string().min(1, '소스 이름을 입력해주세요').max(100).optional(),
    url: z.string().url('올바른 URL을 입력해주세요').optional(),
    fetchIntervalMinutes: z.coerce.number().int().min(10, '최소 10분 이상이어야 합니다').optional(),
    isActiveYn: z.enum(['Y', 'N']).optional(),
  })
});

export type UpdateSourceDto = z.infer<typeof UpdateSourceSchema>['source'];
