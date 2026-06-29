import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


@Entity({
  name: 'skills',
})
export class Skill {
  @ApiProperty({
    description: 'ID навыка (генерируется базой данных)',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Название навыка',
    example: 'Игра на акустической гитаре',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'Описание навыка',
    example:
      'Обучаю игре в технике фингерстайл. Это техника игры, при которой звук извлекается пальцами правой руки без использования медиатора. Она позволяет одновременно исполнять мелодию, аккомпанемент, басовую линию и даже перкуссионные элементы.',
  })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Категория, к которой относится навык',
  })
  @ManyToOne(() => Category, (category) => category.children)
  category: Category;

  @ApiProperty({
    description: 'Фото, иллюстрирующие процесс обучения навыку',
  })
  @Column('text', { array: true, default: [] })
  images: string[];

  @ApiProperty({
    description: 'Пользователь, создавший навык',
  })
  @ManyToOne(() => User, (user) => user.skills)
  owner: User;
}
