/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { IsString, IsEmail, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { StaffStatus } from 'generated/prisma/enums';

export class CreateStaffDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  // incoming role ids when assigning multiple roles during creation
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  roleIds?: string[];
}
