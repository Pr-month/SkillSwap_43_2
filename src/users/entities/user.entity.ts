import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // OneToMany,
  // ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Roles, Gender } from '../users.enums';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

  @Column({ nullable: true })
  about!: string;

  @Column({ nullable: true })
  birthdate!: string;

  @Column({ nullable: true })
  city!: string; // здесь теоретически должна быть связь один-к-одному с сущностью "город" из справочника городов

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender!: string;

  @Column({ nullable: true })
  avatar!: string;

  @Column({ type: 'simple-array', nullable: true })
  skills!: string[];
  // @OneToMany(() => Skill, (skill) => skill.owner)
  // skills: Skill[];

  @Column({ type: 'simple-array', nullable: true })
  wantToLearn!: string[];
  // @ManyToMany(() => Category, (category) => category.id) // в сущности Category использовать @JoinTable()
  // wantToLearn: Categories[];

  @Column({ type: 'simple-array', nullable: true })
  favoriteSkills!: string[];
  // @ManyToMany(() => Skill, (skill) => skill.id) // в сущности Skill использовать @JoinTable()
  // favoriteSkills: Skill[];

  @Column({ type: 'enum', enum: Roles, default: Roles.USER })
  role!: string;

  @Exclude()
  @Column({ nullable: true })
  refreshToken!: string | null;
}
