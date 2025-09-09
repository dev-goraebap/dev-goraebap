import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PostEntity } from 'src/modules/post';
import { SeriesEntity } from './series.entity';

@Entity({ name: 'series_posts' })
@Index(['series', 'post'], { unique: true })
export class SeriesPostEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ default: 999 })
  readonly order: number;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => SeriesEntity, (series) => series.seriesPosts, {
    onDelete: 'CASCADE',
  })
  readonly series: SeriesEntity;

  @ManyToOne(() => PostEntity, (post) => post.seriesPosts, {
    onDelete: 'CASCADE',
  })
  readonly post: PostEntity;
}
