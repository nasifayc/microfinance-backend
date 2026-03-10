import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto } from './dto';

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
    const user = await this.prisma.staff.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerified) throw new ForbiddenException('Email Not verfied');

    const tokens = await this.signToken(user.id, user.email);
    return tokens;
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: userId,
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

    const hash = await argon.hash(refresh_token);

    await this.prisma.token.create({
      data: {
        type: 'REFRESH',
        tokenHash: hash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        staffId: userId,
      },
    });

    return { access_token, refresh_token };
  }
}
