import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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
  children: Category[];
}
