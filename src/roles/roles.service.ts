import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssignPermissionDto,
  AssignRoleDto,
  CreatePermissionDto,
  CreateRoleDto,
} from './dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(dto: CreateRoleDto) {
    return await this.prisma.role.create({ data: dto });
  }

  async listRoles() {
    return await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createPermisiion(dto: CreatePermissionDto) {
    return await this.prisma.permission.create({ data: dto });
  }

  async listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async assignPermissionToRole(roleId: string, dto: AssignPermissionDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const uniquePermissionIds = [...new Set(dto.permissionIds)];
    const permissionCount = await this.prisma.permission.count({
      where: { id: { in: uniquePermissionIds } },
    });

    if (permissionCount !== uniquePermissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    await this.prisma.rolePermission.deleteMany({ where: { roleId } });
    await this.prisma.rolePermission.createMany({
      data: uniquePermissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
      skipDuplicates: true,
    });

    return await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async assignRoleToStaff(staffId: string, dto: AssignRoleDto) {
    const staff = await this.prisma.staff.findUnique({
      where: {
        id: staffId,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    const uniqueRoleIds = [...new Set(dto.roleIds)];
    const roleCount = await this.prisma.role.count({
      where: { id: { in: uniqueRoleIds } },
    });

    if (roleCount !== uniqueRoleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    await this.prisma.staffRole.deleteMany({ where: { staffId } });
    await this.prisma.staffRole.createMany({
      data: uniqueRoleIds.map((roleId) => ({ staffId, roleId })),
      skipDuplicates: true,
    });

    return await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
