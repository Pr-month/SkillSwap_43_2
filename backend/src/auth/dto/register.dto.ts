import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  ArrayNotEmpty,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Gender } from '../../users/users.enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 15)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ArrayNotEmpty()
  wantToLearn: string[];

  @IsDateString()
  birthdate: string;

  @IsString()
  about: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  avatar: string;
}
