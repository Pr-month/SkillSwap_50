import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserGender, UserRole } from '../users.enums';
import { City } from '../../cities/entities/city.entity';
import { ManyToOne } from 'typeorm';
import { Request } from '../../request/entities/request.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'text', nullable: true })
  about!: string | null;

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null;

  // @Column({ type: 'varchar', length: 100, nullable: true })
  // city!: string | null;

  @ManyToOne(() => City, (city) => city.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  city!: City | null;

  @Column({ type: 'enum', enum: UserGender, nullable: true })
  gender!: UserGender | null;

  @Column({ type: 'varchar', nullable: true })
  avatar!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @OneToMany(() => Request, (request) => request.sender)
  sentRequests!: Request[];

  @OneToMany(() => Request, (request) => request.receiver)
  receivedRequests!: Request[];

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  refreshToken!: string | null;
}
