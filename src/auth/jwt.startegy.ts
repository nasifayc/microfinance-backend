import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
};
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: payload.sub },
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

    if (!staff) {
      throw new UnauthorizedException('Invalid Token');
    }

    if (staff.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const permissions = staff.roles.flatMap((sr) =>
      sr.role.permissions.map((rp) => rp.permission.name),
    );
    return {
      userId: staff.id,
      email: staff.email,
      branchId: staff.branchId,
      permissions: [...new Set(permissions)],
    };
  }
}
