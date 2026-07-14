/**
 * VENEGA — Données Mockées Réalistes
 * Simule des utilisateurs et cercles burkinabè avec des montants en XOF.
 * À utiliser pour le développement frontend tant que le backend n'est pas connecté.
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
];

// ── Cercles ──

export const mockCircles: Circle[] = [
  {
    id: 'c1',
    name: 'Tontine Famille Ouédraogo',
    type: CircleType.HYBRID,
    tontineAmount: 10000,
    solidarityAmount: 2000,
    frequency: Frequency.MONTHLY,
    contributionMode: ContributionMode.CASH,
    beneficiariesPerTurn: 1,
    inviteCode: 'OUED2026',
    memberCount: 6,
    activeCycleId: 'cy1',
    createdAt: '2026-03-01T10:00:00Z',
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
    memberCount: 10,
    activeCycleId: 'cy2',
    createdAt: '2026-04-01T08:00:00Z',
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
    activeCycleId: 'cy3',
    createdAt: '2026-05-15T12:00:00Z',
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
    totalTurns: 10,
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
];

// ── Membres du cercle c1 ──

export const mockMemberships: Membership[] = [
  { userId: 'u1', circleId: 'c1', role: Role.PRESIDENT, turnOrder: 1, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-03-01T10:00:00Z', user: mockUsers[0]! },
  { userId: 'u2', circleId: 'c1', role: Role.TREASURER, turnOrder: 2, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-03-02T09:00:00Z', user: mockUsers[1]! },
  { userId: 'u3', circleId: 'c1', role: Role.MEMBER, turnOrder: 3, paymentStatus: PaymentStatus.PAID, joinedAt: '2026-03-03T11:00:00Z', user: mockUsers[2]! },
  { userId: 'u4', circleId: 'c1', role: Role.MEMBER, turnOrder: 4, paymentStatus: PaymentStatus.LATE, joinedAt: '2026-03-04T14:00:00Z', user: mockUsers[3]! },
  { userId: 'u5', circleId: 'c1', role: Role.SECRETARY, turnOrder: 5, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-03-05T08:00:00Z', user: mockUsers[4]! },
  { userId: 'u6', circleId: 'c1', role: Role.MEMBER, turnOrder: 6, paymentStatus: PaymentStatus.PENDING, joinedAt: '2026-03-10T16:00:00Z', user: mockUsers[5]! },
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
    status: AidRequestStatus.VOTING,
    votes: [
      { userId: 'u1', memberName: 'Aminata Ouédraogo', approved: true, votedAt: '2026-07-05T10:00:00Z' },
    ],
    requesterName: 'Rasmata Zongo',
    requesterAvatar: mockUsers[4]!.avatarUrl,
    createdAt: '2026-07-04T09:00:00Z',
  },
];

// ── Grand livre solidarité ──

export const mockLedgerEntries: LedgerEntry[] = [
  { id: 'l1', circleId: 'c1', type: 'CREDIT', amount: 12000, balanceAfter: 12000, description: 'Cotisations solidarité — Juin 2026', createdAt: '2026-06-01T12:00:00Z' },
  { id: 'l2', circleId: 'c1', type: 'DEBIT', amount: 50000, balanceAfter: -38000, description: 'Aide à Moussa Kaboré — Hospitalisation mère', relatedTransactionId: 't5', createdAt: '2026-06-21T09:00:00Z' },
  { id: 'l3', circleId: 'c1', type: 'CREDIT', amount: 12000, balanceAfter: -26000, description: 'Cotisations solidarité — Juillet 2026', createdAt: '2026-07-01T12:00:00Z' },
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
];

// ── Statistiques ──

export const mockCircleStats: CircleStats = {
  circleId: 'c1',
  totalCollected: 180000,
  totalPaidOut: 120000,
  solidarityFundBalance: -26000,
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
