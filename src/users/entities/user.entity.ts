import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToMany,
  // ManyToMany,
} from 'typeorm';
import { Roles, Gender } from '../../utils/types';

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

  @Column('simple-array')
  skills: string[];
  // @OneToMany(() => Skill, (skill) => skill.owner)
  // skills: Skill[];

  @Column('simple-array')
  wantToLearn: string[];
  // @ManyToMany(() => Category, (category) => category.id) // в сущности Category использовать @JoinTable()
  // wantToLearn: Categories[];

  @Column('simple-array')
  favoriteSkills: string[];
  // @ManyToMany(() => Skill, (skill) => skill.id) // в сущности Skill использовать @JoinTable()
  // favoriteSkills: Skill[];

  @Column({ type: 'enum', enum: Roles, default: Roles.user })
  role: string;

  @Column()
  refreshToken: string;
}
