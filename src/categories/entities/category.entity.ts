import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';

/** Категория навыков; подкатегории ссылаются на родительскую запись. */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Название категории или подкатегории. */
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /** Родительская категория; у корневых категорий равна null. */
  @ManyToOne(() => Category, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  parent!: Category | null;

  @OneToMany(() => Skill, (skill) => skill.category)
  skills!: Skill[];
}
