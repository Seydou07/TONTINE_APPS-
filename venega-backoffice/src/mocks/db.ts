/**
 * DONNÉES DE DÉMONSTRATION — à supprimer quand les endpoints admin existeront.
 *
 * Tous les noms sont fictifs, les numéros commencent par « +226 00 » (inexistants)
 * et les numéros de CNIB sont des spécimens. Aucune donnée personnelle réelle.
 *
 * Les données sont générées de façon déterministe et cohérente entre elles :
 * chaque case « payé » de la grille d'un cercle a son paiement, chaque versement
 * de cagnotte a sa transaction sortante, les tickets pointent vers des situations
 * réelles du jeu de données (paiement non rattaché, versement refusé, exclusion contestée…).
 *
 * Cet état vit uniquement en mémoire dans le navigateur : il est réinitialisé
 * à chaque rechargement de la page. Seules les couches `src/features/<x>/api.ts`
 * doivent l'importer.
 */

import type { AdminUser, KycStatus, UserSession } from '@/features/users/types';
import type { KycSubmission, KycDecision } from '@/features/kyc/types';
import type { Fundraiser, FundraiserCategory, FundraiserStatus } from '@/features/fundraisers/types';
import type { FraudAlert } from '@/features/alerts/types';
import {
  FREQUENCY_DAYS,
  type AdminCircle,
  type CircleEvent,
  type CircleKind,
  type CircleMember,
  type CircleRequest,
  type ContributionCell,
  type Frequency,
  type LedgerEntry,
  type MemberRole,
  type Payout,
  type SolidarityRequest,
  type TurnOrderChange,
} from '@/features/circles/types';
import type { AuditEntry, SupportNote } from '@/features/audit/types';
import type { Payment, Provider, Refund } from '@/features/payments/types';
import type { Ticket } from '@/features/tickets/types';
import type { UserNotification } from '@/features/notifications/types';

/* ── Temps ────────────────────────────────────────────────────────────── */

const NOW = Date.now();
const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();
const minutesAgo = (m: number) => iso(NOW - m * 60_000);
const hoursAgo = (h: number) => iso(NOW - h * 3_600_000);
const daysAgo = (d: number) => iso(NOW - d * DAY);

/* ── Équipe (assignation des tickets) — personnes fictives ───────────── */

export const ADMIN_TEAM = ['Awa (Support)', 'Boubacar (Support)', 'Fatimata (Agent KYC)', 'Issa (Finance)', 'Responsable plateforme'];

/* ── Utilisateurs ─────────────────────────────────────────────────────── */

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

/** Situations d'appel illustrées par le jeu de données (index dans FIRST_NAMES). */
const U_OTP_FAIL = 8; // ne reçoit pas le code SMS
const U_RESET = 9; // a demandé un nouveau mot de passe
const U_LOCKED = 11; // compte verrouillé (trop d'essais)
const U_SUSPENDED = 13;
const U_NO_PUSH = 16; // ne reçoit pas les notifications
const U_LOST_SIM = 19; // a perdu sa SIM
const U_PHONE_CHANGED = 5; // a déjà changé de numéro

const users: AdminUser[] = FIRST_NAMES.map((first, i) => {
  const last = LAST_NAMES[(i * 5) % LAST_NAMES.length]!;
  const phone = fakePhone(i + 1);
  return {
    id: `u${String(i + 1).padStart(3, '0')}`,
    displayName: `${first} ${last}`,
    phoneNumber: phone,
    mobileMoneyNumber: i === 2 || i === 21 ? fakePhone(i + 60) : phone,
    city: CITIES[i % CITIES.length]!,
    kycStatus: KYC_BY_INDEX[i] ?? 'NOT_SUBMITTED',
    accountStatus: i === U_SUSPENDED ? 'SUSPENDED' : 'ACTIVE',
    suspensionReason: i === U_SUSPENDED ? 'Plusieurs comptes avec la même CNIB' : undefined,
    reputationScore: 35 + ((i * 17) % 64),
    circlesCount: 0,
    createdAt: daysAgo(200 - i * 6),
    lastActiveAt: i === U_OTP_FAIL ? hoursAgo(1) : hoursAgo((i * 7) % 90),
    security: {
      phoneVerified: i !== U_OTP_FAIL,
      failedLoginAttempts: i === U_LOCKED ? 5 : i % 9 === 4 ? 1 : 0,
      lockedUntil: i === U_LOCKED ? iso(NOW + 25 * 60_000) : undefined,
      otpSentLast24h: i === U_OTP_FAIL ? 4 : i === U_LOCKED ? 1 : 0,
      lastOtpSentAt: i === U_OTP_FAIL ? minutesAgo(12) : i === U_LOCKED ? hoursAgo(2) : daysAgo(200 - i * 6),
      lastOtpDelivery: i === U_OTP_FAIL ? 'FAILED' : 'DELIVERED',
      lastOtpError: i === U_OTP_FAIL ? 'Numéro injoignable : téléphone éteint ou hors réseau (agrégateur SMS)' : undefined,
      pushTokenRegistered: i !== U_NO_PUSH && i !== U_OTP_FAIL,
      passwordResetSentAt: i === U_RESET ? hoursAgo(3) : undefined,
    },
    phoneHistory:
      i === U_PHONE_CHANGED
        ? [{ from: fakePhone(80), to: phone, at: daysAgo(45), by: 'Awa (Support)', reason: 'Puce volée, identité vérifiée par la CNIB' }]
        : [],
  };
});

const userAt = (i: number) => users[((i % users.length) + users.length) % users.length]!;
const userById = (id: string) => users.find((u) => u.id === id)!;

/* ── Appareils / sessions ─────────────────────────────────────────────── */

const DEVICES: { device: string; platform: 'ANDROID' | 'IOS' }[] = [
  { device: 'Tecno Spark 10', platform: 'ANDROID' },
  { device: 'Itel A70', platform: 'ANDROID' },
  { device: 'Samsung Galaxy A14', platform: 'ANDROID' },
  { device: 'Infinix Hot 30', platform: 'ANDROID' },
  { device: 'iPhone 11', platform: 'IOS' },
];

const sessions: UserSession[] = users.flatMap((u, i) => {
  if (!u.security.phoneVerified) return [];
  const d = DEVICES[i % DEVICES.length]!;
  const list: UserSession[] = [
    {
      id: `ses-${u.id}-1`,
      userId: u.id,
      ...d,
      appVersion: i % 4 === 0 ? '1.3.0' : '1.4.2',
      city: u.city,
      createdAt: daysAgo(30 + (i % 20)),
      lastSeenAt: u.lastActiveAt,
    },
  ];
  if (i === U_LOST_SIM || i % 6 === 1) {
    list.push({
      id: `ses-${u.id}-2`,
      userId: u.id,
      ...DEVICES[(i + 2) % DEVICES.length]!,
      appVersion: '1.4.2',
      city: i === U_LOST_SIM ? 'Bobo-Dioulasso' : u.city,
      createdAt: i === U_LOST_SIM ? hoursAgo(20) : daysAgo(10),
      lastSeenAt: i === U_LOST_SIM ? hoursAgo(2) : daysAgo(3),
    });
  }
  return list;
});

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
      // Les plus anciens dossiers en attente datent de plus d'une semaine.
      submittedAt: decided ? daysAgo(40 - i) : hoursAgo(3 + i * 7),
      status: u.kycStatus as KycSubmission['status'],
      images: SPECIMEN,
      flags,
      reviewedAt: decided ? daysAgo(Math.max(1, 38 - i)) : undefined,
      reviewedBy: decided ? (i % 2 ? 'Fatimata (Agent KYC)' : 'Responsable plateforme') : undefined,
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

/* ── Paiements (créés au fil de la génération des cercles) ───────────── */

const PROVIDERS: Provider[] = ['ORANGE_MONEY', 'MOOV_MONEY', 'WAVE'];
const payments: Payment[] = [];
let payCounter = 0;

function providerRef(p: Provider, n: number): string {
  const num = String(1_000_000 + ((n * 7919) % 8_999_999)).slice(-7);
  if (p === 'ORANGE_MONEY') return `OM2410.${num}`;
  if (p === 'MOOV_MONEY') return `MM${num}BF`;
  return `T${num}WV`;
}

type NewPayment = Omit<Payment, 'id' | 'reference' | 'providerReference'> & { withProviderRef?: boolean };

function addPayment(p: NewPayment): Payment {
  payCounter++;
  const { withProviderRef = true, ...rest } = p;
  const pay: Payment = {
    id: `pay${String(payCounter).padStart(5, '0')}`,
    reference: `VP-${100400 + payCounter}`,
    providerReference: withProviderRef ? providerRef(p.provider, payCounter) : undefined,
    ...rest,
  };
  payments.push(pay);
  return pay;
}

/* ── Cercles ──────────────────────────────────────────────────────────── */

interface CircleSeed {
  name: string;
  kind: CircleKind;
  contribution: number;
  frequency: Frequency;
  size: number;
  /** Tour (ou période) en cours */
  turn: number;
  /** Jours écoulés depuis l'échéance du tour en cours (négatif = échéance à venir) */
  dueAgo: number;
  natureItem?: string;
  paused?: boolean;
  completed?: boolean;
  /** Toutes les cotisations du tour en cours sont payées */
  allPaid?: boolean;
}

const CIRCLE_SEED: CircleSeed[] = [
  { name: 'Tontine des enseignants de Gounghin', kind: 'TONTINE', contribution: 25000, frequency: 'MONTHLY', size: 10, turn: 4, dueAgo: 3 },
  { name: 'Groupement des femmes de Tanghin', kind: 'TONTINE', contribution: 5000, frequency: 'WEEKLY', size: 12, turn: 7, dueAgo: 2 },
  { name: 'Tontine sacs de riz — Dassasgho', kind: 'NATURE', contribution: 22000, frequency: 'MONTHLY', size: 8, turn: 3, dueAgo: -5, natureItem: 'Sac de riz 50 kg' },
  { name: 'Caisse des commerçantes de Rood Woko', kind: 'SOLIDARITY', contribution: 2000, frequency: 'WEEKLY', size: 12, turn: 14, dueAgo: 1 },
  { name: 'Mutuelle des moto-taxis de Bobo', kind: 'SOLIDARITY', contribution: 1000, frequency: 'DAILY', size: 11, turn: 40, dueAgo: 0 },
  { name: 'Tontine des jeunes de Koudougou', kind: 'TONTINE', contribution: 10000, frequency: 'BIWEEKLY', size: 9, turn: 4, dueAgo: 9, allPaid: true },
  { name: 'Tontine pagnes — fête de Tabaski', kind: 'NATURE', contribution: 15000, frequency: 'MONTHLY', size: 6, turn: 6, dueAgo: 20, natureItem: 'Lot de pagnes', completed: true },
  { name: 'Association des ressortissants de Kaya', kind: 'SOLIDARITY', contribution: 5000, frequency: 'MONTHLY', size: 12, turn: 9, dueAgo: 6 },
  { name: 'Tontine du marché de Banfora', kind: 'TONTINE', contribution: 3000, frequency: 'WEEKLY', size: 11, turn: 5, dueAgo: 4 },
  { name: 'Tontine des infirmiers du CMA', kind: 'TONTINE', contribution: 50000, frequency: 'MONTHLY', size: 7, turn: 2, dueAgo: -2 },
  { name: 'Caisse des parents d’élèves de Ouahigouya', kind: 'SOLIDARITY', contribution: 1500, frequency: 'MONTHLY', size: 12, turn: 5, dueAgo: -10, paused: true },
  { name: 'Tontine céréales — Fada', kind: 'NATURE', contribution: 18000, frequency: 'MONTHLY', size: 8, turn: 2, dueAgo: 1, natureItem: 'Sac de maïs 100 kg' },
];

/** Index des cercles qui portent un scénario d'appel. */
const C_PAYMENT_MISSING = 0; // c001 : cotisation payée depuis le numéro d'un proche
const C_FAILED_PAYOUT = 1; // c002 : versement du tour refusé par l'opérateur
const C_LEAVE = 2; // c003 : demande de départ en attente
const C_SOLIDARITY_UNPAID = 3; // c004 : aide approuvée non décaissée
const C_VOTE_BLOCKED = 4; // c005 : vote bloqué
const C_FOUNDER_ABSENT = 5; // c006 : fondateur qui ne verse pas + ordre modifié
const C_EXCLUSION = 8; // c009 : exclusion contestée
const C_REPLACEMENT = 9; // c010 : remplacement en attente
const C_DOUBLE_PAY = 11; // c012 : double paiement

const SOLIDARITY_ROLES: MemberRole[] = ['PRESIDENT', 'TREASURER', 'SECRETARY'];

const circles: AdminCircle[] = [];
const contributions: ContributionCell[] = [];
const payouts: Payout[] = [];
const requests: CircleRequest[] = [];
const orderChanges: TurnOrderChange[] = [];
const circleEvents: CircleEvent[] = [];
const solidarityRequests: SolidarityRequest[] = [];
const ledger: LedgerEntry[] = [];

let evCounter = 0;
function addEvent(e: Omit<CircleEvent, 'id'>) {
  circleEvents.push({ id: `ev${++evCounter}`, ...e });
}

CIRCLE_SEED.forEach((seed, i) => {
  const id = `c${String(i + 1).padStart(3, '0')}`;
  const period = FREQUENCY_DAYS[seed.frequency] * DAY;
  const isSolidarity = seed.kind === 'SOLIDARITY';
  const currentDue = NOW - seed.dueAgo * DAY;
  const cycleStart = currentDue - (seed.turn - 1) * period;
  const due = (t: number) => cycleStart + (t - 1) * period;
  const createdAt = cycleStart - 6 * DAY;

  const members: CircleMember[] = Array.from({ length: seed.size }, (_, j) => {
    const u = userAt(i * 2 + j * 3);
    return {
      userId: u.id,
      name: u.displayName,
      phoneNumber: u.phoneNumber,
      role: isSolidarity ? SOLIDARITY_ROLES[j] ?? 'MEMBER' : j === 0 ? 'PRESIDENT' : 'MEMBER',
      status: 'ACTIVE',
      turnOrder: isSolidarity ? undefined : j + 1,
      paymentStatus: 'PAID',
      joinedAt: iso(createdAt + j * 3_600_000),
      lateCount: 0,
      paidLateCount: 0,
      remindersSent: 0,
    };
  });
  const founder = members[0]!;

  // Ordre de passage modifié par le fondateur (c006) : le membre attendu au tour 4 passe au tour 9.
  if (i === C_FOUNDER_ABSENT) {
    const a = members[3]!;
    const b = members[8]!;
    a.turnOrder = 9;
    b.turnOrder = 4;
    orderChanges.push({
      id: `oc-${id}-1`, circleId: id, at: iso(due(3) - 2 * DAY), by: founder.name, byAdmin: false,
      userId: a.userId, userName: a.name, fromOrder: 4, toOrder: 9, swappedWithName: b.name,
    });
  }
  if (i === C_PAYMENT_MISSING) {
    const a = members[4]!;
    const b = members[5]!;
    a.turnOrder = 6;
    b.turnOrder = 5;
    orderChanges.push({
      id: `oc-${id}-1`, circleId: id, at: iso(createdAt + 2 * DAY), by: founder.name, byAdmin: false,
      userId: a.userId, userName: a.name, fromOrder: 5, toOrder: 6, swappedWithName: b.name, reason: 'Échange demandé par les deux membres',
    });
  }

  // Exclusion contestée (c009)
  const excluded = i === C_EXCLUSION ? members[6]! : undefined;

  /* Grille des cotisations */
  const firstVisible = isSolidarity ? Math.max(1, seed.turn - 5) : 1;
  const lastVisible = isSolidarity ? seed.turn : seed.completed ? seed.size : seed.size;
  members.forEach((m, j) => {
    const prov = PROVIDERS[(i + j) % PROVIDERS.length]!;
    for (let t = firstVisible; t <= lastVisible; t++) {
      const dueMs = due(t);
      let status: ContributionCell['status'];
      if (t < seed.turn || seed.completed) {
        status = (i + j * 5 + t * 3) % 9 === 0 && j !== 0 ? 'PAID_LATE' : 'PAID';
      } else if (t === seed.turn) {
        const r = (i + j * 7) % 10;
        if (seed.allPaid || j === 0 || r < 6) status = 'PAID';
        else status = seed.dueAgo > 0 ? 'LATE' : 'PENDING';
        if (m === excluded) status = 'LATE';
      } else {
        status = 'UPCOMING';
      }
      const cell: ContributionCell = { circleId: id, userId: m.userId, turn: t, status, amount: seed.contribution, dueDate: iso(dueMs) };
      if (status === 'PAID' || status === 'PAID_LATE') {
        const paidMs = status === 'PAID_LATE' ? dueMs + 2 * DAY + j * 3_600_000 : Math.min(NOW - (j + 1) * 3_600_000, dueMs - (j + 2) * 3_600_000);
        const pay = addPayment({
          provider: prov, direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: m.phoneNumber,
          userId: m.userId, userName: m.name, circleId: id, circleName: seed.name, turn: t,
          amount: seed.contribution, status: 'COMPLETED', createdAt: iso(paidMs - 90_000), confirmedAt: iso(paidMs), matched: true,
        });
        cell.paidAt = iso(paidMs);
        cell.paymentId = pay.id;
      }
      contributions.push(cell);
    }
  });

  /* Versements (tontines) */
  if (!isSolidarity) {
    const lastTurn = seed.completed ? seed.size : seed.turn;
    const potSize = members.length * seed.contribution;
    for (let t = 1; t <= lastTurn; t++) {
      const b = members.find((m) => m.turnOrder === t)!;
      const bu = userById(b.userId);
      const dest = bu.mobileMoneyNumber ?? bu.phoneNumber;
      const p: Payout = {
        id: `po-${id}-${t}`, circleId: id, turn: t, beneficiaryId: b.userId, beneficiaryName: b.name,
        destination: dest, amount: potSize, status: 'PAID', dueDate: iso(due(t) + DAY),
      };
      if (t < seed.turn || seed.completed) {
        const failed = i === C_FAILED_PAYOUT && t === seed.turn - 1;
        const at = due(t) + 2 * DAY;
        const pay = addPayment({
          provider: 'ORANGE_MONEY', direction: 'OUT', purpose: 'PAYOUT', payerPhone: dest,
          userId: b.userId, userName: b.name, circleId: id, circleName: seed.name, turn: t, amount: potSize,
          status: failed ? 'FAILED' : 'COMPLETED', createdAt: iso(at - 120_000), confirmedAt: failed ? undefined : iso(at),
          failureReason: failed ? 'Numéro bénéficiaire non enregistré chez l’opérateur' : undefined, matched: true,
          withProviderRef: !failed,
        });
        p.paymentId = pay.id;
        if (failed) {
          p.status = 'FAILED';
          p.failureReason = 'Numéro bénéficiaire non enregistré chez l’opérateur (refus Orange Money)';
          addEvent({ circleId: id, at: iso(at), label: `Versement du tour ${t} refusé par l’opérateur`, actor: 'Système', detail: `${b.name} · ${p.failureReason}`, tone: 'red' });
        } else {
          p.paidAt = iso(at);
          addEvent({ circleId: id, at: iso(at), label: `${seed.natureItem ? 'Bien remis' : 'Cagnotte versée'} — tour ${t}`, actor: founder.name, detail: `${b.name} · ${potSize.toLocaleString('fr-FR')} F CFA`, tone: 'green' });
        }
      } else {
        const allPaid = contributions.filter((c) => c.circleId === id && c.turn === t).every((c) => c.status === 'PAID' || c.status === 'PAID_LATE');
        p.status = allPaid ? 'READY' : 'WAITING';
        p.dueDate = iso(due(t));
      }
      payouts.push(p);
    }
  }

  addEvent({ circleId: id, at: iso(createdAt), label: 'Cercle créé', actor: founder.name, tone: 'neutral' });
  addEvent({ circleId: id, at: iso(createdAt + 3_600_000), label: 'Frais de création payés (2 000 F CFA), cercle activé', actor: founder.name, tone: 'green' });
  addEvent({ circleId: id, at: iso(cycleStart), label: isSolidarity ? 'Début des cotisations' : 'Début de la rotation (cycle 1)', actor: founder.name, tone: 'neutral' });
  if (seed.paused) addEvent({ circleId: id, at: daysAgo(12), label: 'Cercle mis en pause par le fondateur', actor: founder.name, detail: 'Vacances scolaires', tone: 'amber' });
  if (seed.completed) addEvent({ circleId: id, at: iso(due(seed.size) + 3 * DAY), label: 'Cycle terminé', actor: 'Système', tone: 'neutral' });

  const circle: AdminCircle = {
    id,
    name: seed.name,
    kind: seed.kind,
    contribution: seed.contribution,
    natureItem: seed.natureItem,
    frequency: seed.frequency,
    status: seed.completed ? 'COMPLETED' : seed.paused ? 'PAUSED' : 'ACTIVE',
    founderId: founder.userId,
    founderName: founder.name,
    memberCount: members.length,
    currentTurn: seed.completed ? seed.size : seed.turn,
    totalTurns: isSolidarity ? 0 : seed.size,
    cycleNumber: 1,
    cycleStartedAt: iso(cycleStart),
    collectedThisPeriod: 0,
    solidarityBalance: 0,
    latePayments: 0,
    overduePayouts: 0,
    exclusionThreshold: 3,
    inviteCode: `CRC-${(9137 + i * 211).toString(36).toUpperCase()}`,
    createdAt: iso(createdAt),
    members,
  };
  circles.push(circle);

  if (excluded) {
    excluded.status = 'EXCLUDED';
    excluded.paidLateCount = 2;
    requests.push({
      id: `rq-${id}-excl`, circleId: id, circleName: seed.name, type: 'EXCLUSION', userId: excluded.userId, userName: excluded.name,
      status: 'APPROVED', reason: 'Trois retards de cotisation', createdAt: daysAgo(2), requestedBy: founder.name,
      decidedAt: daysAgo(2), decidedBy: founder.name, contested: true,
    });
    addEvent({ circleId: id, at: daysAgo(2), label: `${excluded.name} exclu(e) par le fondateur`, actor: founder.name, detail: 'Motif : trois retards de cotisation. Exclusion contestée par le membre.', tone: 'red' });
  }
});

const circleById = (id: string) => circles.find((c) => c.id === id)!;

for (const oc of orderChanges) {
  addEvent({
    circleId: oc.circleId, at: oc.at, label: 'Ordre de passage modifié', actor: oc.by,
    detail: `${oc.userName} : tour ${oc.fromOrder} → ${oc.toOrder}${oc.swappedWithName ? ` (échangé avec ${oc.swappedWithName})` : ''}`, tone: 'amber',
  });
}

/* ── Demandes d'adhésion, de départ, de remplacement ─────────────────── */

function nonMember(circleId: string, offset: number) {
  const c = circleById(circleId);
  for (let k = 0; k < users.length; k++) {
    const u = userAt(offset + k);
    if (!c.members.some((m) => m.userId === u.id) && u.accountStatus === 'ACTIVE') return u;
  }
  return userAt(offset);
}

for (const [ci, offset, ago] of [[0, 20, 5], [7, 3, 30], [2, 11, 50]] as const) {
  const c = circles[ci]!;
  const u = nonMember(c.id, offset);
  requests.push({
    id: `rq-${c.id}-join`, circleId: c.id, circleName: c.name, type: 'JOIN', userId: u.id, userName: u.displayName,
    status: 'PENDING', reason: 'Demande d’adhésion par code d’invitation', createdAt: hoursAgo(ago), requestedBy: u.displayName,
  });
}
{
  const c = circles[C_LEAVE]!;
  const m = c.members[5]!;
  requests.push({
    id: `rq-${c.id}-leave`, circleId: c.id, circleName: c.name, type: 'LEAVE', userId: m.userId, userName: m.name,
    status: 'PENDING', reason: 'Je pars travailler à Abidjan', createdAt: daysAgo(6), requestedBy: m.name,
    amountToRecover: (c.currentTurn - 1) * c.contribution,
  });
  addEvent({ circleId: c.id, at: daysAgo(6), label: 'Demande de départ', actor: m.name, detail: 'Sans réponse du fondateur depuis 6 jours', tone: 'amber' });
}
{
  const c = circles[C_PAYMENT_MISSING]!;
  const m = c.members[7]!;
  requests.push({
    id: `rq-${c.id}-leave-old`, circleId: c.id, circleName: c.name, type: 'LEAVE', userId: m.userId, userName: m.name,
    status: 'REJECTED', reason: 'Raisons familiales', createdAt: daysAgo(25), requestedBy: m.name,
    decidedAt: daysAgo(24), decidedBy: c.founderName, decisionNote: 'Le règlement interdit les départs avant la fin du cycle.',
    amountToRecover: 2 * c.contribution,
  });
}
{
  const c = circles[C_REPLACEMENT]!;
  const m = c.members[4]!;
  requests.push({
    id: `rq-${c.id}-repl`, circleId: c.id, circleName: c.name, type: 'REPLACEMENT', userId: m.userId, userName: m.name,
    status: 'PENDING', reason: 'Mutation à Dori, propose sa sœur pour la remplacer', createdAt: daysAgo(3), requestedBy: m.name,
    replacementName: 'Assita Konaté', replacementPhone: fakePhone(90),
  });
}
for (const r of requests.filter((x) => x.type === 'JOIN')) {
  addEvent({ circleId: r.circleId, at: r.createdAt, label: 'Demande d’adhésion reçue', actor: r.userName, tone: 'neutral' });
}

/* ── Paiements particuliers : non rattachés, en attente, échoués ─────── */

const currentCell = (circleId: string, status: ContributionCell['status']) => {
  const c = circleById(circleId);
  return contributions.find((x) => x.circleId === circleId && x.turn === c.currentTurn && x.status === status && x.userId !== c.founderId);
};

// A. Payé depuis le numéro d'un proche : aucun compte ne correspond au payeur.
const lateA = currentCell(circles[C_PAYMENT_MISSING]!.id, 'LATE')!;
const userA = userById(lateA.userId);
const payA = addPayment({
  provider: 'ORANGE_MONEY', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: fakePhone(70),
  amount: circles[C_PAYMENT_MISSING]!.contribution, status: 'COMPLETED', createdAt: hoursAgo(26), confirmedAt: hoursAgo(26), matched: false,
  unmatchedReason: 'Numéro payeur lié à aucun compte Venega',
});
// B. Mauvais montant.
const lateB = currentCell(circles[C_FAILED_PAYOUT]!.id, 'LATE')!;
const userB = userById(lateB.userId);
addPayment({
  provider: 'MOOV_MONEY', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: userB.phoneNumber, userId: userB.id, userName: userB.displayName,
  circleId: circles[C_FAILED_PAYOUT]!.id, circleName: circles[C_FAILED_PAYOUT]!.name,
  amount: 4000, status: 'COMPLETED', createdAt: hoursAgo(30), confirmedAt: hoursAgo(30), matched: false,
  unmatchedReason: 'Montant différent de la cotisation (4 000 F CFA au lieu de 5 000 F CFA)',
});
// C. Confirmation opérateur arrivée trop tard : le membre a été compté en retard puis exclu.
const cExcl = circles[C_EXCLUSION]!;
const excludedMember = cExcl.members.find((m) => m.status === 'EXCLUDED')!;
const payC = addPayment({
  provider: 'ORANGE_MONEY', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: excludedMember.phoneNumber, userId: excludedMember.userId,
  userName: excludedMember.name, circleId: cExcl.id, circleName: cExcl.name, turn: cExcl.currentTurn,
  amount: cExcl.contribution, status: 'COMPLETED', createdAt: daysAgo(4), confirmedAt: iso(NOW - 4 * DAY + 11 * 60_000), matched: false,
  unmatchedReason: 'Confirmation de l’opérateur reçue après expiration du délai (3 min)',
});
// D. Double paiement (aucun remboursement demandé encore).
const paidD = currentCell(circles[C_DOUBLE_PAY]!.id, 'PAID')!;
const userD = userById(paidD.userId);
const firstD = payments.find((p) => p.id === paidD.paymentId)!;
addPayment({
  provider: firstD.provider, direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: userD.phoneNumber, userId: userD.id, userName: userD.displayName,
  circleId: circles[C_DOUBLE_PAY]!.id, circleName: circles[C_DOUBLE_PAY]!.name, turn: paidD.turn,
  amount: paidD.amount, status: 'COMPLETED', createdAt: iso(new Date(firstD.createdAt).getTime() + 4 * 60_000),
  confirmedAt: iso(new Date(firstD.createdAt).getTime() + 5 * 60_000), matched: false,
  unmatchedReason: 'Cotisation déjà payée pour ce tour (double paiement probable)',
});
// E. Payeur inconnu.
addPayment({
  provider: 'WAVE', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: fakePhone(95),
  amount: 25000, status: 'COMPLETED', createdAt: daysAgo(3), confirmedAt: daysAgo(3), matched: false,
  unmatchedReason: 'Aucun compte ni cercle correspondant',
});

// Paiements bloqués en attente de confirmation.
for (const [ci, h] of [[7, 2], [11, 5]] as const) {
  const cell = currentCell(circles[ci]!.id, 'LATE') ?? currentCell(circles[ci]!.id, 'PENDING');
  if (!cell) continue;
  const u = userById(cell.userId);
  addPayment({
    provider: 'MOOV_MONEY', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: u.phoneNumber, userId: u.id, userName: u.displayName,
    circleId: circles[ci]!.id, circleName: circles[ci]!.name, turn: cell.turn, amount: cell.amount,
    status: 'PENDING', createdAt: hoursAgo(h), matched: false, withProviderRef: false,
  });
}

// Paiements échoués : rafale sur un compte (alerte fraude) + échecs ordinaires.
const FAIL_REASONS = ['Solde insuffisant', 'Code PIN erroné', 'Délai de confirmation dépassé', 'Annulé par l’utilisateur'];
{
  const u = userAt(9);
  const c = circles.find((x) => x.members.some((m) => m.userId === u.id));
  for (let k = 0; k < 7; k++) {
    addPayment({
      provider: 'ORANGE_MONEY', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: k % 3 === 0 ? u.phoneNumber : fakePhone(100 + k),
      userId: u.id, userName: u.displayName, circleId: c?.id, circleName: c?.name, amount: c?.contribution ?? 5000,
      status: 'FAILED', failureReason: FAIL_REASONS[k % 2]!, createdAt: iso(NOW - 7 * 3_600_000 - k * 3 * 60_000), matched: false, withProviderRef: false,
    });
  }
}
contributions
  .filter((c) => c.status === 'LATE')
  .slice(0, 6)
  .forEach((cell, k) => {
    const u = userById(cell.userId);
    const c = circleById(cell.circleId);
    addPayment({
      provider: PROVIDERS[k % 3]!, direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: u.phoneNumber, userId: u.id, userName: u.displayName,
      circleId: c.id, circleName: c.name, turn: cell.turn, amount: cell.amount, status: 'FAILED',
      failureReason: FAIL_REASONS[k % FAIL_REASONS.length]!, createdAt: hoursAgo(20 + k * 9), matched: false, withProviderRef: false,
    });
  });

/* ── Remboursements ───────────────────────────────────────────────────── */

const refunds: Refund[] = [];
{
  // Double paiement déjà pris en charge : remboursement demandé, en attente de la Finance.
  const c = circles[C_REPLACEMENT]!;
  const cell = contributions.find((x) => x.circleId === c.id && x.turn === 1 && x.userId === c.members[1]!.userId)!;
  const u = userById(cell.userId);
  const dup = addPayment({
    provider: 'WAVE', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: u.phoneNumber, userId: u.id, userName: u.displayName,
    circleId: c.id, circleName: c.name, turn: 1, amount: c.contribution, status: 'COMPLETED',
    createdAt: daysAgo(5), confirmedAt: daysAgo(5), matched: true, matchedBy: 'Awa (Support)', matchedAt: daysAgo(4),
    matchNote: 'Double paiement : remboursement demandé', unmatchedReason: 'Cotisation déjà payée pour ce tour (double paiement probable)',
  });
  refunds.push({
    id: 'rf001', paymentId: dup.id, paymentReference: dup.reference, providerReference: dup.providerReference, provider: dup.provider,
    userId: u.id, userName: u.displayName, destination: u.phoneNumber, amount: dup.amount, reason: 'Double paiement de la cotisation du tour 1',
    status: 'REQUESTED', createdAt: daysAgo(4),
    history: [{ at: daysAgo(4), by: 'Awa (Support)', status: 'REQUESTED', note: 'Appel du membre, deux SMS Wave identiques à 4 min d’intervalle.' }],
  });
}
{
  const u = userAt(4);
  const old = addPayment({
    provider: 'ORANGE_MONEY', direction: 'IN', purpose: 'CONTRIBUTION', payerPhone: u.phoneNumber, userId: u.id, userName: u.displayName,
    amount: 50000, status: 'COMPLETED', createdAt: daysAgo(21), confirmedAt: daysAgo(21), matched: true, matchedBy: 'Issa (Finance)',
    matchedAt: daysAgo(20), matchNote: 'Montant erroné (50 000 au lieu de 5 000) : remboursé', unmatchedReason: 'Montant différent de la cotisation',
  });
  const out = addPayment({
    provider: 'ORANGE_MONEY', direction: 'OUT', purpose: 'REFUND', payerPhone: u.phoneNumber, userId: u.id, userName: u.displayName,
    amount: 50000, status: 'COMPLETED', createdAt: daysAgo(18), confirmedAt: daysAgo(18), matched: true,
  });
  refunds.push({
    id: 'rf002', paymentId: old.id, paymentReference: old.reference, providerReference: old.providerReference, provider: old.provider,
    userId: u.id, userName: u.displayName, destination: u.phoneNumber, amount: 50000, reason: 'Mauvais montant saisi (50 000 au lieu de 5 000 F CFA)',
    status: 'PAID', createdAt: daysAgo(20),
    history: [
      { at: daysAgo(20), by: 'Issa (Finance)', status: 'REQUESTED', note: 'Signalé par téléphone.' },
      { at: daysAgo(19), by: 'Responsable plateforme', status: 'APPROVED', note: 'Montant vérifié sur le relevé Orange Money.' },
      { at: daysAgo(18), by: 'Issa (Finance)', status: 'PAID', note: `Remboursé, transaction ${out.reference}.` },
    ],
  });
}
const rejectedRefundPayment = payments.find((x) => x.userId === userAt(15).id && x.direction === 'IN' && x.status === 'COMPLETED');
if (rejectedRefundPayment) {
  const u = userAt(15);
  const p = rejectedRefundPayment;
  refunds.push({
    id: 'rf003', paymentId: p.id, paymentReference: p.reference, providerReference: p.providerReference, provider: p.provider,
    userId: u.id, userName: u.displayName, destination: u.phoneNumber, amount: p.amount, reason: 'Ne veut plus participer au cercle',
    status: 'REJECTED', createdAt: daysAgo(15),
    history: [
      { at: daysAgo(15), by: 'Boubacar (Support)', status: 'REQUESTED', note: 'Demande de l’utilisateur.' },
      { at: daysAgo(14), by: 'Issa (Finance)', status: 'REJECTED', note: 'Cotisation valide déjà versée au bénéficiaire du tour : passer par une demande de départ.' },
    ],
  });
}

/* ── Caisses de solidarité : demandes d'aide et grand livre ──────────── */

function solidarityReq(ci: number, r: Omit<SolidarityRequest, 'id' | 'circleId' | 'userId' | 'userName' | 'eligibleVoters' | 'validatorsTotal'> & { member: number }) {
  const c = circles[ci]!;
  const m = c.members[r.member]!;
  const { member: _m, ...rest } = r;
  solidarityRequests.push({
    id: `sr-${c.id}-${solidarityRequests.length + 1}`, circleId: c.id, userId: m.userId, userName: m.name,
    eligibleVoters: c.members.length - 1, validatorsTotal: 2, ...rest,
  });
}
solidarityReq(C_SOLIDARITY_UNPAID, { member: 6, eventLabel: 'Décès', reason: 'Décès du père', amount: 40000, status: 'DISBURSED', createdAt: daysAgo(30), voteDeadline: daysAgo(27), votesFor: 9, votesAgainst: 0, validatorsApproved: 2, approvedAt: daysAgo(27), disbursedAt: daysAgo(26) });
solidarityReq(C_SOLIDARITY_UNPAID, { member: 4, eventLabel: 'Hospitalisation', reason: 'Hospitalisation de sa fille au CHU Yalgado', amount: 60000, status: 'APPROVED', createdAt: daysAgo(9), voteDeadline: daysAgo(7), votesFor: 8, votesAgainst: 1, validatorsApproved: 2, approvedAt: daysAgo(6) });
solidarityReq(C_VOTE_BLOCKED, { member: 5, eventLabel: 'Maladie', reason: 'Accident de moto, plâtre et médicaments', amount: 25000, status: 'VOTING', createdAt: daysAgo(8), voteDeadline: daysAgo(3), votesFor: 4, votesAgainst: 1, validatorsApproved: 0 });
solidarityReq(7, { member: 3, eventLabel: 'Naissance', reason: 'Naissance de jumeaux', amount: 50000, status: 'DISBURSED', createdAt: daysAgo(45), voteDeadline: daysAgo(42), votesFor: 10, votesAgainst: 0, validatorsApproved: 2, approvedAt: daysAgo(41), disbursedAt: daysAgo(40) });
solidarityReq(7, { member: 8, eventLabel: 'Mariage', reason: 'Mariage', amount: 100000, status: 'REJECTED', createdAt: daysAgo(22), voteDeadline: daysAgo(19), votesFor: 3, votesAgainst: 7, validatorsApproved: 0, decisionNote: 'Refusée par vote : le mariage n’est pas couvert par le règlement.' });
solidarityReq(10, { member: 2, eventLabel: 'Scolarité', reason: 'Frais d’examen du BEPC', amount: 15000, status: 'VOTING', createdAt: daysAgo(1), voteDeadline: iso(NOW + 2 * DAY), votesFor: 3, votesAgainst: 0, validatorsApproved: 0 });

for (const c of circles.filter((x) => x.kind === 'SOLIDARITY')) {
  const seed = CIRCLE_SEED[circles.indexOf(c)]!;
  const entries: Omit<LedgerEntry, 'balanceAfter'>[] = [];
  const firstVisible = Math.max(1, seed.turn - 5);
  if (firstVisible > 1) {
    entries.push({ id: `le-${c.id}-0`, circleId: c.id, type: 'CREDIT', amount: (firstVisible - 1) * c.members.length * c.contribution, label: `Cotisations des périodes 1 à ${firstVisible - 1}`, at: c.cycleStartedAt });
  }
  for (let t = firstVisible; t <= seed.turn; t++) {
    const cells = contributions.filter((x) => x.circleId === c.id && x.turn === t && x.paidAt);
    if (cells.length === 0) continue;
    const at = cells.map((x) => x.paidAt!).sort().at(-1)!;
    entries.push({ id: `le-${c.id}-${t}`, circleId: c.id, type: 'CREDIT', amount: cells.reduce((n, x) => n + x.amount, 0), label: `Cotisations période ${t} (${cells.length} membres)`, at });
  }
  for (const r of solidarityRequests.filter((x) => x.circleId === c.id && x.status === 'DISBURSED')) {
    entries.push({ id: `le-${r.id}`, circleId: c.id, type: 'DEBIT', amount: r.amount, label: `Aide versée — ${r.userName} (${r.eventLabel})`, at: r.disbursedAt! });
  }
  entries.sort((a, b) => a.at.localeCompare(b.at));
  let balance = 0;
  for (const e of entries) {
    balance += e.type === 'CREDIT' ? e.amount : -e.amount;
    ledger.push({ ...e, balanceAfter: balance });
  }
  for (const r of solidarityRequests.filter((x) => x.circleId === c.id)) {
    addEvent({ circleId: c.id, at: r.createdAt, label: `Demande d’aide : ${r.eventLabel}`, actor: r.userName, detail: `${r.amount.toLocaleString('fr-FR')} F CFA`, tone: 'neutral' });
    if (r.disbursedAt) addEvent({ circleId: c.id, at: r.disbursedAt, label: 'Aide décaissée', actor: 'Trésorier(e)', detail: `${r.userName} · ${r.amount.toLocaleString('fr-FR')} F CFA`, tone: 'green' });
  }
}

/* ── Statistiques des cercles (recalculées après chaque action admin) ── */

export function refreshCircle(circleId: string): void {
  const c = circleById(circleId);
  const cells = contributions.filter((x) => x.circleId === circleId);
  const active = c.members.filter((m) => m.status === 'ACTIVE');
  for (const m of c.members) {
    const mine = cells.filter((x) => x.userId === m.userId);
    m.lateCount = mine.filter((x) => x.status === 'LATE').length;
    m.paidLateCount = Math.max(m.paidLateCount, mine.filter((x) => x.status === 'PAID_LATE').length);
    const cur = mine.find((x) => x.turn === c.currentTurn);
    m.paymentStatus = !cur || cur.status === 'PAID' || cur.status === 'PAID_LATE' ? 'PAID' : cur.status === 'LATE' ? 'LATE' : 'PENDING';
  }
  c.memberCount = active.length;
  c.latePayments = cells.filter((x) => x.status === 'LATE' && active.some((m) => m.userId === x.userId)).length;
  c.collectedThisPeriod = cells.filter((x) => x.turn === c.currentTurn && x.paidAt).reduce((n, x) => n + x.amount, 0);
  const founder = c.members.find((m) => m.userId === c.founderId);
  c.founderName = founder?.name ?? c.founderName;
  // Le versement du tour en cours devient « À verser » dès que toutes les cotisations actives sont payées.
  const current = payouts.find((p) => p.circleId === circleId && p.turn === c.currentTurn);
  if (current && (current.status === 'WAITING' || current.status === 'READY')) {
    const allPaid = cells.filter((x) => x.turn === c.currentTurn && active.some((m) => m.userId === x.userId)).every((x) => x.paidAt);
    current.status = allPaid ? 'READY' : 'WAITING';
  }
  c.overduePayouts = payouts.filter(
    (p) => p.circleId === circleId && (p.status === 'FAILED' || (p.status === 'READY' && new Date(p.dueDate).getTime() < Date.now() - 2 * DAY)),
  ).length;
  const lastLedger = ledger.filter((e) => e.circleId === circleId).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
  c.solidarityBalance = lastLedger?.balanceAfter ?? 0;
}

circles.forEach((c) => refreshCircle(c.id));

/* ── Rappels et notifications ─────────────────────────────────────────── */

const notifications: UserNotification[] = [];
let notifCounter = 0;
function notify(n: Omit<UserNotification, 'id'>) {
  const u = userById(n.userId);
  const pushFails = n.channel === 'PUSH' && !u.security.pushTokenRegistered;
  notifications.push({
    id: `nt${++notifCounter}`,
    ...n,
    status: pushFails ? 'FAILED' : n.status,
    failureReason: pushFails ? 'Aucun jeton push valide (application désinstallée ou notifications désactivées)' : n.failureReason,
  });
}

for (const c of circles) {
  for (const m of c.members) {
    const recent = contributions
      .filter((x) => x.circleId === c.id && x.userId === m.userId && x.paidAt)
      .sort((a, b) => b.turn - a.turn)
      .slice(0, 2);
    for (const cell of recent) {
      notify({ userId: m.userId, type: 'PAYMENT_RECEIVED', title: `Cotisation reçue — ${c.name} (tour ${cell.turn})`, channel: 'PUSH', status: 'DELIVERED', circleId: c.id, sentAt: cell.paidAt! });
    }
    if (m.lateCount > 0) {
      m.remindersSent = 1 + (m.userId.charCodeAt(3) % 2);
      for (let k = 0; k < m.remindersSent; k++) {
        const at = hoursAgo(20 + k * 24);
        notify({ userId: m.userId, type: 'PAYMENT_REMINDER', title: `Rappel : cotisation de ${c.contribution.toLocaleString('fr-FR')} F CFA en retard — ${c.name}`, channel: k === 0 ? 'SMS' : 'PUSH', status: 'DELIVERED', circleId: c.id, sentAt: at });
        m.lastReminderAt = at;
      }
    }
  }
  for (const p of payouts.filter((x) => x.circleId === c.id && x.paidAt)) {
    notify({ userId: p.beneficiaryId, type: 'PAYOUT', title: `Cagnotte du tour ${p.turn} reçue — ${c.name}`, channel: 'SMS', status: 'DELIVERED', circleId: c.id, sentAt: p.paidAt! });
  }
}
for (const d of kycDecisions) {
  notify({ userId: d.userId, type: 'KYC_DECISION', title: d.decision === 'VERIFIED' ? 'Identité vérifiée' : 'Vérification d’identité refusée', channel: 'PUSH', status: 'DELIVERED', sentAt: d.decidedAt });
}
for (let k = 0; k < 4; k++) {
  notify({ userId: userAt(U_OTP_FAIL).id, type: 'OTP', title: 'Code de vérification', channel: 'SMS', status: 'FAILED', failureReason: 'Numéro injoignable (téléphone éteint ou hors réseau)', sentAt: minutesAgo(12 + k * 95) });
}
notify({ userId: userAt(U_RESET).id, type: 'PASSWORD_RESET', title: 'Code de réinitialisation du mot de passe', channel: 'SMS', status: 'DELIVERED', sentAt: hoursAgo(3) });
notify({ userId: userAt(U_LOCKED).id, type: 'SECURITY', title: 'Compte verrouillé après 5 essais', channel: 'SMS', status: 'DELIVERED', sentAt: minutesAgo(35) });

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
  const collected = Math.round((f.goal * f.collectedPct) / 100 / 500) * 500;
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
    collected,
    contributorsCount: Math.round(f.collectedPct * 0.9),
    withdrawn: f.status === 'CLOSED' || (f.status === 'ACTIVE' && f.collectedPct >= 60) ? Math.round((collected * 0.5) / 500) * 500 : 0,
    withdrawalsFrozen: f.status === 'SUSPENDED',
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
    moderatedBy: f.status === 'SUSPENDED' || f.status === 'CLOSED' ? 'Responsable plateforme' : undefined,
  };
});

/* ── Alertes de fraude ────────────────────────────────────────────────── */

const dupA = users[4]!;
const dupB = users[18]!;
const reported = fundraisers[3]!;
const reported2 = fundraisers[11]!;
const solidarityCircle = circles[C_SOLIDARITY_UNPAID]!;

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
    subjects: [{ kind: 'circle', id: solidarityCircle.id, label: solidarityCircle.name }],
  },
  {
    id: 'al009', type: 'DUPLICATE_DOCUMENT', severity: 'HIGH', status: 'RESOLVED', createdAt: daysAgo(6),
    title: 'Même CNIB sur deux comptes',
    description: 'Compte secondaire identifié et suspendu.',
    subjects: [{ kind: 'user', id: userAt(13).id, label: userAt(13).displayName }],
    resolvedAt: daysAgo(5), resolvedBy: 'Responsable plateforme', resolutionNote: 'Compte doublon suspendu, KYC refusé.',
  },
  {
    id: 'al010', type: 'FAILED_PAYMENTS', severity: 'MEDIUM', status: 'RESOLVED', createdAt: daysAgo(9),
    title: '5 paiements Moov Money échoués',
    description: 'Incident opérateur confirmé ce jour-là.',
    subjects: [{ kind: 'user', id: userAt(2).id, label: userAt(2).displayName }],
    resolvedAt: daysAgo(8), resolvedBy: 'Issa (Finance)', resolutionNote: 'Incident Moov Money, pas de fraude.',
  },
  {
    id: 'al011', type: 'FUNDRAISER_REPORTED', severity: 'HIGH', status: 'RESOLVED', createdAt: daysAgo(4),
    title: 'Cagnotte signalée 2 fois',
    description: 'Ordonnance contestée par un proche.',
    subjects: [{ kind: 'fundraiser', id: fundraisers[4]!.id, label: fundraisers[4]!.title }],
    resolvedAt: daysAgo(1), resolvedBy: 'Responsable plateforme', resolutionNote: 'Cagnotte suspendue en attente de justificatifs.',
  },
];

/* ── Tickets (appels) ─────────────────────────────────────────────────── */

let ticketCounter = 1000;
const tickets: Ticket[] = [];
function ticket(t: Omit<Ticket, 'id' | 'number' | 'updatedAt' | 'notes' | 'createdBy'> & { notes?: string[]; createdBy?: string; updatedAt?: string }) {
  const n = ++ticketCounter;
  const author = t.createdBy ?? t.assignee ?? 'Awa (Support)';
  tickets.push({
    ...t,
    id: `tk${n}`,
    number: `T-${n}`,
    createdBy: author,
    updatedAt: t.updatedAt ?? t.createdAt,
    notes: (t.notes ?? []).map((text, k) => ({ id: `tn-${n}-${k}`, at: iso(new Date(t.createdAt).getTime() + (k + 1) * 3_600_000), author, text })),
  });
}
const cMissing = circles[C_PAYMENT_MISSING]!;
const cFailed = circles[C_FAILED_PAYOUT]!;
const failedPayout = payouts.find((p) => p.circleId === cFailed.id && p.status === 'FAILED')!;
const cAbsent = circles[C_FOUNDER_ABSENT]!;
const movedMember = cAbsent.members[3]!;

ticket({
  category: 'PAYMENT_MISSING', priority: 'HIGH', status: 'OPEN', createdAt: hoursAgo(4), assignee: 'Issa (Finance)',
  userId: userA.id, userName: userA.displayName, circleId: cMissing.id, circleName: cMissing.name, callerPhone: userA.phoneNumber,
  description: `A payé sa cotisation du tour ${cMissing.currentTurn} depuis le téléphone de son mari (${fakePhone(70).replace('+226', '+226 ')}). Référence Orange Money donnée au téléphone : ${payA.providerReference}. Apparaît en retard dans l’app.`,
});
ticket({
  category: 'LOGIN_OTP', priority: 'NORMAL', status: 'OPEN', createdAt: minutesAgo(40),
  userId: userAt(U_OTP_FAIL).id, userName: userAt(U_OTP_FAIL).displayName, callerPhone: userAt(U_OTP_FAIL).phoneNumber,
  description: 'Ne reçoit pas le code SMS à l’inscription, a essayé 4 fois.',
});
ticket({
  category: 'PHONE_CHANGE', priority: 'HIGH', status: 'IN_PROGRESS', createdAt: hoursAgo(6), assignee: 'Awa (Support)',
  userId: userAt(U_LOST_SIM).id, userName: userAt(U_LOST_SIM).displayName, callerPhone: fakePhone(91),
  description: 'Téléphone volé au marché, appelle depuis un nouveau numéro. Une session inconnue est active à Bobo-Dioulasso.',
  notes: ['Identité à vérifier avec le numéro de CNIB avant tout changement.'],
});
ticket({
  category: 'PAYOUT_MISSING', priority: 'HIGH', status: 'OPEN', createdAt: hoursAgo(9),
  userId: failedPayout.beneficiaryId, userName: failedPayout.beneficiaryName, circleId: cFailed.id, circleName: cFailed.name,
  callerPhone: userById(failedPayout.beneficiaryId).phoneNumber,
  description: `N’a pas reçu la cagnotte du tour ${failedPayout.turn} alors que tout le monde a payé.`,
});
ticket({
  category: 'FOUNDER_ISSUE', priority: 'HIGH', status: 'OPEN', createdAt: hoursAgo(2),
  userId: movedMember.userId, userName: movedMember.name, circleId: cAbsent.id, circleName: cAbsent.name, callerPhone: movedMember.phoneNumber,
  description: 'Le fondateur ne répond plus depuis une semaine, la cagnotte du tour 4 n’est pas versée. Il a aussi déplacé mon tour de 4 à 9 sans me prévenir.',
});
ticket({
  category: 'MEMBERSHIP', priority: 'NORMAL', status: 'IN_PROGRESS', createdAt: daysAgo(1), assignee: 'Boubacar (Support)',
  userId: excludedMember.userId, userName: excludedMember.name, circleId: cExcl.id, circleName: cExcl.name, callerPhone: excludedMember.phoneNumber,
  description: `Exclu(e) pour retards alors qu’il/elle dit avoir payé il y a 4 jours (référence ${payC.providerReference}).`,
  notes: ['Paiement retrouvé dans la file « à rapprocher ». À rattacher par la Finance avant d’annuler l’exclusion.'],
});
ticket({
  category: 'NOTIFICATIONS', priority: 'LOW', status: 'OPEN', createdAt: daysAgo(2),
  userId: userAt(U_NO_PUSH).id, userName: userAt(U_NO_PUSH).displayName, callerPhone: userAt(U_NO_PUSH).phoneNumber,
  description: 'Ne reçoit plus les rappels de cotisation sur son téléphone.',
});
ticket({
  category: 'KYC', priority: 'NORMAL', status: 'RESOLVED', createdAt: daysAgo(12), resolvedAt: daysAgo(11), updatedAt: daysAgo(11),
  userId: userAt(5).id, userName: userAt(5).displayName, callerPhone: userAt(5).phoneNumber, assignee: 'Fatimata (Agent KYC)',
  description: 'Demande pourquoi son KYC est refusé.',
  notes: ['Photo floue : expliqué comment reprendre la photo à la lumière du jour. Nouvel envoi conseillé.'],
});
ticket({
  category: 'FUNDRAISER_FRAUD', priority: 'HIGH', status: 'IN_PROGRESS', createdAt: hoursAgo(5), assignee: 'Responsable plateforme',
  fundraiserId: reported.id, fundraiserTitle: reported.title, userId: reported.organizerId, userName: reported.organizerName,
  description: 'Un contributeur signale que les photos viennent d’un article de presse de 2022.',
});

/* ── Notes du support ─────────────────────────────────────────────────── */

const notes: SupportNote[] = [
  { id: 'nt-1', userId: userAt(U_LOST_SIM).id, text: 'A appelé depuis un numéro inconnu. Ne rien changer sans vérification CNIB.', author: 'Awa (Support)', at: hoursAgo(6) },
  { id: 'nt-2', circleId: cAbsent.id, text: 'Trois membres ont appelé au sujet du fondateur. Injoignable au 2e essai.', author: 'Boubacar (Support)', at: hoursAgo(1) },
];

/* ── Journal ──────────────────────────────────────────────────────────── */

const audit: AuditEntry[] = [
  ...kycDecisions.slice(0, 8).map(
    (d): AuditEntry => ({
      id: `aud-${d.id}`,
      at: d.decidedAt,
      actor: d.decidedBy,
      actorRole: 'Agent KYC',
      action: d.decision === 'VERIFIED' ? 'KYC validé' : 'KYC refusé',
      targetType: 'kyc',
      targetId: d.userId,
      targetLabel: d.userName,
      before: 'En attente',
      after: d.decision === 'VERIFIED' ? 'Vérifié' : 'Refusé',
      reason: d.reason,
      localOnly: false,
    }),
  ),
  ...fundraisers
    .filter((f) => f.moderatedAt)
    .map(
      (f): AuditEntry => ({
        id: `aud-${f.id}`,
        at: f.moderatedAt!,
        actor: f.moderatedBy ?? 'Admin',
        actorRole: 'Super admin',
        action: f.status === 'SUSPENDED' ? 'Cagnotte suspendue' : 'Cagnotte clôturée',
        targetType: 'fundraiser',
        targetId: f.id,
        targetLabel: f.title,
        before: 'Active',
        after: f.status === 'SUSPENDED' ? 'Suspendue' : 'Clôturée',
        reason: f.moderationNote,
        relatedIds: [f.organizerId],
        localOnly: false,
      }),
    ),
  ...alerts
    .filter((a) => a.status === 'RESOLVED')
    .map(
      (a): AuditEntry => ({
        id: `aud-${a.id}`,
        at: a.resolvedAt!,
        actor: a.resolvedBy ?? 'Admin',
        action: 'Alerte traitée',
        targetType: 'alert',
        targetId: a.id,
        targetLabel: a.title,
        reason: a.resolutionNote,
        relatedIds: a.subjects.map((s) => s.id),
        localOnly: false,
      }),
    ),
  {
    id: 'aud-phone-1', at: daysAgo(45), actor: 'Awa (Support)', actorRole: 'Support', action: 'Numéro de téléphone changé',
    targetType: 'user', targetId: userAt(U_PHONE_CHANGED).id, targetLabel: userAt(U_PHONE_CHANGED).displayName,
    before: fakePhone(80), after: userAt(U_PHONE_CHANGED).phoneNumber, reason: 'Puce volée, identité vérifiée par la CNIB', localOnly: false,
  },
  {
    id: 'aud-susp-1', at: daysAgo(5), actor: 'Responsable plateforme', actorRole: 'Super admin', action: 'Compte suspendu',
    targetType: 'user', targetId: userAt(U_SUSPENDED).id, targetLabel: userAt(U_SUSPENDED).displayName,
    before: 'Actif', after: 'Suspendu', reason: 'Plusieurs comptes avec la même CNIB', localOnly: false,
  },
  ...refunds.flatMap((r) =>
    r.history.map(
      (h, k): AuditEntry => ({
        id: `aud-${r.id}-${k}`, at: h.at, actor: h.by, action: `Remboursement : ${h.status === 'REQUESTED' ? 'demandé' : h.status === 'APPROVED' ? 'approuvé' : h.status === 'PAID' ? 'versé' : 'refusé'}`,
        targetType: 'refund', targetId: r.id, targetLabel: `${r.userName} · ${r.amount.toLocaleString('fr-FR')} F CFA`,
        reason: h.note, relatedIds: [r.userId ?? '', r.paymentId], localOnly: false,
      }),
    ),
  ),
];

for (const u of users) {
  u.circlesCount = circles.filter((c) => c.members.some((m) => m.userId === u.id && m.status === 'ACTIVE')).length;
}

export const db = {
  users,
  sessions,
  kycSubmissions,
  kycDecisions,
  fundraisers,
  alerts,
  circles,
  contributions,
  payouts,
  requests,
  orderChanges,
  circleEvents,
  solidarityRequests,
  ledger,
  payments,
  refunds,
  tickets,
  notifications,
  notes,
  audit,
  nextTicketNumber: () => ++ticketCounter,
  nextPaymentReference: () => `VP-${100400 + ++payCounter}`,
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
