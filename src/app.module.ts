import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StaffModule } from './staff/staff.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [PrismaModule, AuthModule, StaffModule, RolesModule],
})
export class AppModule {}
