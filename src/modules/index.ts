// 모든 도메인 모듈을 export
export { PostModule } from './post/post.module';
export { SeriesModule } from './series/series.module';
export { CommentModule } from './comment/comment.module';
export { TagModule } from './tag/tag.module';
export { BlockedIpModule } from './blocked-ip/blocked-ip.module';
export { MediaModule } from './media/media.module';
export { UserModule } from './user/user.module';

// 서비스들도 re-export
export * from './post/application/services/post.service';
export * from './post/application/services/post-query.service';
export * from './post/application/orchestrators/post-creation.service';
export * from './post/application/orchestrators/post-update.service';
export * from './post/application/orchestrators/post-deletion.service';

export * from './series/application/services/series.service';
export * from './series/application/services/series-query.service';

export * from './comment/application/services/comment.service';
export * from './comment/application/services/comment-query.service';
export * from './comment/application/orchestrators/comment-creation.service';
export * from './comment/application/orchestrators/comment-moderation.service';

export * from './tag/application/services/tag.service';
export * from './tag/application/services/tag-query.service';

export * from './blocked-ip/application/services/blocked-ip.service';
export * from './blocked-ip/application/services/blocked-ip-query.service';

export * from './media/application/services/media.service';
export * from './media/application/services/media-storage.service';
export * from './media/application/services/media-analysis.service';
export * from './media/application/services/media-cleanup.service';
export * from './media/application/orchestrators/media-upload.service';
export * from './media/application/dto/media-upload-response.dto';

export * from './user/application/services/user-auth.service';
export * from './user/application/services/user-query.service';
export * from './user/application/services/user-session.service';
export * from './user/application/guards/admin-auth.guard';