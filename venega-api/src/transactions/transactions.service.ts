import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayContributionDto } from './dto/pay-contribution.dto';
import { InitiatePayoutDto } from './dto/initiate-payout.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Enregistrer le paiement d'un membre via CinetPay.
   * Le membre paie → CinetPay confirme → on crée la transaction.
   */
  async recordContribution(userId: string, dto: PayContributionDto) {
    // Vérifier que l'utilisateur est membre du cercle
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: dto.circleId } },
    });
    if (!membership) throw new ForbiddenException('Vous n\'êtes pas membre de ce cercle');

    const circle = await this.prisma.circle.findUnique({ where: { id: dto.circleId } });
    if (!circle) throw new NotFoundException('Cercle non trouvé');

    // Vérifier le montant
    const expectedTontine = circle.tontineAmount;
    const expectedSolidarity = circle.solidarityAmount;

    // Créer les transactions (cotisation tontine + solidarité si applicable)
    const transactions = [];

    if (expectedTontine > 0 && dto.amount >= expectedTontine) {
      const tx = await this.prisma.transaction.create({
        data: {
          userId,
          cycleId: dto.cycleId,
          circleId: dto.circleId,
          amount: expectedTontine,
          type: 'TONTINE_CONTRIBUTION',
          status: 'PENDING',
          provider: dto.provider,
        },
      });
      transactions.push(tx);
    }

    if (expectedSolidarity > 0 && dto.amount >= expectedTontine + expectedSolidarity) {
      const tx = await this.prisma.transaction.create({
        data: {
          userId,
          cycleId: dto.cycleId,
          circleId: dto.circleId,
          amount: expectedSolidarity,
          type: 'SOLIDARITY_CONTRIBUTION',
          status: 'PENDING',
          provider: dto.provider,
        },
      });
      transactions.push(tx);
    }

    // TODO: Initier le paiement CinetPay
    // const cinetPayResponse = await this.cinetPay.initPayment({ ... });

    return { transactions, message: 'Paiement initié — en attente de confirmation CinetPay' };
  }

  /**
   * Callback CinetPay quand un paiement est confirmé.
   */
  async confirmPayment(transactionId: string, providerReference: string) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          providerReference,
        },
      });

      // Mettre à jour le statut de paiement du membre
      await tx.membership.update({
        where: { userId_circleId: { userId: transaction.userId, circleId: transaction.circleId } },
        data: { paymentStatus: 'PAID' },
      });

      // Enregistrer l'événement de fiabilité
      await tx.reliabilityEvent.create({
        data: {
          userId: transaction.userId,
          circleId: transaction.circleId,
          cycleId: transaction.cycleId,
          type: 'ON_TIME',
          scoreImpact: 0,
          description: `Cotisation ${transaction.type} payée à temps`,
        },
      });

      return transaction;
    });
  }

  /**
   * Déclencher le virement au bénéficiaire (Cash-Out).
   * Le président valide → CinetPay envoie directement au bénéficiaire.
   */
  async initiatePayout(presidentId: string, dto: InitiatePayoutDto) {
    // Vérifier que c'est le président
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId: presidentId, circleId: dto.circleId } },
    });
    if (!membership || membership.role !== 'PRESIDENT') {
      throw new ForbiddenException('Seul le président peut valider les virements');
    }

    // Vérifier que toutes les cotisations sont réunies
    const turnValidation = await this.prisma.turnValidation.findFirst({
      where: {
        circleId: dto.circleId,
        cycleId: dto.cycleId,
        turnNumber: { not: 0 },
      },
      orderBy: { turnNumber: 'desc' },
    });

    if (turnValidation && !turnValidation.canRelease) {
      throw new BadRequestException('Toutes les cotisations ne sont pas encore réunies');
    }

    // Créer la transaction de virement
    const payout = await this.prisma.transaction.create({
      data: {
        userId: dto.beneficiaryUserId,
        cycleId: dto.cycleId,
        circleId: dto.circleId,
        amount: dto.amount,
        type: 'PAYOUT',
        status: 'PENDING',
      },
    });

    // TODO: Déclencher le cash-out CinetPay
    // const cinetPayResponse = await this.cinetPay.initCashOut({ ... });

    return { payout, message: 'Virement initié — en attente de traitement CinetPay' };
  }

  /**
   * Historique des transactions d'un cercle
   */
  async getCircleTransactions(circleId: string, userId: string, filters?: { type?: string; status?: string; cycleId?: string }) {
    // Vérifier que l'utilisateur est membre
    const membership = await this.prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });
    if (!membership) throw new ForbiddenException('Vous n\'êtes pas membre de ce cercle');

    const where: any = { circleId };
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.cycleId) where.cycleId = filters.cycleId;

    return this.prisma.transaction.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Mes transactions (tous cercles confondus)
   */
  async getMyTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        circle: { select: { id: true, name: true } },
        cycle: { select: { id: true, currentTurn: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
