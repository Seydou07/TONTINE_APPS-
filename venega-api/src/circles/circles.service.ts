import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { RequestJoinDto } from './dto/request-join.dto';

@Injectable()
export class CirclesService {
  constructor(private prisma: PrismaService) {}

  async create(creatorId: string, dto: CreateCircleDto) {
    // Générer un code d'invitation unique
    const inviteCode = this.generateInviteCode();

    // Créer le cercle + membership du président en une transaction
    return this.prisma.$transaction(async (tx) => {
      const circle = await tx.circle.create({
        data: {
          name: dto.name,
          type: dto.type,
          tontineAmount: dto.tontineAmount ?? 0,
          solidarityAmount: dto.solidarityAmount ?? 0,
          frequency: dto.frequency,
          contributionMode: dto.contributionMode ?? 'CASH',
          beneficiariesPerTurn: dto.beneficiariesPerTurn ?? 1,
          inviteCode,
          conditions: 'Conditions à configurer par le président.',
          maxMembers: 20,
          createdById: creatorId,
        },
      });

      // Le créateur devient automatiquement président
      await tx.membership.create({
        data: {
          userId: creatorId,
          circleId: circle.id,
          role: 'PRESIDENT',
          turnOrder: 1,
          paymentStatus: 'PAID',
        },
      });

      await tx.circle.update({
        where: { id: circle.id },
        data: { memberCount: 1 },
      });

      return circle;
    });
  }

  async findById(id: string, userId: string) {
    const circle = await this.prisma.circle.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { user: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true, reputationScore: true, kycStatus: true } } },
          orderBy: { turnOrder: 'asc' },
        },
        activeCycle: true,
      },
    });
    if (!circle) throw new NotFoundException('Cercle non trouvé');

    // Vérifier que l'utilisateur est membre
    const membership = circle.memberships.find((m) => m.userId === userId);
    if (!membership) throw new ForbiddenException('Vous n\'êtes pas membre de ce cercle');

    return circle;
  }

  async findByInviteCode(inviteCode: string) {
    const circle = await this.prisma.circle.findUnique({
      where: { inviteCode },
      select: { id: true, name: true, type: true, conditions: true, tontineAmount: true, solidarityAmount: true, memberCount: true, maxMembers: true, frequency: true },
    });
    if (!circle) throw new NotFoundException('Code d\'invitation invalide');
    return circle;
  }

  async getMyCircles(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId, leftAt: null },
      include: {
        circle: {
          include: {
            activeCycle: true,
            _count: { select: { memberships: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.circle,
      role: m.role,
      turnOrder: m.turnOrder,
      paymentStatus: m.paymentStatus,
      membershipCount: m.circle._count.memberships,
    }));
  }

  async requestJoin(userId: string, circleId: string, data: RequestJoinDto) {
    const circle = await this.prisma.circle.findUnique({ where: { id: circleId } });
    if (!circle) throw new NotFoundException('Cercle non trouvé');
    if (!circle.isActive) throw new BadRequestException('Ce cercle est inactif');
    if (!data.conditionsAccepted) throw new BadRequestException('Vous devez accepter les conditions');

    // Vérifier pas déjà membre
    const existingMembership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });
    if (existingMembership) throw new ConflictException('Vous êtes déjà membre de ce cercle');

    // Vérifier pas déjà en attente
    const existingRequest = await this.prisma.membershipRequest.findFirst({
      where: { userId, circleId, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (existingRequest) throw new ConflictException('Une demande est déjà en cours');

    // Calculer le frais de rachat (tours passés × cotisation)
    const activeCycle = await this.prisma.cycle.findFirst({
      where: { circleId, isActive: true },
    });
    const joiningFee = activeCycle
      ? activeCycle.currentTurn * (circle.tontineAmount + circle.solidarityAmount)
      : 0;

    const depositAmount = circle.depositRequired ? circle.tontineAmount : 0;

    return this.prisma.membershipRequest.create({
      data: {
        circleId,
        userId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        depositNumber: data.depositNumber,
        cnibFrontUrl: data.cnibFrontUrl,
        cnibBackUrl: data.cnibBackUrl,
        conditionsAccepted: data.conditionsAccepted,
        joiningFee,
        depositAmount,
      },
    });
  }

  async decideJoinRequest(requestId: string, presidentId: string, approved: boolean, rejectionReason?: string) {
    const request = await this.prisma.membershipRequest.findUnique({
      where: { id: requestId },
      include: { circle: true, user: true },
    });
    if (!request) throw new NotFoundException('Demande non trouvée');
    if (request.status !== 'PENDING') throw new BadRequestException('Demande déjà traitée');

    // Vérifier que le président est bien président du cercle
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId: presidentId, circleId: request.circleId } },
    });
    if (!membership || membership.role !== 'PRESIDENT') {
      throw new ForbiddenException('Seul le président peut valider les demandes');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.membershipRequest.update({
        where: { id: requestId },
        data: {
          status: approved ? 'APPROVED' : 'REJECTED',
          decidedAt: new Date(),
          decidedById: presidentId,
          rejectionReason: rejectionReason ?? null,
        },
      });

      if (approved) {
        // Créer le membership
        const maxOrder = await tx.membership.aggregate({
          where: { circleId: request.circleId },
          _max: { turnOrder: true },
        });

        await tx.membership.create({
          data: {
            userId: request.userId,
            circleId: request.circleId,
            turnOrder: (maxOrder._max.turnOrder ?? 0) + 1,
            paymentStatus: 'PENDING',
            hasDeposit: request.depositAmount > 0,
          },
        });

        await tx.circle.update({
          where: { id: request.circleId },
          data: { memberCount: { increment: 1 } },
        });
      }

      return { ok: true, approved };
    });
  }

  async getJoinRequests(circleId: string, userId: string) {
    // Vérifier que l'utilisateur est président
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });
    if (!membership || membership.role !== 'PRESIDENT') {
      throw new ForbiddenException('Seul le président peut voir les demandes');
    }

    return this.prisma.membershipRequest.findMany({
      where: { circleId },
      include: { user: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true, reputationScore: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}
