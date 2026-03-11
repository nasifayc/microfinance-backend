import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshTokenDto, SignInDto } from './dto';

import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: SignInDto) {
    const staff = await this.prisma.staff.findUnique({
      where: { email: dto.email },
    });

    if (!staff) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await argon.verify(staff.password, dto.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!staff.emailVerified) {
      throw new ForbiddenException('Email Not verfied');
    }

    if (staff.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account Is Not Active');
    }

    const tokens = await this.signToken(staff.id, staff.email);
    return {
      ...tokens,
      user: {
        id: staff.id,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
      },
    };
  }

  async signToken(staffId: string, email: string) {
    const payload = {
      sub: staffId,
      email,
    };

    const access_token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const tokenHash = await argon.hash(refresh_token);

    await this.prisma.token.create({
      data: {
        type: 'REFRESH',
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        staffId: staffId,
      },
    });

    return { access_token, refresh_token };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      email: string;
    }>(dto.refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    });

    const storedReferesh = await this.prisma.token.findFirst({
      where: {
        staffId: payload.sub,
        type: 'REFRESH',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!storedReferesh) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (storedReferesh.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const valid = await argon.verify(
      storedReferesh.tokenHash,
      dto.refreshToken,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.signToken(payload.sub, payload.email);
  }

  async logout(staffId: string) {
    await this.prisma.token.deleteMany({
      where: {
        staffId,
        type: 'REFRESH',
      },
    });

    return { message: 'Logged out successfully' };
  }
}
