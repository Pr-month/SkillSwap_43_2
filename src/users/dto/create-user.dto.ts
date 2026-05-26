import {
  Length,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsString,
  ArrayNotEmpty,
} from 'class-validator';
import { Gender } from '../../utils/types';

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
  @IsIn(Object.values(Gender))
  gender: string;

  @IsString()
  avatar: string;

  @ArrayNotEmpty()
  wantToLearn: string[];
}
