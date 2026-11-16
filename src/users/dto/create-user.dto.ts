import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserGender } from '../../users/users.enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @IsString()
  @IsOptional()
  avatar?: string;
}
