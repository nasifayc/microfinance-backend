import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  roleIds: string[];
}
