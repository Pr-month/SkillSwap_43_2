import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
  ArrayNotEmpty,
} from 'class-validator';

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
}
