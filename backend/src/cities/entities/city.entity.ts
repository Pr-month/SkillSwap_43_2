import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'cities' })
export class City {
  @ApiProperty({
    description: 'ID города',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Название города',
    example: 'Москва',
  })
  @Column({ unique: true })
  name!: string;
}
