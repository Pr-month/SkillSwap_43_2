import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';

@Entity({
  name: 'categories',
})
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[] | Skill[];

  @ManyToMany(() => User, (user) => user.wantToLearn)
  @JoinTable()
  users: User[];
}
