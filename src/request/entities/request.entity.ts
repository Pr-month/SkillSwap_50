import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { RequestStatus } from '../request.enums';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.receivedRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  sender!: User;

  @ManyToOne(() => User, (user) => user.sentRequests, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  receiver!: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'CASCADE' })
  offeredSkill!: Skill;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'CASCADE' })
  requestedSkill!: Skill;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;
}
