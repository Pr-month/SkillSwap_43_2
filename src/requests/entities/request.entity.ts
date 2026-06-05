import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Status } from '../requests.enums';
import { Skill } from '../../skills/entities/skill.entity';

@Entity({
  name: 'requests',
})
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  sender: User;

  @Column()
  receiver: User;

  @Column({ type: 'enum', enum: Status })
  status: Status;

  @Column()
  offeredSkill: Skill;

  @Column()
  requestedSkill: Skill;

  @Column()
  isRead: boolean;
}
