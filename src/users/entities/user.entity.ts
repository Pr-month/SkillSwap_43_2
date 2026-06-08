import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Roles, Gender } from '../users.enums';
import { Skill } from '../../skills/entities/skill.entity';
import { Category } from 'src/categories/entities/category.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  about: string;

  @Column()
  birthdate: string;

  @Column()
  city: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column()
  avatar: string;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];

  @ManyToMany(() => Category)
  wantToLearn?: Category[];

  @ManyToMany(() => Skill)
  favoriteSkills?: Skill[];

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role: Roles;

  @Exclude()
  @Column({ nullable: true })
  refreshToken: string | null;
}
