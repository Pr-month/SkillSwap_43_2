import {
  Length,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsString,
  ArrayNotEmpty,
  IsEnum,
} from 'class-validator';
import { Gender } from '../users.enums';

export class CreateUserDto {
  @IsString()
  @Length(2, 15)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  about: string;

  @IsDateString()
  birthdate: string;

  @IsString()
  city: string;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  avatar: string;

  @ArrayNotEmpty()
  wantToLearn: string[];
}
