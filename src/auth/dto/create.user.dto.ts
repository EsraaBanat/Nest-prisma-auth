import { Role } from '@prisma/client';
import { IsNotEmpty, IsEmail, Length, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @Length(3, 20, { message: 'Passowrd has to be at between 3 and 20 chars' })
  public password: string;
  @IsOptional()
  public firstName?: string;
  @IsOptional()
  public lastName?: string;
  @IsOptional()
  public phone?: string;
  @IsOptional()
  public role?: Role;
}
