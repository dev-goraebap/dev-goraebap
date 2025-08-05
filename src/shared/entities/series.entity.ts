import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostEntity } from './post.entity';
import { AttachmentEntity } from './attachment.entity';

@Entity({ name: 'series' })
export class SeriesEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column()
  readonly name: string;

  @Column()
  readonly description: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => PostEntity, (e) => e.series)
  readonly posts: PostEntity[];

  // 쿼리빌더에서 수동으로 설정되는 속성
  attachments?: AttachmentEntity[];

  get thumbnailUrl(): string | null {
    if (!this.attachments || this.attachments.length === 0) {
      return null;
    }
    
    const thumbnail = this.attachments.find(a => a.name === 'thumbnail');
    return thumbnail ? `https://pub-25798484b9f84767985e92fba1219739.r2.dev/my-blog-files/${thumbnail.blob.getFilePath()}` : null;
  }
}
