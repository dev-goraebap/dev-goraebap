import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AttachmentEntity } from './attachment.entity';
import { SeriesEntity } from './series.entity';
import { TagEntity } from './tag.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly title: string;

  @Column()
  readonly summary: string;

  @Column()
  readonly content: string;

  @Column()
  readonly contentHtml: string;

  @Column()
  readonly isPublished: boolean;

  @Column()
  readonly publishedAt: Date;

  @Column({ default: 0 })
  readonly viewCount: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => SeriesEntity, (e) => e.posts, {
    nullable: true,
  })
  readonly series: SeriesEntity;

  @ManyToMany(() => TagEntity, (tag) => tag.posts)
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

  // 쿼리빌더에서 수동으로 설정되는 속성
  readonly attachments?: AttachmentEntity[];

  get thumbnail() {
    if (!this.attachments || this.attachments.length === 0) {
      return null;
    }

    const attachment = this.attachments.find((a) => a.name === 'thumbnail');
    if (!attachment) {
      return null;
    }

    return {
      url: attachment.blob.getFilePath(),
      dominantColor: attachment.blob.metadata?.dominantColor,
    };
  }
}
