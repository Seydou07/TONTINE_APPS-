/**
 * VENEGA — Seed de la base de données
 * Crée des données de test réalistes pour le développement.
 * Usage: npx prisma db seed
 */

import { PrismaClient, CircleType, Role, TransactionType, TransactionStatus, EventType, KycStatus, Frequency, PaymentStatus, ContributionMode, MembershipRequestStatus, ReliabilityEventType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Venega database...');

  // ── Utilisateurs ──
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        phoneNumber: '+22670123456',
        passwordHash,
        displayName: 'Aminata Ouédraogo',
        firstName: 'Aminata',
        lastName: 'Ouédraogo',
        kycStatus: KycStatus.VERIFIED,
        reputationScore: 92,
        isPhoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+22671234567',
        passwordHash,
        displayName: 'Ibrahim Sawadogo',
        firstName: 'Ibrahim',
        lastName: 'Sawadogo',
        kycStatus: KycStatus.VERIFIED,
        reputationScore: 88,
        isPhoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+22672345678',
        passwordHash,
        displayName: 'Fatimata Compaoré',
        firstName: 'Fatimata',
        lastName: 'Compaoré',
        kycStatus: KycStatus.VERIFIED,
        reputationScore: 95,
        isPhoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+22673456789',
        passwordHash,
        displayName: 'Moussa Kaboré',
        firstName: 'Moussa',
        lastName: 'Kaboré',
        kycStatus: KycStatus.PENDING,
        reputationScore: 75,
        isPhoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+22674567890',
        passwordHash,
        displayName: 'Rasmata Zongo',
        firstName: 'Rasmata',
        lastName: 'Zongo',
        kycStatus: KycStatus.VERIFIED,
        reputationScore: 90,
        isPhoneVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+22675678901',
        passwordHash,
        displayName: 'Adama Traoré',
        firstName: 'Adama',
        lastName: 'Traoré',
        kycStatus: KycStatus.NOT_SUBMITTED,
        reputationScore: 60,
      },
    }),
  ]);

  console.log(`✅ ${users.length} utilisateurs créés`);

  // ── Cercle HYBRID ──
  const circle1 = await prisma.circle.create({
    data: {
      name: 'Tontine Famille Ouédraogo',
      type: CircleType.HYBRID,
      tontineAmount: 10000,
      solidarityAmount: 2000,
      frequency: Frequency.MONTHLY,
      contributionMode: ContributionMode.CASH,
      beneficiariesPerTurn: 1,
      inviteCode: 'OUED2026',
      conditions: 'Cotisation obligatoire le 1er de chaque mois avant 18h00. Tout retard de plus de 5 jours entraîne une pénalité. Après 3 retards, le membre peut être exclu.',
      managementFee: 500,
      depositRequired: true,
      recalculateOnLeave: true,
      exclusionThreshold: 3,
      nextPaymentRequired: true,
      memberCount: 6,
      maxMembers: 10,
      createdById: users[0]!.id,
    },
  });

  // ── Cycle pour le cercle 1 ──
  const cycle1 = await prisma.cycle.create({
    data: {
      circleId: circle1.id,
      startDate: new Date('2026-06-01'),
      isActive: true,
      currentTurn: 3,
      totalTurns: 6,
    },
  });

  // Lier le cycle actif au cercle
  await prisma.circle.update({
    where: { id: circle1.id },
    data: { activeCycleId: cycle1.id },
  });

  // ── Membres du cercle 1 ──
  const memberships = await Promise.all([
    prisma.membership.create({
      data: { userId: users[0]!.id, circleId: circle1.id, role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID, reliabilityScore: 100 },
    }),
    prisma.membership.create({
      data: { userId: users[1]!.id, circleId: circle1.id, role: Role.TREASURER, turnOrder: 2, paymentStatus: PaymentStatus.PAID, reliabilityScore: 95 },
    }),
    prisma.membership.create({
      data: { userId: users[2]!.id, circleId: circle1.id, role: Role.MEMBER, turnOrder: 3, paymentStatus: PaymentStatus.PAID, reliabilityScore: 100, hasReceivedPayout: true },
    }),
    prisma.membership.create({
      data: { userId: users[3]!.id, circleId: circle1.id, role: Role.MEMBER, turnOrder: 4, paymentStatus: PaymentStatus.LATE, reliabilityScore: 75 },
    }),
    prisma.membership.create({
      data: { userId: users[4]!.id, circleId: circle1.id, role: Role.SECRETARY, turnOrder: 5, paymentStatus: PaymentStatus.PENDING, reliabilityScore: 90 },
    }),
    prisma.membership.create({
      data: { userId: users[5]!.id, circleId: circle1.id, role: Role.MEMBER, turnOrder: 6, paymentStatus: PaymentStatus.PENDING, reliabilityScore: 60 },
    }),
  ]);

  console.log(`✅ ${memberships.length} membres créés`);

  // ── Transactions ──
  const transactions = [];

  // Tour 1 — Juin 2026
  for (let i = 0; i < 6; i++) {
    transactions.push(
      await prisma.transaction.create({
        data: {
          userId: users[i]!.id,
          cycleId: cycle1.id,
          circleId: circle1.id,
          amount: 10000,
          type: TransactionType.TONTINE_CONTRIBUTION,
          status: TransactionStatus.COMPLETED,
          providerReference: `CP-2026-${String(i + 10).padStart(4, '0')}`,
        },
      }),
      await prisma.transaction.create({
        data: {
          userId: users[i]!.id,
          cycleId: cycle1.id,
          circleId: circle1.id,
          amount: 2000,
          type: TransactionType.SOLIDARITY_CONTRIBUTION,
          status: TransactionStatus.COMPLETED,
          providerReference: `CP-2026-${String(i + 16).padStart(4, '0')}`,
        },
      }),
    );
  }

  // Payout tour 1 → Fatimata
  transactions.push(
    await prisma.transaction.create({
      data: {
        userId: users[2]!.id,
        cycleId: cycle1.id,
        circleId: circle1.id,
        amount: 60000,
        type: TransactionType.PAYOUT,
        status: TransactionStatus.COMPLETED,
        providerReference: 'CP-2026-0005',
      },
    }),
  );

  console.log(`✅ ${transactions.length} transactions créées`);

  // ── Demande d'aide ──
  const solidarityRequest = await prisma.solidarityRequest.create({
    data: {
      userId: users[3]!.id,
      cycleId: cycle1.id,
      circleId: circle1.id,
      eventType: EventType.HOSPITALISATION,
      reason: 'Hospitalisation de ma mère au CHU Yalgado.',
      amountRequested: 50000,
      amountApproved: 50000,
      status: 'APPROVED',
    },
  });

  // Votes
  await prisma.aidVote.createMany({
    data: [
      { requestId: solidarityRequest.id, userId: users[0]!.id, approved: true },
      { requestId: solidarityRequest.id, userId: users[1]!.id, approved: true },
      { requestId: solidarityRequest.id, userId: users[2]!.id, approved: true },
      { requestId: solidarityRequest.id, userId: users[4]!.id, approved: true },
    ],
  });

  console.log('✅ Demande d\'aide créée avec votes');

  // ── Ledger entries ──
  await prisma.ledgerEntry.createMany({
    data: [
      { circleId: circle1.id, type: 'CREDIT', amount: 12000, balanceAfter: 12000, description: 'Cotisations solidarité — Juin 2026' },
      { circleId: circle1.id, type: 'DEBIT', amount: 50000, balanceAfter: -38000, description: 'Aide à Moussa Kaboré — Hospitalisation', relatedTransactionId: transactions[transactions.length - 1]!.id },
      { circleId: circle1.id, type: 'CREDIT', amount: 12000, balanceAfter: -26000, description: 'Cotisations solidarité — Juillet 2026' },
    ],
  });

  // ── Événements de fiabilité ──
  await prisma.reliabilityEvent.createMany({
    data: [
      { userId: users[0]!.id, circleId: circle1.id, cycleId: cycle1.id, type: ReliabilityEventType.ON_TIME, scoreImpact: 0, description: 'Cotisation Juin payée à temps' },
      { userId: users[3]!.id, circleId: circle1.id, cycleId: cycle1.id, type: ReliabilityEventType.LATE, scoreImpact: -1, description: 'Cotisation Juillet payée en retard (5 jours)' },
    ],
  });

  // ── Messages chat ──
  await prisma.chatMessage.createMany({
    data: [
      { circleId: circle1.id, userId: users[0]!.id, content: 'Bonjour à tous ! N\'oubliez pas la cotisation de ce mois.' },
      { circleId: circle1.id, userId: users[1]!.id, content: 'Bien reçu ! Je fais le versement ce matin.' },
      { circleId: circle1.id, userId: users[3]!.id, content: 'Merci encore pour l\'aide pour ma mère. Elle va beaucoup mieux.' },
    ],
  });

  console.log('✅ Ledger, fiabilité et chat créés');

  // ── Cercle TONTINE_ONLY ──
  const circle2 = await prisma.circle.create({
    data: {
      name: 'Épargne Commerçants Rood Wooko',
      type: CircleType.TONTINE_ONLY,
      tontineAmount: 25000,
      solidarityAmount: 0,
      frequency: Frequency.WEEKLY,
      inviteCode: 'ROOD25K',
      conditions: 'Cotisation hebdomadaire de 25 000 F le samedi matin.',
      managementFee: 1000,
      memberCount: 4,
      maxMembers: 10,
      createdById: users[1]!.id,
    },
  });

  await prisma.membership.createMany({
    data: [
      { userId: users[1]!.id, circleId: circle2.id, role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID },
      { userId: users[0]!.id, circleId: circle2.id, role: Role.MEMBER, turnOrder: 2, paymentStatus: PaymentStatus.PAID },
      { userId: users[2]!.id, circleId: circle2.id, role: Role.MEMBER, turnOrder: 3, paymentStatus: PaymentStatus.PAID },
      { userId: users[4]!.id, circleId: circle2.id, role: Role.MEMBER, turnOrder: 4, paymentStatus: PaymentStatus.PENDING },
    ],
  });

  console.log('✅ Cercle 2 créé');

  // ── Cercle SOLIDARITY_ONLY ──
  const circle3 = await prisma.circle.create({
    data: {
      name: 'Mutuelle Santé Quartier Dassasgho',
      type: CircleType.SOLIDARITY_ONLY,
      tontineAmount: 0,
      solidarityAmount: 5000,
      frequency: Frequency.MONTHLY,
      inviteCode: 'DASSA26',
      conditions: 'Cotisation mensuelle de 5 000 F pour la caisse de solidarité santé.',
      memberCount: 3,
      maxMembers: 20,
      createdById: users[2]!.id,
    },
  });

  await prisma.membership.createMany({
    data: [
      { userId: users[2]!.id, circleId: circle3.id, role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID },
      { userId: users[0]!.id, circleId: circle3.id, role: Role.MEMBER, turnOrder: 2, paymentStatus: PaymentStatus.PAID },
      { userId: users[4]!.id, circleId: circle3.id, role: Role.MEMBER, turnOrder: 3, paymentStatus: PaymentStatus.PAID },
    ],
  });

  console.log('✅ Cercle 3 créé');

  console.log('\n🎉 Seed terminé avec succès !');
  console.log('   6 utilisateurs, 3 cercles, transactions de test prêtes.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
