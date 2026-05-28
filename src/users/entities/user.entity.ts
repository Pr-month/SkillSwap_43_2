import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToMany,
  // ManyToMany,
} from 'typeorm';
import { Roles, Gender } from '../users.enums';
import { Skill } from '../../skills/entities/skill.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @Column()
  about: string;

  @Column()
  birthdate: string;

  @Column()
  city: string; // здесь теоретически должна быть связь один-к-одному с сущностью "город" из справочника городов

  @Column({ type: 'enum', enum: Gender })
  gender: string;

  @Column()
  avatar: string;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];

  @Column({ type: 'simple-array', default: [] })
  wantToLearn: string[];
  // @ManyToMany(() => Category, (category) => category.id) // в сущности Category использовать @JoinTable()
  // wantToLearn: Categories[];

  @ManyToMany(() => Skill, (skill) => skill.users) 
  favoriteSkills: Skill[];

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role: string;

  @Column({ nullable: true })
  refreshToken: string;
}
