import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAidRequestDto } from './dto/submit-aid-request.dto';

@Injectable()
export class SolidarityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Soumettre une demande d'aide solidarité.
   */
  async submitRequest(userId: string, dto: SubmitAidRequestDto) {
    // Vérifier que l'utilisateur est membre
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: dto.circleId } },
    });
    if (!membership) throw new ForbiddenException('Vous n\'êtes pas membre de ce cercle');

    return this.prisma.solidarityRequest.create({
      data: {
        userId,
        cycleId: dto.cycleId,
        circleId: dto.circleId,
        eventType: dto.eventType,
        reason: dto.reason,
        amountRequested: dto.amountRequested,
        proofUrl: dto.proofUrl,
        status: 'VOTING',
      },
    });
  }

  /**
   * Voter sur une demande d'aide.
   */
  async vote(requestId: string, userId: string, approved: boolean) {
    const request = await this.prisma.solidarityRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Demande non trouvée');
    if (request.status !== 'VOTING') throw new BadRequestException('Cette demande n\'est plus en vote');

    // Vérifier que l'utilisateur est membre
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: request.circleId } },
    });
    if (!membership) throw new ForbiddenException('Vous n\'êtes pas membre de ce cercle');

    // Vérifier qu'il n'a pas déjà voté
    const existingVote = await this.prisma.aidVote.findUnique({
      where: { requestId_userId: { requestId, userId } },
    });
    if (existingVote) throw new BadRequestException('Vous avez déjà voté');

    const vote = await this.prisma.aidVote.create({
      data: { requestId, userId, approved },
    });

    // Compter les votes
    const votes = await this.prisma.aidVote.findMany({ where: { requestId } });
    const totalMembers = await this.prisma.membership.count({
      where: { circleId: request.circleId, leftAt: null },
    });

    const approvals = votes.filter((v) => v.approved).length;
    const rejections = votes.filter((v) => !v.approved).length;
    const majority = Math.ceil(totalMembers / 2);

    // Si majorité atteinte, on décide
    if (approvals >= majority) {
      await this.prisma.solidarityRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', amountApproved: request.amountRequested },
      });
    } else if (rejections >= majority) {
      await this.prisma.solidarityRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });
    }

    return { vote, approvals, rejections, totalMembers };
  }

  /**
   * Obtenir les demandes d'un cercle.
   */
  async getCircleRequests(circleId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });
    if (!membership) throw new ForbiddenException('Vous n\'êtes pas membre de ce cercle');

    return this.prisma.solidarityRequest.findMany({
      where: { circleId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, displayName: true, avatarUrl: true } },
        votes: {
          include: { user: { select: { id: true, firstName: true, lastName: true, displayName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Décaisser les fonds solidarité (après approbation).
   */
  async disburse(requestId: string, presidentId: string) {
    const request = await this.prisma.solidarityRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Demande non trouvée');
    if (request.status !== 'APPROVED') throw new BadRequestException('Demande non approuvée');

    // Vérifier que c'est le président
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId: presidentId, circleId: request.circleId } },
    });
    if (!membership || membership.role !== 'PRESIDENT') {
      throw new ForbiddenException('Seul le président peut décaisser');
    }

    return this.prisma.$transaction(async (tx) => {
      // Créer la transaction de décaissement
      await tx.transaction.create({
        data: {
          userId: request.userId,
          cycleId: request.cycleId,
          circleId: request.circleId,
          amount: request.amountApproved,
          type: 'ASSISTANCE_DISBURSEMENT',
          status: 'PENDING',
        },
      });

      // Mettre à jour le statut
      await tx.solidarityRequest.update({
        where: { id: requestId },
        data: { status: 'DISBURSED' },
      });

      // Enregistrer au ledger
      await tx.ledgerEntry.create({
        data: {
          circleId: request.circleId,
          type: 'DEBIT',
          amount: request.amountApproved,
          balanceAfter: 0, // TODO: calculer le vrai solde
          description: `Aide à ${request.eventType} — ${request.reason.slice(0, 50)}`,
        },
      });

      return { ok: true, disbursement: 'INITIATED' };
    });
  }
}
