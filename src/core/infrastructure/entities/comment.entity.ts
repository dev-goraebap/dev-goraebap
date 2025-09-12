import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true, length: 255 })
  readonly requestId: string;

  @Column()
  readonly avatarNo: number;

  @Column({ length: 50 })
  readonly nickname: string;

  @Column({ length: 1000 })
  readonly comment: string;

  @CreateDateColumn()
  readonly createdAt: Date;

  @DeleteDateColumn()
  readonly deletedAt: Date;

  @ManyToOne(() => PostEntity, (e) => e.comments, { onDelete: 'CASCADE' })
  readonly post: PostEntity;
}
