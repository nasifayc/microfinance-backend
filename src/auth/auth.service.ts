import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto';

import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    // private jwt: JwtService,
  ) {}

  login(dto: SignInDto) {
    return { message: 'Login successful', data: dto };
    // const staff = await this.prisma.staff.findUnique({
    //   where: { email: dto.email },
    //   include: {
    //     roles: {
    //       include: {
    //         role: true,
    //       },
    //     },
    //   },
    // });

    // if (!staff) {
    //   throw new UnauthorizedException('Invalid email or password');
    // }

    // const passwordValid = await argon.verify(staff.password, dto.password);

    // if (!passwordValid) {
    //   throw new UnauthorizedException('Invalid email or password');
    // }

    // if (staff.status !== 'ACTIVE') {
    //   throw new UnauthorizedException('Account is not active');
    // }

    // const tokens = await this.generateTokens(staff);
  }
}
