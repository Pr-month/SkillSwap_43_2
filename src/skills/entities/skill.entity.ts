import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({
  name: 'skills',
})
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Category, (category) => category.children);
  category: Category;

  @Column('text', { array: true, default: [] })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills)
  owner: User;

  @ManyToMany(() => User, (user) => user.favoriteSkills)
  @JoinTable()
  users: Users[];
}
