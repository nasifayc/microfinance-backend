import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
  MinLength,
} from 'class-validator';
import { StaffStatus } from 'generated/prisma/enums';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  rolesId?: string[];
}
