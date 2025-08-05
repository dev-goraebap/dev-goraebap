import { Request } from 'express';
import { ViewHelperFactory } from 'nestjs-mvc-tools';

/**
 * 현재 라우트인지 확인하는 헬퍼
 * 템플릿에서 {{ isCurrentRoute('/home') }} 형태로 사용
 */
export const isCurrentRouteHelper: ViewHelperFactory = (req: Request) => {
  return {
    key: 'isCurrentRoute',
    fn: (routePath: string, exact: boolean = false) => {
      if (!exact) {
        return (
          req.originalUrl.startsWith(routePath) ||
          req.path.startsWith(routePath)
        );
      }
      return req.originalUrl === routePath || req.path === routePath;
    },
  };
};

/**
 * 현재 태마를 제공하는 헬퍼
 * 템플릿에서 {{ currentTheme() }} 형태로 사용
 */
export const currentThemeHelper: ViewHelperFactory = (req: Request) => {
  return {
    key: 'currentTheme',
    fn: () => {
      const defaultTheme = 'light';
      const cookies = req.cookies as Record<string, string>;
      if (!cookies) {
        console.debug('쿠키가 활성화되지 않았습니다.');
        return defaultTheme;
      }
      const theme = cookies?.theme;
      if (!theme) {
        return defaultTheme;
      }
      return theme;
    },
  };
};

export const queryHelper: ViewHelperFactory = (req: Request) => {
  return {
    key: 'query',
    fn: (name: string, value?: any): any => {
      if (req.query[name]) {
        return req.query[name];
      }

      if (value !== undefined) {
        return value;
      }

      return '';
    },
  };
};
