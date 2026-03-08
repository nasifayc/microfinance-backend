/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    create(data: { firstName: string; lastName: string; phone: string }) {
        return this.prisma.customer.create({data})
    }
}
