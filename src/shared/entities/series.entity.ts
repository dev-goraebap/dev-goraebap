import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { AttachmentEntity } from './attachment.entity';
import { PostEntity } from './post.entity';

@Entity({ name: 'series' })
export class SeriesEntity {
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
  readonly attachments?: AttachmentEntity[];

  get thumbnail() {
    if (!this.attachments || this.attachments.length === 0) {
      return null;
    }

    const attachment = this.attachments.find((a) => a.name === 'thumbnail');
    console.log(attachment);
    if (!attachment) {
      return null;
    }

    return {
      url: attachment.blob.getFilePath(),
      dominantColor: attachment.blob.metadata?.dominantColor,
    };
  }
}
