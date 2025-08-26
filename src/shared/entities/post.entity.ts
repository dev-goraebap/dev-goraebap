import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BaseEntityWithAttachments } from './_/base-entity-with-attachments';
import { SeriesPostEntity } from './series-post.entity';
import { TagEntity } from './tag.entity';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntityWithAttachments {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true, length: 255 })
  readonly slug: string;

  @Column({ unique: true, length: 255 })
  readonly title: string;

  @Column({ length: 500 })
  readonly summary: string;

  @Column({ type: 'text' })
  readonly content: string;

  @Column({ default: false })
  readonly isPublished: boolean;

  @Column({ default: 'post', length: 20 })
  readonly postType: string; // post, changelog, news

  @Column({ default: 0 })
  readonly viewCount: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  readonly publishedAt: Date;

  @ManyToOne(() => UserEntity, (e) => e.posts, { onDelete: 'CASCADE' })
  readonly user: UserEntity;

  @OneToMany(() => SeriesPostEntity, (e) => e.post)
  readonly seriesPosts: SeriesPostEntity[];

  @OneToMany(() => CommentEntity, (e) => e.post)
  readonly comments: CommentEntity[];

  @ManyToMany(() => TagEntity, (e) => e.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  readonly tags: TagEntity[];
}
