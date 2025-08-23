import { ConfigService } from '@nestjs/config';
import { NestMvcOptions } from 'nestjs-mvc-tools';
import {
  currentThemeHelper,
  formatDate,
  formatDateTime,
  formatDateTimeLocal,
  isCurrentRouteHelper,
  queryHelper,
} from './nest-mvc-view-helpers';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const nestMvcOptions: NestMvcOptions = {
  view: {
    cache: isProduction, // 프로덕션 환경에서 캐시 활성화
    helpers: {
      isCurrentRoute: isCurrentRouteHelper,
      currentTheme: currentThemeHelper,
      query: queryHelper,
    },
    globals: {
      formatDate: (date: Date | string | number) => formatDate(date, '/'),
      formatDateTime: (date: Date | string | number) => formatDateTime(date, '/'),
      formatDateTimeLocal: (date: Date | string | number) => formatDateTimeLocal(date)
    },
    globalsInjects: [ConfigService],
    globalsFactory: (configService: ConfigService) => ({
      cloudImageUrl: (url: string) => {
        // URL이 없을 경우 null 반환
        if (!url) return null;
        return `${configService.get('R2_DEV_ENDPOINT')}/${url}`;
      },
    }),
  },
  asset: {
    mode: isDevelopment ? 'development' : 'production',
  },
  debug: isDevelopment, // 개발환경에서 디버그 활성화
};
