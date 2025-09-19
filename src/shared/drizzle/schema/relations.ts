import { relations } from 'drizzle-orm/relations';
import { posts } from './posts.schema';
import { comments } from './comments.schema';
import { blobs } from './blobs.schema';
import { attachments } from './attachments.schema';
import { users } from './users.schema';
import { series } from './series.schema';
import { seriesPosts } from './series-posts.schema';
import { tags } from './tags.schema';
import { postTags } from './post-tags.schema';

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  comments: many(comments),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  seriesPosts: many(seriesPosts),
  postTags: many(postTags),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  blob: one(blobs, {
    fields: [attachments.blobId],
    references: [blobs.id],
  }),
}));

export const blobsRelations = relations(blobs, ({ many }) => ({
  attachments: many(attachments),
}));

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  series: many(series),
  tags: many(tags),
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
  user: one(users, {
    fields: [series.userId],
    references: [users.id],
  }),
  seriesPosts: many(seriesPosts),
}));

export const seriesPostsRelations = relations(seriesPosts, ({ one }) => ({
  series: one(series, {
    fields: [seriesPosts.seriesId],
    references: [series.id],
  }),
  post: one(posts, {
    fields: [seriesPosts.postId],
    references: [posts.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));
