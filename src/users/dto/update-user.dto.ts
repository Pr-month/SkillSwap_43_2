import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  Length,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsString,
} from 'class-validator';
import { Gender } from '../../utils/types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @Length(2, 15)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  about: string;

  @IsDateString()
  birthdate: string;

  @IsString()
  city: string;

  @IsString()
  @IsIn(Object.values(Gender))
  gender: string;

  @IsString()
  avatar: string;

  @ArrayNotEmpty()
  wantToLearn: string[];
}
