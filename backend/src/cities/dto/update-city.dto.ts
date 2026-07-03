import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCityDto {
  @ApiPropertyOptional({
    description: 'Название города',
    example: 'Казань',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}
