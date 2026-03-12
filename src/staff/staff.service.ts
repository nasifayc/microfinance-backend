import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBranchExists(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch Not Found');
    }
  }

  private async ensureRoleExist(roleIds: string[]) {
    const uniqueIds = [...new Set(roleIds)];
    const count = await this.prisma.role.count({
      where: { id: { in: uniqueIds } },
    });

    if (count !== uniqueIds.length) {
      throw new NotFoundException('One or more roles not found');
    }
  }

  async create(dto: CreateStaffDto) {
    await this.ensureBranchExists(dto.branchId);
    if (dto.rolesIds?.length) {
      await this.ensureRoleExist(dto.rolesIds);
    }

    const hashedPassword = await argon.hash(dto.password);
    const created = await this.prisma.staff.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        branchId: dto.branchId,
        status: dto.status ?? 'INACTIVE',
      },
    });

    if (dto.rolesIds?.length) {
      await this.prisma.staffRole.createMany({
        data: [...new Set(dto.rolesIds)].map((roleId) => ({
          staffId: created.id,
          roleId,
        })),
        skipDuplicates: true,
      });
    }

    return this.findOne(created.id);
  }

  async findAll() {
    return await this.prisma.staff.findMany({
      include: {
        branch: true,
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

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        branch: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff Not Found');
    }

    return staff;
  }

  async update(id: string, dto: UpdateStaffDto) {
    await this.findOne(id);

    if (dto.branchId) {
      await this.ensureBranchExists(dto.branchId);
    }

    if (dto.rolesId) {
      await this.ensureRoleExist(dto.rolesId);
      await this.prisma.staffRole.deleteMany({ where: { staffId: id } });
      await this.prisma.staffRole.createMany({
        data: [...new Set(dto.rolesId)].map((roleId) => ({
          staffId: id,
          roleId,
        })),
        skipDuplicates: true,
      });
    }

    const updateData: Record<string, unknown> = { ...dto };
    delete updateData.rolesId;

    if (dto.password) {
      updateData.password = await argon.hash(dto.password);
    }

    await this.prisma.staff.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.staffRole.deleteMany({ where: { staffId: id } });
    await this.prisma.token.deleteMany({ where: { staffId: id } });
    await this.prisma.staff.delete({ where: { id } });

    return { message: 'Staff removed successfully' };
  }
}
