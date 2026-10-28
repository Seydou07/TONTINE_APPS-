/**
 * DONNÉES DE DÉMONSTRATION — à supprimer quand les endpoints admin existeront.
 *
 * Tous les noms sont fictifs, les numéros commencent par « +226 00 » (inexistants)
 * et les numéros de CNIB sont des spécimens. Aucune donnée personnelle réelle.
 *
 * Cet état vit uniquement en mémoire dans le navigateur : il est réinitialisé
 * à chaque rechargement de la page. Seules les couches `src/features/<x>/api.ts`
 * doivent l'importer.
 */

import type { AdminUser, KycStatus } from '@/features/users/types';
import type { KycSubmission, KycDecision } from '@/features/kyc/types';
import type { Fundraiser, FundraiserCategory, FundraiserStatus } from '@/features/fundraisers/types';
import type { FraudAlert } from '@/features/alerts/types';
import type { AdminCircle, CircleKind, CircleMember, Frequency, MemberRole } from '@/features/circles/types';
import type { AuditEntry } from '@/features/audit/types';

/** Date de référence des données de démo. */
const NOW = new Date();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

const FIRST_NAMES = [
  'Aïcha', 'Boukary', 'Clarisse', 'Daouda', 'Estelle', 'Fousseni', 'Germaine', 'Hamidou',
  'Inès', 'Jacques', 'Kadidia', 'Lassané', 'Mariam', 'Noufou', 'Odile', 'Pascal',
  'Rakiéta', 'Salif', 'Téné', 'Ulrich', 'Valérie', 'Wendkouni', 'Yacouba', 'Zalissa',
  'Abdoul', 'Bintou', 'Cheick', 'Djénéba',
];
const LAST_NAMES = [
  'Ouédraogo', 'Sawadogo', 'Kaboré', 'Compaoré', 'Zongo', 'Traoré', 'Ouattara',
  'Nikiéma', 'Sanou', 'Bationo', 'Kambou', 'Yaméogo', 'Ilboudo', 'Somé',
];
const CITIES = ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Kaya', "Fada N'Gourma"];

/** Numéro factice : préfixe « 00 » non attribué au Burkina Faso. */
const fakePhone = (i: number) => `+22600${String(100000 + i * 137).slice(-6)}`;
const fakeCnib = (i: number) => `B-SPEC-${String(10000 + i * 73).slice(-5)}`;

const KYC_BY_INDEX: KycStatus[] = [
  'VERIFIED', 'VERIFIED', 'PENDING', 'VERIFIED', 'PENDING', 'REJECTED', 'VERIFIED', 'PENDING',
  'NOT_SUBMITTED', 'VERIFIED', 'PENDING', 'VERIFIED', 'PENDING', 'REJECTED', 'VERIFIED', 'PENDING',
  'VERIFIED', 'NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'VERIFIED', 'PENDING', 'VERIFIED', 'PENDING',
  'VERIFIED', 'NOT_SUBMITTED', 'VERIFIED', 'PENDING',
];

const users: AdminUser[] = FIRST_NAMES.map((first, i) => {
  const last = LAST_NAMES[(i * 5) % LAST_NAMES.length]!;
  return {
    id: `u${String(i + 1).padStart(3, '0')}`,
    displayName: `${first} ${last}`,
    phoneNumber: fakePhone(i + 1),
    city: CITIES[i % CITIES.length]!,
    kycStatus: KYC_BY_INDEX[i] ?? 'NOT_SUBMITTED',
    accountStatus: i === 13 ? 'SUSPENDED' : 'ACTIVE',
    suspensionReason: i === 13 ? 'Plusieurs comptes avec la même CNIB' : undefined,
    reputationScore: 35 + ((i * 17) % 64),
    circlesCount: (i * 3) % 5,
    createdAt: daysAgo(200 - i * 6),
    lastActiveAt: hoursAgo((i * 7) % 90),
  };
});

const userAt = (i: number) => users[i % users.length]!;

/* ── KYC ──────────────────────────────────────────────────────────────── */

const SPECIMEN = {
  front: '/mock/cnib-recto.svg',
  back: '/mock/cnib-verso.svg',
  selfie: '/mock/selfie.svg',
};

/** Deux comptes en attente partagent volontairement le même numéro de CNIB. */
const DUPLICATE_CNIB = fakeCnib(5);

const kycSubmissions: KycSubmission[] = users
  .map((u, i): KycSubmission | null => {
    if (u.kycStatus === 'NOT_SUBMITTED') return null;
    const documentNumber = i === 4 || i === 18 ? DUPLICATE_CNIB : fakeCnib(i + 1);
    const flags: string[] = [];
    if (documentNumber === DUPLICATE_CNIB) flags.push('Même numéro de CNIB qu’un autre compte');
    if (i === 10) flags.push('Photo du recto peu nette (détection automatique)');
    if (i === 27) flags.push('Nom du document différent du nom du profil');
    const decided = u.kycStatus === 'VERIFIED' || u.kycStatus === 'REJECTED';
    return {
      id: `kyc${String(i + 1).padStart(3, '0')}`,
      userId: u.id,
      userName: u.displayName,
      phoneNumber: u.phoneNumber,
      city: u.city,
      documentType: i % 9 === 3 ? 'PASSPORT' : 'CNIB',
      documentNumber,
      birthDate: `19${80 + (i % 20)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
      submittedAt: decided ? daysAgo(40 - i) : hoursAgo(3 + i * 2),
      status: u.kycStatus as KycSubmission['status'],
      images: SPECIMEN,
      flags,
      reviewedAt: decided ? daysAgo(Math.max(1, 38 - i)) : undefined,
      reviewedBy: decided ? (i % 2 ? 'Admin Opérations' : 'Admin Conformité') : undefined,
      rejectionReason: u.kycStatus === 'REJECTED' ? (i === 5 ? 'Photo floue ou illisible' : 'Document déjà utilisé par un autre compte') : undefined,
    };
  })
  .filter((s): s is KycSubmission => s !== null);

const kycDecisions: KycDecision[] = kycSubmissions
  .filter((s) => s.status !== 'PENDING')
  .map((s) => ({
    id: `dec-${s.id}`,
    submissionId: s.id,
    userId: s.userId,
    userName: s.userName,
    documentNumber: s.documentNumber,
    decision: s.status as 'VERIFIED' | 'REJECTED',
    reason: s.rejectionReason,
    decidedBy: s.reviewedBy ?? 'Admin',
    decidedAt: s.reviewedAt ?? s.submittedAt,
    localOnly: false,
  }));

/* ── Cagnottes d'aide publiques ───────────────────────────────────────── */

const FUNDRAISER_SEED: {
  title: string;
  description: string;
  category: FundraiserCategory;
  status: FundraiserStatus;
  goal: number;
  collectedPct: number;
  reports: string[];
}[] = [
  { title: 'Opération chirurgicale pour ma mère', description: 'Frais d’opération et d’hospitalisation au CHU.', category: 'SANTE', status: 'ACTIVE', goal: 750000, collectedPct: 62, reports: [] },
  { title: 'Funérailles de notre père', description: 'Organisation des funérailles au village.', category: 'FUNERAILLES', status: 'ACTIVE', goal: 400000, collectedPct: 88, reports: [] },
  { title: 'Scolarité des orphelins du quartier', description: 'Frais d’inscription et fournitures pour 15 enfants.', category: 'SCOLARITE', status: 'PENDING', goal: 1200000, collectedPct: 0, reports: [] },
  { title: 'Reconstruction après l’inondation', description: 'Notre maison s’est effondrée après les pluies.', category: 'SINISTRE', status: 'ACTIVE', goal: 2000000, collectedPct: 21, reports: ['Photos reprises d’un article de presse', 'Même histoire publiée sous un autre nom', 'Organisateur injoignable'] },
  { title: 'Aide pour dialyse', description: 'Séances de dialyse pendant trois mois.', category: 'SANTE', status: 'SUSPENDED', goal: 900000, collectedPct: 47, reports: ['Montant demandé incohérent', 'Ordonnance falsifiée selon un proche'] },
  { title: 'Naissance de triplés', description: 'Lait, couches et suivi médical des bébés.', category: 'NAISSANCE', status: 'ACTIVE', goal: 300000, collectedPct: 100, reports: [] },
  { title: 'Évacuation sanitaire urgente', description: 'Transport vers Ouagadougou et soins.', category: 'SANTE', status: 'PENDING', goal: 500000, collectedPct: 0, reports: ['Demande d’argent en dehors de l’application'] },
  { title: 'Incendie de la boutique', description: 'Relancer le commerce familial détruit par le feu.', category: 'SINISTRE', status: 'CLOSED', goal: 650000, collectedPct: 74, reports: [] },
  { title: 'Soutien à la famille d’un collègue', description: 'Collecte entre collègues pour la veuve.', category: 'FUNERAILLES', status: 'ACTIVE', goal: 250000, collectedPct: 35, reports: ['Doublon d’une autre cagnotte'] },
  { title: 'Matériel pour l’école primaire', description: 'Tables-bancs et tableaux pour deux classes.', category: 'SCOLARITE', status: 'ACTIVE', goal: 1500000, collectedPct: 12, reports: [] },
  { title: 'Traitement contre le paludisme grave', description: 'Hospitalisation d’un enfant de 4 ans.', category: 'SANTE', status: 'CLOSED', goal: 150000, collectedPct: 100, reports: [] },
  { title: 'Projet personnel', description: 'Aidez-moi à acheter une moto.', category: 'AUTRE', status: 'PENDING', goal: 800000, collectedPct: 0, reports: ['Ce n’est pas une aide d’urgence', 'Lien partagé massivement sur WhatsApp avec un autre numéro', 'Arnaque probable'] },
];

const REPORTERS = ['Contributeur anonyme', 'Utilisateur vérifié', 'Membre du cercle', 'Contributeur anonyme'];

const fundraisers: Fundraiser[] = FUNDRAISER_SEED.map((f, i) => {
  const organizer = userAt(i * 3 + 1);
  return {
    id: `cag${String(i + 1).padStart(3, '0')}`,
    code: `VNG${(4821 + i * 397).toString(36).toUpperCase()}`,
    title: f.title,
    description: f.description,
    category: f.category,
    organizerId: organizer.id,
    organizerName: organizer.displayName,
    organizerPhone: organizer.phoneNumber,
    organizerKycVerified: organizer.kycStatus === 'VERIFIED',
    status: f.status,
    goal: f.goal,
    collected: Math.round((f.goal * f.collectedPct) / 100 / 500) * 500,
    contributorsCount: Math.round(f.collectedPct * 0.9),
    createdAt: daysAgo(2 + i * 4),
    endsAt: f.status === 'CLOSED' ? daysAgo(1 + i) : daysAgo(-30 + i),
    reports: f.reports.map((reason, j) => ({
      id: `sig-${i}-${j}`,
      reason,
      reporterLabel: REPORTERS[j % REPORTERS.length]!,
      reportedAt: hoursAgo(5 + j * 11 + i),
    })),
    moderationNote: f.status === 'SUSPENDED' ? 'Justificatifs médicaux demandés à l’organisateur.' : f.status === 'CLOSED' ? 'Objectif atteint ou échéance passée.' : undefined,
    moderatedAt: f.status === 'SUSPENDED' || f.status === 'CLOSED' ? daysAgo(1) : undefined,
    moderatedBy: f.status === 'SUSPENDED' || f.status === 'CLOSED' ? 'Admin Conformité' : undefined,
  };
});

/* ── Alertes de fraude ────────────────────────────────────────────────── */

const dupA = users[4]!;
const dupB = users[18]!;
const reported = fundraisers[3]!;
const reported2 = fundraisers[11]!;

const alerts: FraudAlert[] = [
  {
    id: 'al001', type: 'DUPLICATE_DOCUMENT', severity: 'CRITICAL', status: 'OPEN', createdAt: hoursAgo(2),
    title: 'Même CNIB sur deux comptes',
    description: `Le numéro ${DUPLICATE_CNIB} est utilisé par deux demandes KYC en attente.`,
    subjects: [{ kind: 'user', id: dupA.id, label: dupA.displayName }, { kind: 'user', id: dupB.id, label: dupB.displayName }],
  },
  {
    id: 'al002', type: 'FUNDRAISER_REPORTED', severity: 'HIGH', status: 'OPEN', createdAt: hoursAgo(5),
    title: 'Cagnotte signalée 3 fois',
    description: 'Signalements : photos reprises d’un article, histoire dupliquée, organisateur injoignable.',
    subjects: [{ kind: 'fundraiser', id: reported.id, label: reported.title }],
  },
  {
    id: 'al003', type: 'FAILED_PAYMENTS', severity: 'HIGH', status: 'OPEN', createdAt: hoursAgo(7),
    title: '7 paiements Orange Money échoués en 20 min',
    description: 'Tentatives répétées de cotisation avec 3 numéros payeurs différents.',
    subjects: [{ kind: 'user', id: userAt(9).id, label: userAt(9).displayName }],
  },
  {
    id: 'al004', type: 'UNUSUAL_WITHDRAWAL', severity: 'CRITICAL', status: 'OPEN', createdAt: hoursAgo(11),
    title: 'Retrait de 480 000 F CFA juste après la levée de suspension',
    description: 'Retrait vers un numéro Moov Money jamais utilisé par l’organisateur.',
    subjects: [{ kind: 'user', id: userAt(13).id, label: userAt(13).displayName }],
  },
  {
    id: 'al005', type: 'FUNDRAISER_REPORTED', severity: 'MEDIUM', status: 'OPEN', createdAt: hoursAgo(20),
    title: 'Cagnotte en attente signalée 3 fois',
    description: 'Cagnotte non encore publiée mais déjà partagée avec un autre numéro de paiement.',
    subjects: [{ kind: 'fundraiser', id: reported2.id, label: reported2.title }],
  },
  {
    id: 'al006', type: 'SHARED_DEVICE', severity: 'MEDIUM', status: 'OPEN', createdAt: hoursAgo(26),
    title: '4 comptes créés depuis le même appareil',
    description: 'Inscriptions en moins de 2 heures, dont 2 avec KYC en attente.',
    subjects: [userAt(21), userAt(23), userAt(15)].map((u) => ({ kind: 'user' as const, id: u.id, label: u.displayName })),
  },
  {
    id: 'al007', type: 'FAILED_PAYMENTS', severity: 'LOW', status: 'OPEN', createdAt: hoursAgo(30),
    title: '3 paiements Wave échoués',
    description: 'Solde insuffisant probable, à surveiller.',
    subjects: [{ kind: 'user', id: userAt(6).id, label: userAt(6).displayName }],
  },
  {
    id: 'al008', type: 'UNUSUAL_WITHDRAWAL', severity: 'HIGH', status: 'OPEN', createdAt: hoursAgo(40),
    title: 'Retrait de la caisse de solidarité hors vote',
    description: 'Décaissement demandé par le trésorier sans demande d’aide approuvée.',
    subjects: [{ kind: 'circle', id: 'c004', label: 'Caisse des commerçantes de Rood Woko' }],
  },
  {
    id: 'al009', type: 'DUPLICATE_DOCUMENT', severity: 'HIGH', status: 'RESOLVED', createdAt: daysAgo(6),
    title: 'Même CNIB sur deux comptes',
    description: 'Compte secondaire identifié et suspendu.',
    subjects: [{ kind: 'user', id: userAt(13).id, label: userAt(13).displayName }],
    resolvedAt: daysAgo(5), resolvedBy: 'Admin Conformité', resolutionNote: 'Compte doublon suspendu, KYC refusé.',
  },
  {
    id: 'al010', type: 'FAILED_PAYMENTS', severity: 'MEDIUM', status: 'RESOLVED', createdAt: daysAgo(9),
    title: '5 paiements Moov Money échoués',
    description: 'Incident opérateur confirmé ce jour-là.',
    subjects: [{ kind: 'user', id: userAt(2).id, label: userAt(2).displayName }],
    resolvedAt: daysAgo(8), resolvedBy: 'Admin Opérations', resolutionNote: 'Incident Moov Money, pas de fraude.',
  },
  {
    id: 'al011', type: 'FUNDRAISER_REPORTED', severity: 'HIGH', status: 'RESOLVED', createdAt: daysAgo(4),
    title: 'Cagnotte signalée 2 fois',
    description: 'Ordonnance contestée par un proche.',
    subjects: [{ kind: 'fundraiser', id: fundraisers[4]!.id, label: fundraisers[4]!.title }],
    resolvedAt: daysAgo(1), resolvedBy: 'Admin Conformité', resolutionNote: 'Cagnotte suspendue en attente de justificatifs.',
  },
];

/* ── Cercles ──────────────────────────────────────────────────────────── */

const CIRCLE_SEED: { name: string; kind: CircleKind; contribution: number; frequency: Frequency; size: number; natureItem?: string; paused?: boolean; completed?: boolean }[] = [
  { name: 'Tontine des enseignants de Gounghin', kind: 'TONTINE', contribution: 25000, frequency: 'MONTHLY', size: 10 },
  { name: 'Groupement des femmes de Tanghin', kind: 'TONTINE', contribution: 5000, frequency: 'WEEKLY', size: 12 },
  { name: 'Tontine sacs de riz — Dassasgho', kind: 'NATURE', contribution: 22000, frequency: 'MONTHLY', size: 8, natureItem: 'Sac de riz 50 kg' },
  { name: 'Caisse des commerçantes de Rood Woko', kind: 'SOLIDARITY', contribution: 2000, frequency: 'WEEKLY', size: 18 },
  { name: 'Mutuelle des moto-taxis de Bobo', kind: 'SOLIDARITY', contribution: 1000, frequency: 'DAILY', size: 15 },
  { name: 'Tontine des jeunes de Koudougou', kind: 'TONTINE', contribution: 10000, frequency: 'BIWEEKLY', size: 9, paused: true },
  { name: 'Tontine pagnes — fête de Tabaski', kind: 'NATURE', contribution: 15000, frequency: 'MONTHLY', size: 6, natureItem: 'Lot de pagnes', completed: true },
  { name: 'Association des ressortissants de Kaya', kind: 'SOLIDARITY', contribution: 5000, frequency: 'MONTHLY', size: 20 },
  { name: 'Tontine du marché de Banfora', kind: 'TONTINE', contribution: 3000, frequency: 'WEEKLY', size: 11 },
  { name: 'Tontine des infirmiers du CMA', kind: 'TONTINE', contribution: 50000, frequency: 'MONTHLY', size: 7 },
  { name: 'Caisse des parents d’élèves de Ouahigouya', kind: 'SOLIDARITY', contribution: 1500, frequency: 'MONTHLY', size: 14 },
  { name: 'Tontine céréales — Fada', kind: 'NATURE', contribution: 18000, frequency: 'MONTHLY', size: 8, natureItem: 'Sac de maïs 100 kg' },
];

const ROLES: MemberRole[] = ['PRESIDENT', 'TREASURER', 'SECRETARY'];

const circles: AdminCircle[] = CIRCLE_SEED.map((c, i) => {
  const members: CircleMember[] = Array.from({ length: Math.min(c.size, 12) }, (_, j) => {
    const u = userAt(i * 2 + j * 3);
    const r = (i + j * 7) % 10;
    return {
      userId: u.id,
      name: u.displayName,
      role: ROLES[j] ?? 'MEMBER',
      turnOrder: c.kind === 'SOLIDARITY' ? undefined : j + 1,
      paymentStatus: c.completed ? 'PAID' : r < 6 ? 'PAID' : r < 8 ? 'PENDING' : 'LATE',
    };
  });
  const totalTurns = c.kind === 'SOLIDARITY' ? 0 : c.size;
  const currentTurn = c.kind === 'SOLIDARITY' ? 0 : c.completed ? totalTurns : 1 + (i % Math.max(1, totalTurns - 1));
  const paid = members.filter((m) => m.paymentStatus === 'PAID').length;
  return {
    id: `c${String(i + 1).padStart(3, '0')}`,
    name: c.name,
    kind: c.kind,
    contribution: c.contribution,
    natureItem: c.natureItem,
    frequency: c.frequency,
    status: c.completed ? 'COMPLETED' : c.paused ? 'PAUSED' : 'ACTIVE',
    presidentName: members[0]?.name ?? '—',
    memberCount: c.size,
    currentTurn,
    totalTurns,
    collectedThisPeriod: paid * c.contribution,
    solidarityBalance: c.kind === 'SOLIDARITY' ? c.contribution * c.size * (6 + i) : 0,
    latePayments: members.filter((m) => m.paymentStatus === 'LATE').length,
    inviteCode: `CRC-${(9137 + i * 211).toString(36).toUpperCase()}`,
    createdAt: daysAgo(150 - i * 9),
    members,
  };
});

for (const u of users) {
  u.circlesCount = circles.filter((c) => c.members.some((m) => m.userId === u.id)).length;
}

/* ── Journal ──────────────────────────────────────────────────────────── */

const audit: AuditEntry[] = [
  ...kycDecisions.slice(0, 8).map((d) => ({
    id: `aud-${d.id}`,
    at: d.decidedAt,
    actor: d.decidedBy,
    action: d.decision === 'VERIFIED' ? 'KYC validé' : 'KYC refusé',
    targetType: 'kyc' as const,
    targetLabel: d.userName,
    detail: d.reason,
    localOnly: false,
  })),
  ...fundraisers
    .filter((f) => f.moderatedAt)
    .map((f) => ({
      id: `aud-${f.id}`,
      at: f.moderatedAt!,
      actor: f.moderatedBy ?? 'Admin',
      action: f.status === 'SUSPENDED' ? 'Cagnotte suspendue' : 'Cagnotte clôturée',
      targetType: 'fundraiser' as const,
      targetLabel: f.title,
      detail: f.moderationNote,
      localOnly: false,
    })),
  ...alerts
    .filter((a) => a.status === 'RESOLVED')
    .map((a) => ({
      id: `aud-${a.id}`,
      at: a.resolvedAt!,
      actor: a.resolvedBy ?? 'Admin',
      action: 'Alerte traitée',
      targetType: 'alert' as const,
      targetLabel: a.title,
      detail: a.resolutionNote,
      localOnly: false,
    })),
];

/** Volumes mensuels (F CFA) — indicatif, pour le graphique du tableau de bord. */
const monthlyVolume = [
  { month: 'mai', volume: 18_400_000 },
  { month: 'juin', volume: 21_900_000 },
  { month: 'juil.', volume: 24_300_000 },
  { month: 'août', volume: 23_100_000 },
  { month: 'sept.', volume: 27_800_000 },
  { month: 'oct.', volume: 31_200_000 },
];

export const db = {
  users,
  kycSubmissions,
  kycDecisions,
  fundraisers,
  alerts,
  circles,
  audit,
  monthlyVolume,
};

/** Simule la latence réseau pour que les écrans gèrent déjà les états de chargement. */
export function latency(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Copie profonde pour que les écrans ne mutent jamais le « serveur » simulé. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
