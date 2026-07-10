import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({
    description: 'Название города',
    example: 'Казань',
  })
  @IsString()
  @MinLength(1)
  name!: string;
}
