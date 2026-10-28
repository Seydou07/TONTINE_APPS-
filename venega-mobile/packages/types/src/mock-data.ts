/**
 * VENEGA — Données Mockées Réalistes
 * Simule des utilisateurs et cercles burkinabè avec des montants en XOF.
 * À utiliser pour le développement frontend tant que le backend n'est pas connecté.
 *
 * NOTE : Les données mockées incluent les nouvelles fonctionnalités :
 *   - Options de création de cercle (frais de gestion, dépôt, recalcul, etc.)
 *   - Demandes d'adhésion avec conditions, CNIB, frais de rachat
 *   - Score de fiabilité et événements de retard
 *   - Validation des cotisations par le groupe
 */

import {
  CircleType,
  Role,
  TransactionType,
  TransactionStatus,
  EventType,
  KycStatus,
  AidRequestStatus,
  Frequency,
  PaymentStatus,
  ContributionMode,
  MembershipRequestStatus,
  ReliabilityEventType,
  RefundRule,
  ReplacementRule,
  UnlockRule,
  PaymentMethod,
  ContributorVisibility,
  KycRequirement,
  DepartureRequestStatus,
} from './enums';
import type {
  User,
  Circle,
  Cycle,
  Membership,
  Transaction,
  SolidarityRequest,
  LedgerEntry,
  ChatMessage,
  AppNotification,
  CircleStats,
  AdminStats,
  MembershipRequest,
  ReliabilityEvent,
  TurnValidation,
  AidAppeal,
  AidContribution,
  PayoutRecord,
  DepartureRequest,
} from './models';

// ── Utilisateurs ──

export const mockUsers: User[] = [
  {
    id: 'u1',
    phoneNumber: '+22670123456',
    displayName: 'Aminata Ouédraogo',
    firstName: 'Aminata',
    lastName: 'Ouédraogo',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 92,
    createdAt: '2026-01-15T10:30:00Z',
  },
  {
    id: 'u2',
    phoneNumber: '+22671234567',
    displayName: 'Ibrahim Sawadogo',
    firstName: 'Ibrahim',
    lastName: 'Sawadogo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 88,
    createdAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'u3',
    phoneNumber: '+22672345678',
    displayName: 'Fatimata Compaoré',
    firstName: 'Fatimata',
    lastName: 'Compaoré',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 95,
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'u4',
    phoneNumber: '+22673456789',
    displayName: 'Moussa Kaboré',
    firstName: 'Moussa',
    lastName: 'Kaboré',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.PENDING,
    reputationScore: 75,
    createdAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'u5',
    phoneNumber: '+22674567890',
    displayName: 'Rasmata Zongo',
    firstName: 'Rasmata',
    lastName: 'Zongo',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 90,
    createdAt: '2026-02-15T08:30:00Z',
  },
  {
    id: 'u6',
    phoneNumber: '+22675678901',
    displayName: 'Adama Traoré',
    firstName: 'Adama',
    lastName: 'Traoré',
    kycStatus: KycStatus.NOT_SUBMITTED,
    reputationScore: 60,
    createdAt: '2026-03-01T16:00:00Z',
  },
  {
    id: 'u7',
    phoneNumber: '+22676789012',
    displayName: 'Boubacar Diallo',
    firstName: 'Boubacar',
    lastName: 'Diallo',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 85,
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'u8',
    phoneNumber: '+22677890123',
    displayName: 'Zenabo Ouédraogo',
    firstName: 'Zenabo',
    lastName: 'Ouédraogo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 94,
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    id: 'u9',
    phoneNumber: '+22678901234',
    displayName: 'Yacouba Kaboré',
    firstName: 'Yacouba',
    lastName: 'Kaboré',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 80,
    createdAt: '2026-03-20T09:00:00Z',
  },
  {
    id: 'u10',
    phoneNumber: '+22679012345',
    displayName: 'Salimata Sawadogo',
    firstName: 'Salimata',
    lastName: 'Sawadogo',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 88,
    createdAt: '2026-03-25T09:00:00Z',
  },
  {
    id: 'u11',
    phoneNumber: '+22670123457',
    displayName: 'Issa Compaoré',
    firstName: 'Issa',
    lastName: 'Compaoré',
    kycStatus: KycStatus.PENDING,
    reputationScore: 70,
    createdAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'u12',
    phoneNumber: '+22671234568',
    displayName: 'Awa Zongo',
    firstName: 'Awa',
    lastName: 'Zongo',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    kycStatus: KycStatus.VERIFIED,
    reputationScore: 91,
    createdAt: '2026-04-05T09:00:00Z',
  },
];

// ── Cercles ──

export const mockCircles: Circle[] = [
  {
    id: 'c1',
    name: 'Tontine Famille Ouédraogo',
    type: CircleType.TONTINE_ONLY,
    tontineAmount: 10000,
    solidarityAmount: 0,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 1,
    inviteCode: 'OUED2026',
    memberCount: 6,
    maxMembers: 10,
    activeCycleId: 'cy1',
    createdAt: '2026-03-01T10:00:00Z',
    activatedAt: '2026-03-01T10:00:00Z',
    // ── Règles paramétrables exécutées par le backend ──
    rules: {
      refundRule: RefundRule.IMMEDIATE,
      replacementRule: ReplacementRule.PAY_PAST_TURNS,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 3,
      reservePercent: 5,
      allowPublicContributions: false,
      minContribution: 500,
      goalAmount: undefined,
      goalItem: undefined,
      kycRequirement: KycRequirement.CNIB_SELFIE,
    },
    // ── Options configurées par le président ──
    managementFee: 500,
    depositRequired: true,
    recalculateOnLeave: true,
    exclusionThreshold: 3,
    nextPaymentRequired: true,
    conditions: 'Cotisation obligatoire le 1er de chaque mois avant 18h00. Tout retard de plus de 5 jours entraîne une pénalité. Après 3 retards, le membre peut être exclu. Le président valide les virements après vérification.',
    isActive: true,
  },
  {
    id: 'c2',
    name: 'Épargne Commerçants Rood Wooko',
    type: CircleType.TONTINE_ONLY,
    tontineAmount: 25000,
    solidarityAmount: 0,
    frequency: Frequency.WEEKLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 1,
    inviteCode: 'ROOD25K',
    memberCount: 7,
    maxMembers: 12,
    activeCycleId: 'cy2',
    createdAt: '2026-04-01T08:00:00Z',
    activatedAt: '2026-04-01T08:00:00Z',
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule: ReplacementRule.REDUCED_POT,
      unlockRule: UnlockRule.MAJORITY,
      approversRequired: 0,
      reservePercent: 0,
      allowPublicContributions: false,
      minContribution: undefined,
      goalAmount: undefined,
      goalItem: undefined,
      kycRequirement: KycRequirement.CNIB,
    },
    managementFee: 1000,
    depositRequired: false,
    recalculateOnLeave: false,
    exclusionThreshold: 2,
    nextPaymentRequired: false,
    conditions: 'Cotisation hebdomadaire de 25 000 F le samedi matin. Pas de retard toléré. Le bénéficiaire est désigné par ordre de passage.',
    isActive: true,
  },
  {
    id: 'c3',
    name: 'Mutuelle Santé Quartier Dassasgho',
    type: CircleType.SOLIDARITY_ONLY,
    tontineAmount: 0,
    solidarityAmount: 5000,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 0,
    inviteCode: 'DASSA26',
    memberCount: 15,
    maxMembers: 20,
    activeCycleId: 'cy3',
    createdAt: '2026-05-15T12:00:00Z',
    activatedAt: '2026-05-15T12:00:00Z',
    rules: {
      refundRule: RefundRule.IMMEDIATE,
      replacementRule: ReplacementRule.NONE,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 5,
      reservePercent: 10,
      allowPublicContributions: false,
      minContribution: 500,
      goalAmount: undefined,
      goalItem: undefined,
      kycRequirement: KycRequirement.CNIB,
    },
    managementFee: 0,
    depositRequired: false,
    recalculateOnLeave: false,
    exclusionThreshold: 3,
    nextPaymentRequired: false,
    conditions: 'Cotisation mensuelle de 5 000 F pour le fonds de solidarité. Les demandes d\'aide sont votées par les membres. Le président et le trésorier valident ensemble tout décaissement.',
    isActive: true,
  },
  {
    id: 'c4',
    name: 'Tontine Moto Naaba',
    type: CircleType.NATURE,
    tontineAmount: 50000,
    solidarityAmount: 0,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.NATURE,
    beneficiariesPerTurn: 1,
    inviteCode: 'MOTO26',
    memberCount: 12,
    maxMembers: 12,
    activeCycleId: 'cy4',
    createdAt: '2026-06-01T09:00:00Z',
    activatedAt: '2026-06-01T09:00:00Z',
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule: ReplacementRule.PAY_PAST_TURNS,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 0,
      reservePercent: 3,
      allowPublicContributions: false,
      minContribution: undefined,
      goalAmount: 600000,
      goalItem: 'Moto Bajaj Boxer 100cc',
      kycRequirement: KycRequirement.CNIB_SELFIE,
    },
    managementFee: 0,
    depositRequired: true,
    recalculateOnLeave: true,
    exclusionThreshold: 2,
    nextPaymentRequired: true,
    conditions: 'Cotisation mensuelle de 50 000 F jusqu\'à l\'achat de la moto. La moto est remise à tour de rôle à chaque membre. Aucun retrait possible après réception du bien.',
    isActive: true,
  },
  {
    id: 'c5',
    name: 'Appel à l\'aide — Mariam B.',
    type: CircleType.AID_APPEAL,
    tontineAmount: 0,
    solidarityAmount: 0,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 0,
    inviteCode: 'AID-MARIAM',
    memberCount: 0,
    createdAt: '2026-07-12T14:00:00Z',
    rules: {
      refundRule: RefundRule.IMMEDIATE,
      replacementRule: ReplacementRule.NONE,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 3,
      reservePercent: 0,
      allowPublicContributions: true,
      minContribution: 500,
      goalAmount: 500000,
      goalItem: undefined,
      kycRequirement: KycRequirement.NONE,
    },
    managementFee: 0,
    depositRequired: false,
    recalculateOnLeave: false,
    exclusionThreshold: 0,
    nextPaymentRequired: false,
    conditions: 'Contribution libre et ouverte à tous, sans adhésion. L\'argent est débloqué uniquement après approbation des 3 approbateurs désignés.',
    isActive: true,
  },
  {
    id: 'c6',
    name: 'Caisse d\'Entraide Wemtenga',
    type: CircleType.SOLIDARITY_ONLY,
    tontineAmount: 0,
    solidarityAmount: 1000,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 0,
    inviteCode: 'WEMTENGA26',
    memberCount: 5,
    maxMembers: 25,
    createdAt: '2026-04-01T09:00:00Z',
    activatedAt: '2026-04-01T09:00:00Z',
    rules: {
      refundRule: RefundRule.IMMEDIATE,
      replacementRule: ReplacementRule.NONE,
      unlockRule: UnlockRule.ALL_APPROVERS,
      approversRequired: 1,
      reservePercent: 0,
      allowPublicContributions: false,
      minContribution: 500,
      goalAmount: undefined,
      goalItem: undefined,
      kycRequirement: KycRequirement.NONE,
    },
    managementFee: 0,
    depositRequired: false,
    recalculateOnLeave: false,
    exclusionThreshold: 3,
    nextPaymentRequired: false,
    conditions: 'Cotisation mensuelle de 1 000 F pour la caisse d\'entraide du quartier. Le Président initie chaque demande d\'aide après avoir été contacté par le membre concerné ; les approbateurs désignés valident avant tout décaissement.',
    isActive: true,
  },
  {
    id: 'c7',
    name: 'Tontine Nongtaaba',
    type: CircleType.TONTINE_ONLY,
    tontineAmount: 15000,
    solidarityAmount: 0,
    frequency: Frequency.WEEKLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 1,
    inviteCode: 'NONG15K',
    memberCount: 12,
    maxMembers: 15,
    activeCycleId: 'cy7',
    createdAt: '2026-07-20T08:00:00Z',
    activatedAt: '2026-07-20T08:00:00Z',
    rules: {
      refundRule: RefundRule.AT_CYCLE_END,
      replacementRule: ReplacementRule.REDUCED_POT,
      unlockRule: UnlockRule.MAJORITY,
      approversRequired: 0,
      reservePercent: 0,
      allowPublicContributions: false,
      minContribution: undefined,
      goalAmount: undefined,
      goalItem: undefined,
      kycRequirement: KycRequirement.CNIB,
    },
    managementFee: 1000,
    depositRequired: false,
    recalculateOnLeave: false,
    exclusionThreshold: 2,
    nextPaymentRequired: false,
    conditions: 'Cotisation hebdomadaire de 15 000 F le samedi matin. Le bénéficiaire est désigné par ordre de passage.',
    isActive: true,
  },
];

// ── Cycles ──

export const mockCycles: Cycle[] = [
  {
    id: 'cy1',
    circleId: 'c1',
    startDate: '2026-06-01T00:00:00Z',
    isActive: true,
    currentTurn: 3,
    totalTurns: 6,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'cy2',
    circleId: 'c2',
    startDate: '2026-06-15T00:00:00Z',
    isActive: true,
    currentTurn: 4,
    totalTurns: 7,
    createdAt: '2026-06-15T00:00:00Z',
  },
  {
    id: 'cy3',
    circleId: 'c3',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    isActive: true,
    currentTurn: 0,
    totalTurns: 0,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cy4',
    circleId: 'c4',
    startDate: '2026-06-01T00:00:00Z',
    isActive: true,
    currentTurn: 2,
    totalTurns: 12,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'cy7',
    circleId: 'c7',
    startDate: '2026-08-01T00:00:00Z',
    isActive: true,
    currentTurn: 2,
    totalTurns: 12,
    createdAt: '2026-08-01T00:00:00Z',
  },
];

// ── Membres du cercle c1 (avec scores de fiabilité) ──

export const mockMemberships: Membership[] = [
  { userId: 'u1', circleId: 'c1', role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-03-01T10:00:00Z', user: mockUsers[0]!, reliabilityScore: 95, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u2', circleId: 'c1', role: Role.TREASURER, turnOrder: 2, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-03-02T09:00:00Z', user: mockUsers[1]!, reliabilityScore: 90, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u3', circleId: 'c1', role: Role.MEMBER, turnOrder: 3, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-03-03T11:00:00Z', user: mockUsers[2]!, reliabilityScore: 100, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u4', circleId: 'c1', role: Role.MEMBER, turnOrder: 4, paymentStatus: PaymentStatus.LATE, joinedAt: '2026-03-04T14:00:00Z', user: mockUsers[3]!, reliabilityScore: 70, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u5', circleId: 'c1', role: Role.SECRETARY, turnOrder: 5, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-03-05T08:00:00Z', user: mockUsers[4]!, reliabilityScore: 88, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u6', circleId: 'c1', role: Role.MEMBER, turnOrder: 6, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-03-10T16:00:00Z', user: mockUsers[5]!, reliabilityScore: 55, hasReceivedPayout: false, hasDeposit: false },

  // ── c2 : Épargne Commerçants Rood Wooko — Aminata (u1) est simple membre, tour 4 en cours ──
  { userId: 'u2', circleId: 'c2', role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-06-15T08:00:00Z', user: mockUsers[1]!, reliabilityScore: 96, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u3', circleId: 'c2', role: Role.TREASURER, turnOrder: 2, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-06-15T08:05:00Z', user: mockUsers[2]!, reliabilityScore: 98, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u5', circleId: 'c2', role: Role.MEMBER, turnOrder: 3, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-06-15T08:10:00Z', user: mockUsers[4]!, reliabilityScore: 90, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u1', circleId: 'c2', role: Role.MEMBER, turnOrder: 4, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-06-15T08:15:00Z', user: mockUsers[0]!, reliabilityScore: 92, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u4', circleId: 'c2', role: Role.MEMBER, turnOrder: 5, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-06-15T08:20:00Z', user: mockUsers[3]!, reliabilityScore: 75, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u6', circleId: 'c2', role: Role.MEMBER, turnOrder: 6, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-06-15T08:25:00Z', user: mockUsers[5]!, reliabilityScore: 60, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u7', circleId: 'c2', role: Role.MEMBER, turnOrder: 7, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-06-15T08:30:00Z', user: mockUsers[6]!, reliabilityScore: 85, hasReceivedPayout: false, hasDeposit: true },

  // ── c6 : Caisse d'Entraide Wemtenga — Aminata (u1) est fondatrice et Trésorière ──
  { userId: 'u1', circleId: 'c6', role: Role.TREASURER, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-04-01T09:00:00Z', user: mockUsers[0]!, reliabilityScore: 100, hasReceivedPayout: false, hasDeposit: false },
  { userId: 'u2', circleId: 'c6', role: Role.MEMBER, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-04-02T10:00:00Z', user: mockUsers[1]!, reliabilityScore: 92, hasReceivedPayout: false, hasDeposit: false },
  { userId: 'u3', circleId: 'c6', role: Role.MEMBER, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-04-03T11:00:00Z', user: mockUsers[2]!, reliabilityScore: 96, hasReceivedPayout: false, hasDeposit: false },
  { userId: 'u4', circleId: 'c6', role: Role.MEMBER, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-04-05T14:00:00Z', user: mockUsers[3]!, reliabilityScore: 80, hasReceivedPayout: false, hasDeposit: false },
  { userId: 'u5', circleId: 'c6', role: Role.MEMBER, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-04-08T08:00:00Z', user: mockUsers[4]!, reliabilityScore: 85, hasReceivedPayout: false, hasDeposit: false },

  // ── c7 : Tontine Nongtaaba — Aminata (u1) est fondatrice et Présidente, tour 2 en cours ──
  { userId: 'u1', circleId: 'c7', role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-07-20T08:00:00Z', user: mockUsers[0]!, reliabilityScore: 92, hasReceivedPayout: true, hasDeposit: true },
  { userId: 'u3', circleId: 'c7', role: Role.TREASURER, turnOrder: 2, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:05:00Z', user: mockUsers[2]!, reliabilityScore: 95, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u8', circleId: 'c7', role: Role.SECRETARY, turnOrder: 3, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:10:00Z', user: mockUsers[7]!, reliabilityScore: 94, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u2', circleId: 'c7', role: Role.MEMBER, turnOrder: 4, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:15:00Z', user: mockUsers[1]!, reliabilityScore: 88, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u5', circleId: 'c7', role: Role.MEMBER, turnOrder: 5, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:20:00Z', user: mockUsers[4]!, reliabilityScore: 90, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u9', circleId: 'c7', role: Role.MEMBER, turnOrder: 6, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:25:00Z', user: mockUsers[8]!, reliabilityScore: 80, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u4', circleId: 'c7', role: Role.MEMBER, turnOrder: 7, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:30:00Z', user: mockUsers[3]!, reliabilityScore: 75, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u10', circleId: 'c7', role: Role.MEMBER, turnOrder: 8, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:35:00Z', user: mockUsers[9]!, reliabilityScore: 88, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u6', circleId: 'c7', role: Role.MEMBER, turnOrder: 9, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:40:00Z', user: mockUsers[5]!, reliabilityScore: 60, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u11', circleId: 'c7', role: Role.MEMBER, turnOrder: 10, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:45:00Z', user: mockUsers[10]!, reliabilityScore: 70, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u7', circleId: 'c7', role: Role.MEMBER, turnOrder: 11, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:50:00Z', user: mockUsers[6]!, reliabilityScore: 85, hasReceivedPayout: false, hasDeposit: true },
  { userId: 'u12', circleId: 'c7', role: Role.MEMBER, turnOrder: 12, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-07-20T08:55:00Z', user: mockUsers[11]!, reliabilityScore: 91, hasReceivedPayout: false, hasDeposit: true },
];

// ── Demandes d'adhésion en attente ──

export const mockMembershipRequests: MembershipRequest[] = [
  {
    id: 'mr1',
    circleId: 'c1',
    userId: 'u7',
    status: MembershipRequestStatus.PENDING,
    fullName: 'Boubacar Diallo',
    phoneNumber: '+22676789012',
    depositNumber: '+22676789012',
    cnibFrontUrl: '/mock/cnib-front-boubacar.jpg',
    cnibBackUrl: '/mock/cnib-back-boubacar.jpg',
    selfieUrl: '/mock/selfie-boubacar.jpg',
    conditionsAccepted: true,
    joiningFee: 20000,
    depositAmount: 10000,
    paymentStatus: undefined,
    createdAt: '2026-07-10T14:00:00Z',
    user: mockUsers[6]!,
  },
];

// ── Demandes de départ (membre n'ayant pas encore reçu sa cagnotte) ──

/**
 * Moussa Kaboré (u4) veut quitter c1. Il a cotisé 2 tours (tours 1 et 2
 * déjà effectués dans cy1) mais n'a JAMAIS reçu de cagnotte (turn 4 en
 * cours, hasReceivedPayout: false). Ceux qui ont bénéficié de ses tours
 * (u1 et u2) lui remboursent main à main une cotisation chacun.
 */
export const mockDepartureRequests: DepartureRequest[] = [
  {
    id: 'dr1',
    circleId: 'c1',
    userId: 'u4',
    memberName: 'Moussa Kaboré',
    status: DepartureRequestStatus.PENDING,
    pastTurns: 2,
    totalRecover: 20000,
    reimbursements: [
      { turnNumber: 1, beneficiaryName: 'Aminata Ouédraogo', amount: 10000 },
      { turnNumber: 2, beneficiaryName: 'Ibrahim Sawadogo', amount: 10000 },
    ],
    createdAt: '2026-07-12T09:30:00Z',
  },
];

// ── Transactions récentes ──

export const mockTransactions: Transaction[] = [
  // ── Tour 1 — Juin 2026 (c1) ──
  { id: 't10', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0010', memberName: 'Aminata Ouédraogo', createdAt: '2026-06-01T09:00:00Z' },
  { id: 't11', userId: 'u2', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0011', memberName: 'Ibrahim Sawadogo', createdAt: '2026-06-01T09:15:00Z' },
  { id: 't12', userId: 'u3', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0012', memberName: 'Fatimata Compaoré', createdAt: '2026-06-01T10:00:00Z' },
  { id: 't13', userId: 'u4', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0013', memberName: 'Moussa Kaboré', createdAt: '2026-06-05T14:00:00Z' },
  { id: 't14', userId: 'u5', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0014', memberName: 'Rasmata Zongo', createdAt: '2026-06-02T08:30:00Z' },
  { id: 't15', userId: 'u6', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0015', memberName: 'Adama Traoré', createdAt: '2026-06-03T16:00:00Z' },
  { id: 't16', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0016', memberName: 'Aminata Ouédraogo', createdAt: '2026-06-01T09:05:00Z' },
  { id: 't17', userId: 'u2', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0017', memberName: 'Ibrahim Sawadogo', createdAt: '2026-06-01T09:20:00Z' },
  { id: 't18', userId: 'u3', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0018', memberName: 'Fatimata Compaoré', createdAt: '2026-06-01T10:05:00Z' },
  { id: 't19', userId: 'u4', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0019', memberName: 'Moussa Kaboré', createdAt: '2026-06-05T14:05:00Z' },
  { id: 't20', userId: 'u5', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0020', memberName: 'Rasmata Zongo', createdAt: '2026-06-02T08:35:00Z' },
  { id: 't21', userId: 'u6', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0021', memberName: 'Adama Traoré', createdAt: '2026-06-03T16:05:00Z' },
  { id: 't5', userId: 'u3', cycleId: 'cy1', circleId: 'c1', amount: 60000, type: TransactionType.PAYOUT, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0005', memberName: 'Fatimata Compaoré', createdAt: '2026-06-30T18:00:00Z' },
  // ── Tour 2 — Juillet 2026 (c1) ──
  { id: 't1', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0001', memberName: 'Aminata Ouédraogo', createdAt: '2026-07-01T10:00:00Z' },
  { id: 't2', userId: 'u2', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0002', memberName: 'Ibrahim Sawadogo', createdAt: '2026-07-01T10:30:00Z' },
  { id: 't3', userId: 'u3', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0003', memberName: 'Fatimata Compaoré', createdAt: '2026-07-01T11:00:00Z' },
  { id: 't6', userId: 'u4', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0006', memberName: 'Moussa Kaboré', createdAt: '2026-07-10T09:00:00Z' },
  { id: 't7', userId: 'u5', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.PENDING, memberName: 'Rasmata Zongo', createdAt: '2026-07-08T08:00:00Z' },
  { id: 't8', userId: 'u6', cycleId: 'cy1', circleId: 'c1', amount: 10000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.PENDING, memberName: 'Adama Traoré', createdAt: '2026-07-09T16:00:00Z' },
  { id: 't4', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0004', memberName: 'Aminata Ouédraogo', createdAt: '2026-07-01T10:05:00Z' },
  { id: 't22', userId: 'u2', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0022', memberName: 'Ibrahim Sawadogo', createdAt: '2026-07-01T10:35:00Z' },
  { id: 't23', userId: 'u3', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0023', memberName: 'Fatimata Compaoré', createdAt: '2026-07-01T11:05:00Z' },
  { id: 't24', userId: 'u4', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0024', memberName: 'Moussa Kaboré', createdAt: '2026-07-10T09:05:00Z' },
  { id: 't25', userId: 'u5', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.PENDING, memberName: 'Rasmata Zongo', createdAt: '2026-07-08T08:05:00Z' },
  { id: 't26', userId: 'u6', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.PENDING, memberName: 'Adama Traoré', createdAt: '2026-07-09T16:05:00Z' },
  // ── Historique personnel (u1) : paiements + réception de cagnotte ──
  { id: 't27', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 60000, type: TransactionType.PAYOUT, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0027', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-05-31T18:00:00Z' },
  { id: 't28', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 10500, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0028', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-06-01T09:00:00Z' },
  { id: 't29', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0029', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.WAVE, createdAt: '2026-06-01T09:05:00Z' },
  { id: 't30', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 10500, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0030', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-07-01T10:00:00Z' },
  { id: 't31', userId: 'u1', cycleId: 'cy1', circleId: 'c1', amount: 2000, type: TransactionType.SOLIDARITY_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-0031', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.MOOV_MONEY, createdAt: '2026-07-01T10:05:00Z' },

  // ── c2 : Épargne Commerçants Rood Wooko — cotisations d'Aminata (tours 1 à 3) ──
  { id: 'tc2-1', userId: 'u1', cycleId: 'cy2', circleId: 'c2', amount: 25000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1001', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-06-15T09:00:00Z' },
  { id: 'tc2-2', userId: 'u1', cycleId: 'cy2', circleId: 'c2', amount: 25000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1002', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-06-22T09:00:00Z' },
  { id: 'tc2-3', userId: 'u1', cycleId: 'cy2', circleId: 'c2', amount: 25000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1003', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-06-29T09:00:00Z' },
  // ── Cagnottes déjà versées aux tours 1 à 3 ──
  { id: 'tc2-4', userId: 'u2', cycleId: 'cy2', circleId: 'c2', amount: 175000, type: TransactionType.PAYOUT, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1004', memberName: 'Ibrahim Sawadogo', createdAt: '2026-06-16T18:00:00Z' },
  { id: 'tc2-5', userId: 'u3', cycleId: 'cy2', circleId: 'c2', amount: 175000, type: TransactionType.PAYOUT, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1005', memberName: 'Fatimata Compaoré', createdAt: '2026-06-23T18:00:00Z' },
  { id: 'tc2-6', userId: 'u5', cycleId: 'cy2', circleId: 'c2', amount: 175000, type: TransactionType.PAYOUT, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1006', memberName: 'Rasmata Zongo', createdAt: '2026-06-30T18:00:00Z' },
  // ── Tour 4 (en cours) : Ibrahim a payé, Adama est en attente ──
  { id: 'tc2-7', userId: 'u2', cycleId: 'cy2', circleId: 'c2', amount: 25000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-1007', memberName: 'Ibrahim Sawadogo', createdAt: '2026-08-10T16:20:00Z' },
  { id: 'tc2-8', userId: 'u6', cycleId: 'cy2', circleId: 'c2', amount: 25000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.PENDING, memberName: 'Adama Traoré', createdAt: '2026-08-11T16:00:00Z' },

  // ── c7 : Tontine Nongtaaba — tour 1 déjà versé à Aminata (u1), tour 2 en cours ──
  { id: 'tc7-1', userId: 'u1', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2001', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-08-02T08:00:00Z' },
  { id: 'tc7-2', userId: 'u3', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2002', memberName: 'Fatimata Compaoré', createdAt: '2026-08-02T08:05:00Z' },
  { id: 'tc7-3', userId: 'u8', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2003', memberName: 'Zenabo Ouédraogo', createdAt: '2026-08-02T08:10:00Z' },
  { id: 'tc7-4', userId: 'u2', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2004', memberName: 'Ibrahim Sawadogo', createdAt: '2026-08-02T08:15:00Z' },
  { id: 'tc7-5', userId: 'u5', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2005', memberName: 'Rasmata Zongo', createdAt: '2026-08-02T08:20:00Z' },
  { id: 'tc7-6', userId: 'u9', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2006', memberName: 'Yacouba Kaboré', createdAt: '2026-08-02T08:25:00Z' },
  { id: 'tc7-7', userId: 'u4', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2007', memberName: 'Moussa Kaboré', createdAt: '2026-08-02T08:30:00Z' },
  { id: 'tc7-8', userId: 'u10', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2008', memberName: 'Salimata Sawadogo', createdAt: '2026-08-02T08:35:00Z' },
  { id: 'tc7-9', userId: 'u6', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2009', memberName: 'Adama Traoré', createdAt: '2026-08-02T08:40:00Z' },
  { id: 'tc7-10', userId: 'u11', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2010', memberName: 'Issa Compaoré', createdAt: '2026-08-02T08:45:00Z' },
  { id: 'tc7-11', userId: 'u7', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2011', memberName: 'Boubacar Diallo', createdAt: '2026-08-02T08:50:00Z' },
  { id: 'tc7-12', userId: 'u12', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2012', memberName: 'Awa Zongo', createdAt: '2026-08-02T08:55:00Z' },
  { id: 'tc7-13', userId: 'u1', cycleId: 'cy7', circleId: 'c7', amount: 180000, type: TransactionType.PAYOUT, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2013', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-08-03T18:00:00Z' },
  { id: 'tc7-14', userId: 'u1', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2014', memberName: 'Aminata Ouédraogo', paymentMethod: PaymentMethod.ORANGE_MONEY, createdAt: '2026-08-09T08:00:00Z' },
  { id: 'tc7-15', userId: 'u3', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2015', memberName: 'Fatimata Compaoré', createdAt: '2026-08-09T08:05:00Z' },
  { id: 'tc7-16', userId: 'u8', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2016', memberName: 'Zenabo Ouédraogo', createdAt: '2026-08-09T08:10:00Z' },
  { id: 'tc7-17', userId: 'u2', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2017', memberName: 'Ibrahim Sawadogo', createdAt: '2026-08-09T08:15:00Z' },
  { id: 'tc7-18', userId: 'u5', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2018', memberName: 'Rasmata Zongo', createdAt: '2026-08-09T08:20:00Z' },
  { id: 'tc7-19', userId: 'u9', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2019', memberName: 'Yacouba Kaboré', createdAt: '2026-08-09T08:25:00Z' },
  { id: 'tc7-20', userId: 'u4', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.COMPLETED, providerReference: 'CP-2026-2020', memberName: 'Moussa Kaboré', createdAt: '2026-08-09T08:30:00Z' },
  { id: 'tc7-21', userId: 'u10', cycleId: 'cy7', circleId: 'c7', amount: 15000, type: TransactionType.TONTINE_CONTRIBUTION, status: TransactionStatus.PENDING, memberName: 'Salimata Sawadogo', createdAt: '2026-08-10T09:00:00Z' },
];

// ── Appel à l'aide public (c5) ──

export const mockAidAppeal: AidAppeal = {
  id: 'aa1',
  circleId: 'c5',
  beneficiaryName: 'Mariam Bationo',
  beneficiaryPhoto: mockUsers[2]!.avatarUrl,
  beneficiaryNumber: '+226 70 88 55 44',
  reason: 'Mariam, 34 ans, mère de 4 enfants, souffre d\'une maladie rénale et doit effectuer des dialyses à l\'étranger. Nous collectons 500 000 F CFA pour financer les premiers soins.',
  goalAmount: 500000,
  collectedAmount: 318500,
  contributorCount: 42,
  deadline: '2026-08-30T23:59:59Z',
  status: 'ACTIVE',
  createdAt: '2026-07-12T14:00:00Z',
};

const aidContributorNames = [
  'Awa Zongo', 'Ibrahim Sawadogo', 'Rasmata Nikiema', 'Boubacar Diallo',
  'Salif Traoré', 'Aminata Ouédraogo', 'Karim Ilboudo', 'Joséphine Kaboré',
  'Abdoulaye Compaoré', 'Nadège Somé', 'Moussa Kaboré', 'Estelle Bayala',
  'Tégawendé Ouoba', 'Clarisse Nana', 'Hamidou Rouamba', 'Mariam Kafando',
  'Simplice Ouedraogo', 'Bénédicte Zongo', 'Issa Sana', 'Aïcha Bamba',
  'Serge Dah', 'Colette Sawadogo', 'Roland Yameogo', 'Fatimata Compaoré',
  'Grégoire Bikienga', 'Hélène Kaboré', 'Alimata Konaté', 'Patrick Zabré',
];

// Génère ~40 contributions pour illustrer la pagination (même à des milliers)
export const mockAidContributions: AidContribution[] = Array.from({ length: 40 }, (_, i) => {
  const anon = i % 5 === 0;
  const operator = [
    PaymentMethod.ORANGE_MONEY,
    PaymentMethod.MOOV_MONEY,
    PaymentMethod.WAVE,
    PaymentMethod.MTN_MOBILE_MONEY,
  ][i % 4]!;
  return {
    id: `ac${i + 1}`,
    appealId: 'aa1',
    contributorName: anon ? undefined : aidContributorNames[i % aidContributorNames.length],
    visibility: anon ? ContributorVisibility.ANONYMOUS : ContributorVisibility.PUBLIC,
    amount: [500, 1000, 2000, 5000, 10000, 15000, 25000][i % 7]!,
    paymentMethod: operator,
    createdAt: new Date(Date.UTC(2026, 6, 13 + Math.floor(i / 4), 8 + (i % 9), (i * 7) % 60)).toISOString(),
  };
});

// ── Historique des versements initiés par le fondateur (c1) ──
// Seuls les versements PAYÉS apparaissent (date + heure). Un versement
// non payé ne laisse AUCUNE trace dans l'historique.

export const mockPayoutRecords: PayoutRecord[] = [
  {
    id: 'p1',
    circleId: 'c1',
    cycleId: 'cy1',
    beneficiaryName: 'Fatimata Compaoré',
    beneficiaryAvatar: mockUsers[2]!.avatarUrl,
    totalAmount: 63000,
    beneficiaryAmount: 60000,
    founderFees: 2700,
    venegaCommission: 300,
    operator: 'Orange Money',
    status: 'PAID',
    createdAt: '2026-05-31T18:00:00Z',
  },
  {
    id: 'p2',
    circleId: 'c1',
    cycleId: 'cy1',
    beneficiaryName: 'Ibrahim Sawadogo',
    beneficiaryAvatar: mockUsers[1]!.avatarUrl,
    totalAmount: 63000,
    beneficiaryAmount: 60000,
    founderFees: 2700,
    venegaCommission: 300,
    operator: 'Moov Money',
    status: 'PAID',
    createdAt: '2026-06-30T18:30:00Z',
  },
  {
    id: 'p3',
    circleId: 'c1',
    cycleId: 'cy1',
    beneficiaryName: 'Aminata Ouédraogo',
    beneficiaryAvatar: mockUsers[0]!.avatarUrl,
    totalAmount: 63000,
    beneficiaryAmount: 60000,
    founderFees: 2700,
    venegaCommission: 300,
    operator: 'Wave',
    status: 'PAID',
    createdAt: '2026-07-31T18:15:00Z',
  },
];

// ── Demandes d'aide solidarité ──

export const mockSolidarityRequests: SolidarityRequest[] = [
  {
    id: 'sr1',
    userId: 'u4',
    cycleId: 'cy1',
    circleId: 'c1',
    eventType: EventType.HOSPITALISATION,
    reason: 'Hospitalisation de ma mère au CHU Yalgado. Besoin urgent pour les frais médicaux et les médicaments.',
    amountRequested: 50000,
    amountApproved: 50000,
    status: AidRequestStatus.APPROVED,
    votes: [
      { userId: 'u1', memberName: 'Aminata Ouédraogo', approved: true, votedAt: '2026-06-20T10:00:00Z' },
      { userId: 'u2', memberName: 'Ibrahim Sawadogo', approved: true, votedAt: '2026-06-20T11:00:00Z' },
      { userId: 'u3', memberName: 'Fatimata Compaoré', approved: true, votedAt: '2026-06-20T14:00:00Z' },
      { userId: 'u5', memberName: 'Rasmata Zongo', approved: true, votedAt: '2026-06-20T15:00:00Z' },
    ],
    requesterName: 'Moussa Kaboré',
    requesterAvatar: mockUsers[3]!.avatarUrl,
    createdAt: '2026-06-19T18:00:00Z',
  },
  {
    id: 'sr2',
    userId: 'u5',
    cycleId: 'cy1',
    circleId: 'c1',
    eventType: EventType.MARIAGE,
    reason: 'Mariage de ma fille aînée, prévu le 15 août. Contribution pour la cérémonie.',
    amountRequested: 75000,
    amountApproved: 0,
    status: AidRequestStatus.APPROVED,
    votes: [],
    requesterName: 'Rasmata Zongo',
    requesterAvatar: mockUsers[4]!.avatarUrl,
    createdAt: '2026-07-04T09:00:00Z',
  },
  {
    id: 'sr3',
    userId: 'u4',
    cycleId: '',
    circleId: 'c6',
    eventType: EventType.DECES,
    reason: 'Décès de son père. La famille a besoin d\'aide pour les frais de deuil.',
    amountRequested: 3000,
    amountApproved: 3000,
    status: AidRequestStatus.DISBURSED,
    votes: [],
    requesterName: 'Moussa Kaboré',
    requesterAvatar: mockUsers[3]!.avatarUrl,
    createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'sr4',
    userId: 'u5',
    cycleId: '',
    circleId: 'c6',
    eventType: EventType.MALADIE,
    reason: 'Hospitalisée depuis 3 jours au CMA de Wemtenga. Besoin d\'aide pour les frais médicaux.',
    amountRequested: 4000,
    amountApproved: 0,
    status: AidRequestStatus.APPROVED,
    votes: [],
    requesterName: 'Rasmata Zongo',
    requesterAvatar: mockUsers[4]!.avatarUrl,
    createdAt: '2026-07-25T15:30:00Z',
  },
];

// ── Événements de fiabilité (historique des retards/paiements) ──

export const mockReliabilityEvents: ReliabilityEvent[] = [
  // Moussa (u4) — 1 retard au tour 1
  { id: 're1', userId: 'u4', circleId: 'c1', cycleId: 'cy1', type: ReliabilityEventType.LATE, scoreImpact: -1, description: 'Cotisation tour 1 payée le 5 juin (deadline: 1er juin)', createdAt: '2026-06-05T14:00:00Z' },
  // Moussa (u4) — 1 retard au tour 2
  { id: 're2', userId: 'u4', circleId: 'c1', cycleId: 'cy1', type: ReliabilityEventType.LATE, scoreImpact: -1, description: 'Cotisation tour 2 payée le 10 juillet (deadline: 1er juillet)', createdAt: '2026-07-10T09:00:00Z' },
  // Rasmata (u5) — en attente au tour 2
  { id: 're3', userId: 'u5', circleId: 'c1', cycleId: 'cy1', type: ReliabilityEventType.MISSED, scoreImpact: -3, description: 'Cotisation tour 2 non payée (deadline: 1er juillet)', createdAt: '2026-07-10T00:00:00Z' },
  // Adama (u6) — en attente au tour 2
  { id: 're4', userId: 'u6', circleId: 'c1', cycleId: 'cy1', type: ReliabilityEventType.MISSED, scoreImpact: -3, description: 'Cotisation tour 2 non payée (deadline: 1er juillet)', createdAt: '2026-07-10T00:00:00Z' },
  // Adama (u6) — paiement à temps au tour 1
  { id: 're5', userId: 'u6', circleId: 'c1', cycleId: 'cy1', type: ReliabilityEventType.ON_TIME, scoreImpact: 1, description: 'Cotisation tour 1 payée le 3 juin (deadline: 1er juin — retard de 2 jours, mais validé)', createdAt: '2026-06-03T16:00:00Z' },

  // ── c6 : Caisse d'Entraide Wemtenga ──
  // Moussa (u4) — 1 retard de cotisation
  { id: 're6', userId: 'u4', circleId: 'c6', cycleId: '', type: ReliabilityEventType.LATE, scoreImpact: -1, description: 'Cotisation de mai 2026 payée le 8 mai (deadline : 1er mai)', createdAt: '2026-05-08T10:00:00Z' },
];

// ── Validation du tour en cours (Tour 3 — c1) ──

export const mockTurnValidation: TurnValidation = {
  circleId: 'c1',
  cycleId: 'cy1',
  turnNumber: 3,
  totalRequired: 6,
  totalValidated: 4,
  nextPaymentDone: false,
  canRelease: false,
  poolAmount: 40000,
  managementFeeTotal: 3000,
  beneficiaryAmount: 60000,
};

// ── Grand livre solidarité ──
//
// Chaque cotisation d'un membre est tracée individuellement (CREDIT).
// Chaque déboursement validé porte un justificatif (DEBIT). Le solde
// courant est recalculé par le store à partir de ces entrées.

export const mockLedgerEntries: LedgerEntry[] = [
  // ── Juin 2026 — cotisations individuelles (6 × 2000 = 12 000 F) ──
  { id: 'l1', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: 2000, description: 'Cotisation solidarité — Juin 2026', userId: 'u1', memberName: 'Aminata Ouédraogo', relatedTransactionId: 't16', createdAt: '2026-06-01T09:05:00Z' },
  { id: 'l2', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: 4000, description: 'Cotisation solidarité — Juin 2026', userId: 'u2', memberName: 'Ibrahim Sawadogo', relatedTransactionId: 't17', createdAt: '2026-06-01T09:20:00Z' },
  { id: 'l3', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: 6000, description: 'Cotisation solidarité — Juin 2026', userId: 'u3', memberName: 'Fatimata Compaoré', relatedTransactionId: 't18', createdAt: '2026-06-01T10:05:00Z' },
  { id: 'l4', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: 8000, description: 'Cotisation solidarité — Juin 2026', userId: 'u4', memberName: 'Moussa Kaboré', relatedTransactionId: 't19', createdAt: '2026-06-05T14:05:00Z' },
  { id: 'l5', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: 10000, description: 'Cotisation solidarité — Juin 2026', userId: 'u5', memberName: 'Rasmata Zongo', relatedTransactionId: 't20', createdAt: '2026-06-02T08:35:00Z' },
  { id: 'l6', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: 12000, description: 'Cotisation solidarité — Juin 2026', userId: 'u6', memberName: 'Adama Traoré', relatedTransactionId: 't21', createdAt: '2026-06-03T16:05:00Z' },

  // ── Déboursement validé — aide Moussa (avec justificatif) ──
  { id: 'l7', circleId: 'c1', type: 'DEBIT', amount: 50000, balanceAfter: -38000, description: 'Aide versée — Moussa Kaboré', reason: 'Hospitalisation de sa mère au CHU Yalgado suite à son opération. Reçu remis à la famille.', userId: 'u4', memberName: 'Moussa Kaboré', proofUrl: '/mock/facture-hopital.jpg', relatedTransactionId: 't5', createdAt: '2026-06-21T09:00:00Z' },

  // ── Juillet 2026 — cotisations individuelles (4 payés sur 6) ──
  { id: 'l8', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: -36000, description: 'Cotisation solidarité — Juillet 2026', userId: 'u1', memberName: 'Aminata Ouédraogo', relatedTransactionId: 't4', createdAt: '2026-07-01T10:05:00Z' },
  { id: 'l9', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: -34000, description: 'Cotisation solidarité — Juillet 2026', userId: 'u2', memberName: 'Ibrahim Sawadogo', relatedTransactionId: 't22', createdAt: '2026-07-01T10:35:00Z' },
  { id: 'l10', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: -32000, description: 'Cotisation solidarité — Juillet 2026', userId: 'u3', memberName: 'Fatimata Compaoré', relatedTransactionId: 't23', createdAt: '2026-07-01T11:05:00Z' },
  { id: 'l11', circleId: 'c1', type: 'CREDIT', amount: 2000, balanceAfter: -30000, description: 'Cotisation solidarité — Juillet 2026', userId: 'u4', memberName: 'Moussa Kaboré', relatedTransactionId: 't24', createdAt: '2026-07-10T09:05:00Z' },

  // ── c6 : Caisse d'Entraide Wemtenga ──
  { id: 'l-c6-1', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 1000, description: 'Cotisation — Avril 2026', userId: 'u1', memberName: 'Aminata Ouédraogo', createdAt: '2026-04-01T09:10:00Z' },
  { id: 'l-c6-2', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 2000, description: 'Cotisation — Avril 2026', userId: 'u2', memberName: 'Ibrahim Sawadogo', createdAt: '2026-04-02T10:15:00Z' },
  { id: 'l-c6-3', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 3000, description: 'Cotisation — Avril 2026', userId: 'u3', memberName: 'Fatimata Compaoré', createdAt: '2026-04-03T11:20:00Z' },
  { id: 'l-c6-4', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 4000, description: 'Cotisation — Avril 2026', userId: 'u4', memberName: 'Moussa Kaboré', createdAt: '2026-04-05T14:10:00Z' },
  { id: 'l-c6-5', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 5000, description: 'Cotisation — Avril 2026', userId: 'u5', memberName: 'Rasmata Zongo', createdAt: '2026-04-08T08:20:00Z' },
  { id: 'l-c6-6', circleId: 'c6', type: 'DEBIT', amount: 3000, balanceAfter: 2000, description: 'Aide versée — Moussa Kaboré', reason: 'Achat de vivres pour la famille suite au décès de son père.', userId: 'u4', memberName: 'Moussa Kaboré', proofUrl: '/mock/recu-deuil-moussa.jpg', relatedTransactionId: 'sr3', createdAt: '2026-05-20T16:00:00Z' },
  { id: 'l-c6-7', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 3000, description: 'Cotisation — Mai 2026', userId: 'u1', memberName: 'Aminata Ouédraogo', createdAt: '2026-05-01T09:05:00Z' },
  { id: 'l-c6-8', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 4000, description: 'Cotisation — Mai 2026', userId: 'u2', memberName: 'Ibrahim Sawadogo', createdAt: '2026-05-01T10:05:00Z' },
  { id: 'l-c6-9', circleId: 'c6', type: 'CREDIT', amount: 1000, balanceAfter: 5000, description: 'Cotisation — Juin 2026', userId: 'u3', memberName: 'Fatimata Compaoré', createdAt: '2026-06-01T09:15:00Z' },
];

// ── Messages du chat cercle c1 ──

export const mockChatMessages: ChatMessage[] = [
  { id: 'm1', circleId: 'c1', userId: 'u1', senderName: 'Aminata Ouédraogo', senderAvatar: mockUsers[0]!.avatarUrl, content: 'Bonjour à tous ! N\'oubliez pas la cotisation de ce mois 🙏', createdAt: '2026-07-01T08:00:00Z' },
  { id: 'm2', circleId: 'c1', userId: 'u2', senderName: 'Ibrahim Sawadogo', senderAvatar: mockUsers[1]!.avatarUrl, content: 'Bien reçu ! Je fais le versement ce matin.', createdAt: '2026-07-01T08:15:00Z' },
  { id: 'm3', circleId: 'c1', userId: 'u3', senderName: 'Fatimata Compaoré', senderAvatar: mockUsers[2]!.avatarUrl, content: 'C\'est fait de mon côté aussi. On est une bonne équipe ! 💪', createdAt: '2026-07-01T09:00:00Z' },
  { id: 'm4', circleId: 'c1', userId: 'u4', senderName: 'Moussa Kaboré', senderAvatar: mockUsers[3]!.avatarUrl, content: 'Merci encore pour l\'aide pour ma mère. Elle va beaucoup mieux maintenant.', createdAt: '2026-07-02T14:00:00Z' },
  { id: 'm5', circleId: 'c1', userId: 'u5', senderName: 'Rasmata Zongo', senderAvatar: mockUsers[4]!.avatarUrl, content: 'Content pour ta mère Moussa ! La solidarité c\'est ça.', createdAt: '2026-07-02T14:30:00Z' },
];

// ── Notifications ──

export const mockNotifications: AppNotification[] = [
  { id: 'n1', userId: 'u1', title: 'Cotisation reçue', body: 'Ibrahim Sawadogo a payé sa cotisation de 10 000 F CFA', type: 'PAYMENT_RECEIVED', read: false, createdAt: '2026-07-01T10:30:00Z' },
  { id: 'n2', userId: 'u1', title: 'Rappel de cotisation', body: 'Moussa Kaboré est en retard de 3 jours sur sa cotisation', type: 'PAYMENT_REMINDER', read: false, createdAt: '2026-07-04T08:00:00Z' },
  { id: 'n3', userId: 'u1', title: 'Demande d\'aide', body: 'Rasmata Zongo a soumis une demande d\'aide pour un mariage', type: 'AID_REQUEST', actionUrl: '/circles/c1/solidarity', read: true, createdAt: '2026-07-04T09:00:00Z' },
  { id: 'n4', userId: 'u1', title: 'Nouvelle demande d\'adhésion', body: 'Boubacar Diallo demande à rejoindre Tontine Famille Ouédraogo', type: 'MEMBERSHIP_REQUEST', actionUrl: '/circles/c1', read: false, createdAt: '2026-07-10T14:00:00Z' },
  { id: 'n5', userId: 'u5', title: 'Avertissement retard', body: 'Vous avez 1 retard dans Tontine Famille Ouédraogo. Score actuel : 88/100', type: 'EXCLUSION_WARNING', read: false, createdAt: '2026-07-10T00:00:00Z' },
];

// ── Statistiques ──

export const mockCircleStats: CircleStats = {
  circleId: 'c1',
  totalCollected: 180000,
  totalPaidOut: 120000,
  solidarityFundBalance: -30000,
  memberCount: 6,
  paidCount: 3,
  lateCount: 1,
  pendingCount: 2,
  cycleProgress: 0.5,
};

export const mockAdminStats: AdminStats = {
  totalUsers: 247,
  totalCircles: 38,
  activeCircles: 31,
  totalVolumeXOF: 14750000,
  pendingKyc: 12,
  pendingAidRequests: 5,
  transactionsToday: 43,
};

/** Utilisateur actuellement connecté (pour la simulation) */
export const mockCurrentUser: User = mockUsers[0]!;
