import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permissions } from 'src/auth/decorator';
import { AssignPermissionDto, CreatePermissionDto, CreateRoleDto } from './dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Permissions('roles.create')
  @Post()
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Permissions('roles.read')
  @Get()
  listRoles() {
    return this.rolesService.listRoles();
  }

  @Permissions('permissions.create')
  @Post('permissions')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rolesService.createPermisiion(dto);
  }

  @Permissions('permissions.read')
  @Get('permissions')
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Permissions('roles.assign-permissions')
  @Post(':roleId/permissions')
  assignPermissions(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.rolesService.assignPermissionToRole(roleId, dto);
  }
}
