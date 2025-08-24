import { Request } from 'express';
import { ViewHelperFactory } from 'nestjs-mvc-tools';

/**
 * 현재 라우트인지 확인하는 헬퍼
 * 템플릿에서 {{ isCurrentRoute('/home') }} 형태로 사용
 */
export const isCurrentRouteHelper: ViewHelperFactory = (req: Request) => {
  return (routePath: string, exact: boolean = false) => {
    if (!exact) {
      return req.originalUrl.startsWith(routePath) || req.path.startsWith(routePath);
    }
    return req.originalUrl === routePath || req.path === routePath;
  };
};

/**
 * 현재 태마를 제공하는 헬퍼
 * 템플릿에서 {{ currentTheme() }} 형태로 사용
 */
export const currentThemeHelper: ViewHelperFactory = (req: Request) => {
  return () => {
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
  };
};

export const originalUrlHelper: ViewHelperFactory = (req: Request) => {
  return (): string => {
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const host = req.get('host') || req.host;
    return `${protocol}://${host}${req.originalUrl}`;
  };
};

export const queryHelper: ViewHelperFactory = (req: Request) => {
  return (name: string, value?: any): any => {
    if (req.query[name]) {
      return req.query[name];
    }

    if (value !== undefined) {
      return value;
    }

    return '';
  };
};

// ------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------

export const formatDate = (date: Date | string | number, separator: '/' | '-' = '/') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}${separator}${month}${separator}${day}`;
};

export const formatDateTime = (date: Date | string | number, separator: '/' | '-' = '/') => {
  const d = new Date(date);
  const dateStr = formatDate(d, separator);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}`;
};

export const formatDateTimeLocal = (date: Date | string | number) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
