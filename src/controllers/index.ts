// Web Controllers (SSR) - 일반 사용자용
export { FeedController } from './web/feed.controller';
export { PostController } from './web/post.controller';
export { SeriesController } from './web/series.controller';
export { SitemapController } from './web/sitemap.controller';
export { PatchNotesController } from './web/patch-notes.controller';

// Web Controllers (SSR) - 관리자용
export { AdminController } from './web/admin/admin.controller';
export { AdminPostsController } from './web/admin/posts.controller';

// API Controllers - 관리자용
export { AdminPostsApiController } from './api/v1/admin/posts.controller';
export { AdminMediaApiController } from './api/v1/admin/file-upload.controller';