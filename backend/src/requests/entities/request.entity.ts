import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../requests.enums';
import { Skill } from '../../skills/entities/skill.entity';

@Entity({
  name: 'requests',
})
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  sender: User;

  @ManyToOne(() => User, (user) => user.id)
  receiver: User;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.NEWREQ })
  status: Status;

  @ManyToOne(() => Skill, (skill) => skill.id)
  offeredSkill: Skill;

  @ManyToOne(() => Skill, (skill) => skill.id)
  requestedSkill: Skill;

  @Column({ default: false })
  isRead: boolean;
}
