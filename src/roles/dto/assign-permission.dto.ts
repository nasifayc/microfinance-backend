import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  permissionIds: string[];
}
