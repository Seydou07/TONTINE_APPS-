/**
 * Historique des opérations (démo, mêmes données que ActivityScreen.tsx mobile).
 *
 * TODO API: `GET /transactions/my` (et `GET /transactions/circle/:circleId`), voir
 * docs/api-mobile.md section 3. Les décaissements de solidarité viendront de
 * `GET /solidarity/circles/:id/ledger` (section 5).
 */
import { mockCircles, mockTransactions, TransactionStatus, TransactionType } from '@venega/types';
import { getLedgerEntries } from '@/features/circles/store';

export type ActivityItem = {
  id: string;
  circleId: string;
  /** Type de transaction, plus deux types d'affichage : FEE_PAYMENT, SOLIDARITY_DISBURSEMENT. */
  type: string;
  amount: number;
  status: TransactionStatus;
  memberName: string;
  providerReference?: string;
  createdAt: string;
  circleName: string;
};

/** Transactions synthétiques du mobile : Cotisation, Versement, Frais. */
const EXTENDED_TX = [
  {
    id: 'tx-1',
    circleId: 'c1',
    type: TransactionType.TONTINE_CONTRIBUTION as string,
    amount: 10500,
    status: TransactionStatus.COMPLETED,
    memberName: 'Aminata Diallo',
    providerReference: 'PAY-884912',
    createdAt: '2026-08-11T10:15:00Z',
  },
  {
    id: 'tx-2',
    circleId: 'c1',
    type: TransactionType.PAYOUT as string,
    amount: 60000,
    status: TransactionStatus.COMPLETED,
    memberName: 'Seydou Ouattara',
    providerReference: 'TX-993810',
    createdAt: '2026-08-11T09:45:00Z',
  },
  {
    id: 'tx-3',
    circleId: 'c1',
    type: 'FEE_PAYMENT',
    amount: 2700,
    status: TransactionStatus.COMPLETED,
    memberName: 'Fondateur net (90%)',
    providerReference: 'FEE-202608',
    createdAt: '2026-08-11T09:45:00Z',
  },
  {
    id: 'tx-4',
    circleId: 'c2',
    type: TransactionType.TONTINE_CONTRIBUTION as string,
    amount: 25000,
    status: TransactionStatus.COMPLETED,
    memberName: 'Ibrahim Sawadogo',
    providerReference: 'PAY-774102',
    createdAt: '2026-08-10T16:20:00Z',
  },
  {
    id: 'tx-5',
    circleId: 'c1',
    type: TransactionType.SOLIDARITY_CONTRIBUTION as string,
    amount: 2000,
    status: TransactionStatus.COMPLETED,
    memberName: 'Fatou Traoré',
    providerReference: 'SOL-554201',
    createdAt: '2026-08-09T14:10:00Z',
  },
];

export function getActivity(): ActivityItem[] {
  const enriched: ActivityItem[] = [...EXTENDED_TX, ...mockTransactions].map((tx) => ({
    id: tx.id,
    circleId: tx.circleId,
    type: tx.type,
    amount: tx.amount,
    status: tx.status,
    memberName: tx.memberName,
    providerReference: tx.providerReference,
    createdAt: tx.createdAt,
    circleName: mockCircles.find((c) => c.id === tx.circleId)?.name ?? 'Tontine Familiale',
  }));

  // Décaissements de la caisse de solidarité (traces du grand livre de chaque cercle).
  const disbursements: ActivityItem[] = mockCircles
    .filter((c) => c.solidarityAmount > 0)
    .flatMap((c) => getLedgerEntries(c.id).filter((e) => e.type === 'DEBIT'))
    .map((e) => ({
      id: e.id,
      circleId: e.circleId,
      type: 'SOLIDARITY_DISBURSEMENT',
      amount: e.amount,
      status: TransactionStatus.COMPLETED,
      memberName: e.memberName ?? '',
      providerReference: e.relatedTransactionId,
      createdAt: e.createdAt,
      circleName: mockCircles.find((c) => c.id === e.circleId)?.name ?? '',
    }));

  return [...enriched, ...disbursements];
}
