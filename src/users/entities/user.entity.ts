import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import {
  Length,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsJWT,
  IsUUID,
} from 'class-validator';
import { Roles, Gender } from '../../utils/types';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column()
  @Length(2, 15)
  name: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({
    unique: true,
  })
  password: string;

  @Column()
  about: string;

  @Column()
  @IsDateString()
  birthdate: string;

  @Column()
  city: string; // здесь теоретически должна быть связь один-к-одному с сущностью "город" из справочника городов

  @Column()
  @IsIn(Object.values(Gender))
  gender: string;

  @Column()
  avatar: string;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Skill[];

  @ManyToMany(() => Category, (category) => category.id) // в сущности Category использовать @JoinTable()
  wantToLearn: Categories[];

  @ManyToMany(() => Skill, (skill) => skill.id) // в сущности Skill использовать @JoinTable()
  favoriteSkills: Skill[];

  @Column()
  @IsIn(Object.values(Roles))
  role: string;

  @Column()
  @IsJWT()
  refreshToken: string;
}
