import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Skill, (skill) => skill.category)
  skills!: Skill[];
}
