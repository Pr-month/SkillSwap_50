import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'simple-array', nullable: true })
  skillImages!: string[] | null;

  @Column({ type: 'int' })
  authorId!: number;

  @Column({ type: 'simple-array', nullable: true })
  likedByUserIds!: string[] | null;
}
