import { ConfigService } from '@nestjs/config';
import { NestMvcOptions } from 'nestjs-mvc-tools';
import {
  currentThemeHelper,
  formatDate,
  formatDateTime,
  isCurrentRouteHelper,
  queryHelper,
} from './nest-mvc-view-helpers';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log(isDevelopment);
console.log(isProduction);

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
      formatDateTime: (date: Date | string | number) =>
        formatDateTime(date, '/'),
    },
    globalsInjects: [ConfigService],
    globalsFactory: (configService: ConfigService) => ({
      cloudImageUrl: (url: string) => {
        // URL이 없을 경우 기본 이미지 표시
        if (!url) return '/public/images/post-default.jpg';
        return `${configService.get('R2_DEV_ENDPOINT')}/${url}`;
      },
    }),
  },
  asset: {
    mode: isDevelopment ? 'development' : 'production',
  },
  debug: isDevelopment, // 개발환경에서 디버그 활성화
};
