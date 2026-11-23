import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => Category, (category) => category.skills, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  category!: Category;

  @Column('simple-array', { default: '' })
  images!: string[];

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner!: User;

  @ManyToMany(() => User)
  @JoinTable()
  favoritedByUsers!: User[];
}
