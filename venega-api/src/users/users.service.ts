import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return this.sanitize(user);
  }

  async findByPhone(phoneNumber: string) {
    return this.prisma.user.findUnique({ where: { phoneNumber } });
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string; displayName?: string; avatarUrl?: string }) {
    return this.sanitize(
      await this.prisma.user.update({ where: { id }, data }),
    );
  }

  async submitKyc(id: string, data: { kycDocumentUrl: string; kycSelfieUrl: string; kycDocumentType: 'CNIB' | 'PASSPORT' }) {
    return this.sanitize(
      await this.prisma.user.update({
        where: { id },
        data: {
          kycDocumentUrl: data.kycDocumentUrl,
          kycSelfieUrl: data.kycSelfieUrl,
          kycDocumentType: data.kycDocumentType,
          kycStatus: 'PENDING',
        },
      }),
    );
  }

  async getMembershipSummary(id: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId: id, leftAt: null },
      include: {
        circle: {
          select: { id: true, name: true, type: true, tontineAmount: true, solidarityAmount: true, frequency: true },
        },
      },
    });
    return memberships;
  }

  private sanitize(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
