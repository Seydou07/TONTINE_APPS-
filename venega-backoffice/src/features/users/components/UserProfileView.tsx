'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Headphones } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  FilterTabs,
  ImageThumb,
  ImageViewer,
  LoadingState,
  Notice,
  Pagination,
  PhoneLinks,
  Table,
  Tabs,
  Td,
  Th,
  Tr,
  type ViewerImage,
} from '@/components/ui';
import { formatDate, formatDateTime, formatPhone, formatRelative, formatXOF, formatAge } from '@/lib/format';
import { useCan } from '@/features/auth/SessionContext';
import { KycStatusBadge } from '@/features/kyc/components/KycStatusBadge';
import { SeverityBadge } from '@/features/alerts/components/SeverityBadge';
import { CircleKindBadge, PaymentStatusBadge, PayoutStatusBadge, RequestStatusBadge } from '@/features/circles/components/CircleBadges';
import { listUserRequests } from '@/features/circles/api';
import { REQUEST_TYPE_LABEL, roleLabel, type PayoutStatus } from '@/features/circles/types';
import { listPayments, listRefunds } from '@/features/payments/api';
import { PaymentsTable } from '@/features/payments/components/PaymentsTable';
import { ReconcileDialog } from '@/features/payments/components/ReconcileDialog';
import { RefundRequestDialog } from '@/features/payments/components/RefundRequestDialog';
import { RefundsTable } from '@/features/payments/components/RefundsTable';
import type { Payment, PaymentStatus } from '@/features/payments/types';
import { listUserNotifications } from '@/features/notifications/api';
import { NOTIFICATION_STATUS_LABEL, NOTIFICATION_TYPE_LABEL, type NotificationStatus } from '@/features/notifications/types';
import { listTickets } from '@/features/tickets/api';
import { CreateTicketDialog } from '@/features/tickets/components/CreateTicketDialog';
import { TicketDetailDialog } from '@/features/tickets/components/TicketDetailDialog';
import { TicketsTable } from '@/features/tickets/components/TicketsTable';
import { AuditTrail } from '@/features/audit/components/AuditTrail';
import { NotesPanel } from '@/features/audit/components/NotesPanel';
import { getUserDetail, type UserDetail } from '../api';
import { UserAccessCard } from './UserAccessCard';

type Tab = 'overview' | 'payments' | 'circles' | 'requests' | 'notifications' | 'devices' | 'support' | 'history';

/** Fiche utilisateur 360° : tout ce qu'il faut pour répondre à quelqu'un au téléphone. */
export function UserProfileView({ id }: { id: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const tab = (sp.get('tab') as Tab) ?? 'overview';
  const [creatingTicket, setCreatingTicket] = useState(false);
  const query = useQuery({ queryKey: ['users', 'detail', id], queryFn: () => getUserDetail(id) });
  const d = query.data;

  const back = (
    <Link href="/users" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-brand">
      <ArrowLeft size={16} /> Utilisateurs
    </Link>
  );
  if (query.isError) return <>{back}<Card><ErrorState error={query.error} /></Card></>;
  if (query.isLoading) return <>{back}<Card><LoadingState /></Card></>;
  if (!d) return <>{back}<Card><EmptyState title="Utilisateur introuvable" /></Card></>;
  const u = d.user;
  const late = d.circles.reduce((n, c) => n + c.lateCount, 0);
  const failedPayouts = d.payouts.filter((p) => p.status === 'FAILED').length;
  const setTab = (t: Tab) => router.replace(t === 'overview' ? `/users/${id}` : `/users/${id}?tab=${t}`, { scroll: false });

  return (
    <>
      {back}
      <div className="mb-4 flex flex-wrap items-start gap-4">
        <Avatar name={u.displayName} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-ink">{u.displayName}</h1>
            <KycStatusBadge status={u.kycStatus} />
            {u.accountStatus === 'SUSPENDED' ? <Badge tone="red">Compte suspendu</Badge> : <Badge tone="green">Compte actif</Badge>}
            {!u.security.phoneVerified && <Badge tone="red">Téléphone non vérifié</Badge>}
            {u.security.lockedUntil && new Date(u.security.lockedUntil).getTime() > Date.now() && <Badge tone="red">Verrouillé</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <PhoneLinks phone={u.phoneNumber} />
            <span>{u.city}</span>
            <span>Inscrit le {formatDate(u.createdAt)}</span>
            <span>Actif {formatRelative(u.lastActiveAt)}</span>
            <span className="font-mono">{u.id}</span>
          </div>
        </div>
        <Button icon={<Headphones size={16} />} onClick={() => setCreatingTicket(true)}>
          Créer un ticket
        </Button>
      </div>

      {(d.openAlerts.length > 0 || late > 0 || failedPayouts > 0 || d.counts.tickets > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {d.openAlerts.map((a) => (
            <Link key={a.id} href="/alertes" className="inline-flex items-center gap-1.5 rounded-md border border-danger-line bg-danger-tint px-2.5 py-1 text-sm text-danger">
              <AlertTriangle size={14} /> {a.title}
            </Link>
          ))}
          {late > 0 && (
            <button type="button" onClick={() => setTab('circles')} className="rounded-md border border-danger-line bg-danger-tint px-2.5 py-1 text-sm text-danger">
              {late} cotisation(s) en retard
            </button>
          )}
          {failedPayouts > 0 && (
            <button type="button" onClick={() => setTab('circles')} className="rounded-md border border-danger-line bg-danger-tint px-2.5 py-1 text-sm text-danger">
              Versement de cagnotte en échec
            </button>
          )}
          {d.counts.tickets > 0 && (
            <button type="button" onClick={() => setTab('support')} className="rounded-md border border-accent-line bg-accent-tint px-2.5 py-1 text-sm text-accent-ink">
              {d.counts.tickets} ticket(s) ouvert(s)
            </button>
          )}
        </div>
      )}

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'overview', label: 'Résumé' },
          { value: 'payments', label: 'Paiements', count: d.counts.failedPayments, alert: d.counts.failedPayments > 0 },
          { value: 'circles', label: 'Cercles et versements', count: d.circles.length },
          { value: 'requests', label: 'Demandes', count: d.counts.requests },
          { value: 'notifications', label: 'Notifications', count: d.counts.notifications },
          { value: 'devices', label: 'Appareils', count: d.sessions.length },
          { value: 'support', label: 'Tickets et notes', count: d.counts.tickets },
          { value: 'history', label: 'Historique admin' },
        ]}
      />

      {tab === 'overview' && <Overview d={d} />}
      {tab === 'payments' && <UserPayments userId={id} />}
      {tab === 'circles' && <UserCircles d={d} />}
      {tab === 'requests' && <UserRequests userId={id} />}
      {tab === 'notifications' && <UserNotifications userId={id} pushOk={u.security.pushTokenRegistered} />}
      {tab === 'devices' && <UserDevices d={d} />}
      {tab === 'support' && <UserSupport d={d} />}
      {tab === 'history' && (
        <Card>
          <CardHeader title="Actions de l’équipe sur ce compte" subtitle="Journal d’audit : qui, quand, quoi, motif, avant / après." />
          <AuditTrail subjectId={id} />
        </Card>
      )}

      <CreateTicketDialog
        open={creatingTicket}
        onClose={() => setCreatingTicket(false)}
        subject={{ userId: u.id, userName: u.displayName, callerPhone: u.phoneNumber }}
      />
    </>
  );
}

function Overview({ d }: { d: UserDetail }) {
  const can = useCan();
  const u = d.user;
  const [viewer, setViewer] = useState<number | null>(null);
  const images: ViewerImage[] = d.kyc
    ? [
        { src: d.kyc.images.front, label: `${d.kyc.documentType === 'CNIB' ? 'CNIB' : 'Passeport'} — recto` },
        { src: d.kyc.images.back, label: `${d.kyc.documentType === 'CNIB' ? 'CNIB' : 'Passeport'} — verso` },
        { src: d.kyc.images.selfie, label: 'Selfie' },
      ]
    : [];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Card>
          <CardHeader title="Identité" />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 md:grid-cols-3">
            <Field label="Téléphone">{formatPhone(u.phoneNumber)}</Field>
            <Field label="Numéro Mobile Money">
              {u.mobileMoneyNumber ? formatPhone(u.mobileMoneyNumber) : '—'}
              {u.mobileMoneyNumber && u.mobileMoneyNumber !== u.phoneNumber && <span className="block text-xs text-accent-ink">différent du téléphone</span>}
            </Field>
            <Field label="Ville">{u.city}</Field>
            <Field label="Score de fiabilité">
              <span className={u.reputationScore < 50 ? 'text-danger' : ''}>{u.reputationScore} / 100</span>
            </Field>
            <Field label="Cercles actifs">{d.circles.filter((c) => c.memberStatus === 'ACTIVE').length}</Field>
            <Field label="Paiements">{d.counts.payments}</Field>
          </dl>
          {u.phoneHistory.length > 0 && (
            <div className="border-t border-line px-4 py-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">Anciens numéros</p>
              <ul className="space-y-1 text-sm">
                {u.phoneHistory.map((h, i) => (
                  <li key={i}>
                    {formatPhone(h.from)} → {formatPhone(h.to)} · {formatDate(h.at)} par {h.by} — {h.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Vérification d’identité (KYC)"
            actions={
              <Link href={`/kyc?q=${encodeURIComponent(u.phoneNumber)}`} className="text-sm font-medium text-brand hover:underline">
                Ouvrir dans la file KYC
              </Link>
            }
          />
          <div className="space-y-3 p-4">
            {!d.kyc ? (
              <p className="text-sm text-ink-muted">Aucun document envoyé. L’utilisateur doit passer par « Vérifier mon identité » dans l’application.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <KycStatusBadge status={d.kyc.status} />
                  <span>
                    {d.kyc.documentType === 'CNIB' ? 'CNIB' : 'Passeport'} · envoyé le {formatDateTime(d.kyc.submittedAt)}
                  </span>
                  {d.kyc.status === 'PENDING' && <Badge tone="amber">en attente depuis {formatAge(d.kyc.submittedAt)}</Badge>}
                </div>
                {d.kyc.rejectionReason && <Notice tone="red">Motif du refus : {d.kyc.rejectionReason}</Notice>}
                {d.kyc.reviewedBy && (
                  <p className="text-sm text-ink-muted">
                    Décision de {d.kyc.reviewedBy} le {formatDateTime(d.kyc.reviewedAt!)}
                  </p>
                )}
                {d.kyc.flags.length > 0 && <Notice tone="amber">{d.kyc.flags.join(' · ')}</Notice>}
                {can('kyc.viewDocuments') ? (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <ImageThumb key={img.label} image={img} onOpen={() => setViewer(i)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted">Documents visibles par les agents KYC et le super admin uniquement.</p>
                )}
              </>
            )}
          </div>
        </Card>

        {d.openAlerts.length > 0 && (
          <Card>
            <CardHeader title="Alertes de fraude ouvertes" />
            <ul className="divide-y divide-line">
              {d.openAlerts.map((a) => (
                <li key={a.id} className="flex items-center gap-2 px-4 py-2.5">
                  <SeverityBadge severity={a.severity} />
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="text-sm text-ink-muted">{formatRelative(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
      <div className="space-y-4">
        <UserAccessCard user={u} sessionCount={d.sessions.length} />
        <NotesPanel subject={{ userId: u.id }} />
      </div>
      <ImageViewer images={images} index={viewer} onClose={() => setViewer(null)} onIndex={setViewer} />
    </div>
  );
}

function UserPayments({ userId }: { userId: string }) {
  const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [reconciling, setReconciling] = useState<Payment | null>(null);
  const [refunding, setRefunding] = useState<Payment | null>(null);
  const params = { userId, status, page, pageSize: 15 };
  const query = useQuery({ queryKey: ['payments', 'user', params], queryFn: () => listPayments(params), placeholderData: keepPreviousData });
  const refunds = useQuery({ queryKey: ['refunds', 'user', userId], queryFn: () => listRefunds({ userId, page: 1, pageSize: 20 }) });
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <h2 className="flex-1 text-lg font-semibold text-ink">Paiements</h2>
          <FilterTabs
            value={status}
            onChange={(s) => {
              setStatus(s);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'Tous' },
              { value: 'PENDING', label: 'En attente' },
              { value: 'FAILED', label: 'Échoués' },
              { value: 'COMPLETED', label: 'Confirmés' },
            ]}
          />
        </div>
        <p className="border-b border-line bg-canvas px-4 py-2 text-sm text-ink-soft">
          Payé depuis un autre numéro ? Le paiement n’apparaît pas ici : cherchez la référence opérateur dans{' '}
          <Link href="/paiements" className="font-medium text-brand hover:underline">
            Paiements › À rapprocher
          </Link>
          .
        </p>
        {query.isLoading ? (
          <LoadingState />
        ) : !query.data?.items.length ? (
          <EmptyState title="Aucun paiement" />
        ) : (
          <>
            <PaymentsTable items={query.data.items} showUser={false} onReconcile={setReconciling} onRefund={setRefunding} />
            <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={setPage} />
          </>
        )}
      </Card>
      {!!refunds.data?.items.length && (
        <Card>
          <CardHeader title="Remboursements" />
          <RefundsTable items={refunds.data.items} />
        </Card>
      )}
      <ReconcileDialog payment={reconciling} onClose={() => setReconciling(null)} />
      <RefundRequestDialog payment={refunding} onClose={() => setRefunding(null)} />
    </div>
  );
}

const DAY = 86_400_000;

function UserCircles({ d }: { d: UserDetail }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Cercles" subtitle="Rôle, ordre de passage et cotisation du tour en cours." />
        {d.circles.length === 0 ? (
          <EmptyState title="Membre d’aucun cercle" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Cercle</Th>
                <Th>Rôle</Th>
                <Th>Son tour</Th>
                <Th>Tour en cours</Th>
                <Th>Cotisation</Th>
                <Th className="text-right">Retards</Th>
              </tr>
            </thead>
            <tbody>
              {d.circles.map((c) => (
                <Tr key={c.id}>
                  <Td className="max-w-[300px]">
                    <Link href={`/circles/${c.id}`} className="block truncate font-medium text-brand hover:underline">
                      {c.name}
                    </Link>
                    <span className="mt-0.5 inline-flex gap-1.5">
                      <CircleKindBadge kind={c.kind} />
                      {c.memberStatus === 'EXCLUDED' && <Badge tone="red">Exclu(e)</Badge>}
                      {c.memberStatus === 'LEFT' && <Badge>Parti(e)</Badge>}
                    </span>
                  </Td>
                  <Td className="text-sm">{roleLabel(c.role, c.kind)}</Td>
                  <Td className="text-sm">{c.turnOrder ?? '—'}</Td>
                  <Td className="text-sm">{c.kind === 'SOLIDARITY' ? `période ${c.currentTurn}` : c.currentTurn}</Td>
                  <Td>
                    <PaymentStatusBadge status={c.paymentStatus} />
                    <span className="ml-1.5 text-xs text-ink-muted">{formatXOF(c.contribution)}</span>
                  </Td>
                  <Td className={`text-right text-sm ${c.lateCount > 0 ? 'font-semibold text-danger' : 'text-ink-muted'}`}>{c.lateCount}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      <Card>
        <CardHeader title="Cagnottes reçues (versements)" subtitle="« Je n’ai pas reçu ma cagnotte » : statut du versement de chaque tour." />
        {d.payouts.length === 0 ? (
          <EmptyState title="Aucun versement prévu ou reçu" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Cercle</Th>
                <Th>Tour</Th>
                <Th className="text-right">Montant</Th>
                <Th>Statut</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {d.payouts.map((p) => (
                <Tr key={`${p.circleId}-${p.turn}`}>
                  <Td>
                    <Link href={`/circles/${p.circleId}?tab=turns`} className="text-brand hover:underline">
                      {p.circleName}
                    </Link>
                  </Td>
                  <Td className="text-sm">{p.turn}</Td>
                  <Td className="whitespace-nowrap text-right text-sm font-medium">{formatXOF(p.amount)}</Td>
                  <Td>
                    <PayoutStatusBadge status={p.status as PayoutStatus} overdue={p.status === 'READY' && new Date(p.dueDate).getTime() < Date.now() - 2 * DAY} />
                    {p.failureReason && <span className="block text-xs text-danger">{p.failureReason}</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-ink-soft">{p.paidAt ? `versé le ${formatDate(p.paidAt)}` : `attendu depuis le ${formatDate(p.dueDate)}`}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function UserRequests({ userId }: { userId: string }) {
  const query = useQuery({ queryKey: ['requests', 'user', userId], queryFn: () => listUserRequests(userId) });
  return (
    <Card>
      <CardHeader title="Demandes" subtitle="Adhésions, départs, exclusions, remplacements. Les décisions se prennent depuis la fiche du cercle." />
      {query.isLoading ? (
        <LoadingState />
      ) : !query.data?.length ? (
        <EmptyState title="Aucune demande" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Cercle</Th>
              <Th>Motif</Th>
              <Th>Statut</Th>
            </tr>
          </thead>
          <tbody>
            {query.data.map((r) => (
              <Tr key={r.id}>
                <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(r.createdAt)}</Td>
                <Td className="text-sm font-medium">{REQUEST_TYPE_LABEL[r.type]}</Td>
                <Td>
                  <Link href={`/circles/${r.circleId}?tab=requests`} className="text-sm text-brand hover:underline">
                    {r.circleName}
                  </Link>
                </Td>
                <Td className="max-w-sm text-sm">
                  {r.reason}
                  {r.decisionNote && <span className="block text-xs text-ink-muted">Décision : {r.decisionNote} ({r.decidedBy})</span>}
                </Td>
                <Td>
                  <RequestStatusBadge status={r.status} contested={r.contested} />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function UserNotifications({ userId, pushOk }: { userId: string; pushOk: boolean }) {
  const [status, setStatus] = useState<NotificationStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['notifications', userId, status, page],
    queryFn: () => listUserNotifications(userId, { status, page, pageSize: 20 }),
    placeholderData: keepPreviousData,
  });
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <h2 className="flex-1 text-lg font-semibold text-ink">Notifications envoyées</h2>
        <FilterTabs
          value={status}
          onChange={(s) => {
            setStatus(s);
            setPage(1);
          }}
          options={[
            { value: 'ALL', label: 'Toutes' },
            { value: 'FAILED', label: 'Échecs' },
            { value: 'DELIVERED', label: 'Délivrées' },
          ]}
        />
      </div>
      {!pushOk && (
        <Notice tone="amber" className="m-4">
          Aucun appareil enregistré pour les notifications push : l’application a été désinstallée ou les notifications sont désactivées dans les réglages du téléphone. Les SMS
          continuent d’être envoyés. Demandez à l’utilisateur d’ouvrir l’application et d’autoriser les notifications.
        </Notice>
      )}
      {query.isLoading ? (
        <LoadingState />
      ) : !query.data?.items.length ? (
        <EmptyState title="Aucune notification" />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Message</Th>
                <Th>Canal</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((n) => (
                <Tr key={n.id}>
                  <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(n.sentAt)}</Td>
                  <Td className="whitespace-nowrap text-sm">{NOTIFICATION_TYPE_LABEL[n.type]}</Td>
                  <Td className="max-w-md text-sm">
                    {n.title}
                    {n.byAdmin && <span className="block text-xs text-ink-muted">Envoyée par le support</span>}
                  </Td>
                  <Td className="text-sm">{n.channel === 'PUSH' ? 'Push' : 'SMS'}</Td>
                  <Td>
                    <Badge tone={n.status === 'FAILED' ? 'red' : n.status === 'DELIVERED' ? 'green' : 'amber'}>{NOTIFICATION_STATUS_LABEL[n.status]}</Badge>
                    {n.failureReason && <span className="block max-w-[220px] text-xs text-danger">{n.failureReason}</span>}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={query.data.page} pageSize={query.data.pageSize} total={query.data.total} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

function UserDevices({ d }: { d: UserDetail }) {
  return (
    <Card>
      <CardHeader title="Appareils et sessions" subtitle="Une session inconnue (autre ville, autre appareil) après une perte de téléphone : déconnectez tout depuis le Résumé." />
      {d.sessions.length === 0 ? (
        <EmptyState title="Aucune session active" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Appareil</Th>
              <Th>Version de l’app</Th>
              <Th>Ville</Th>
              <Th>Ouverte le</Th>
              <Th>Dernière activité</Th>
            </tr>
          </thead>
          <tbody>
            {d.sessions.map((s) => (
              <Tr key={s.id}>
                <Td className="text-sm font-medium">
                  {s.device} <span className="text-ink-muted">· {s.platform === 'IOS' ? 'iOS' : 'Android'}</span>
                </Td>
                <Td className="text-sm">{s.appVersion}</Td>
                <Td className={`text-sm ${s.city !== d.user.city ? 'font-medium text-accent-ink' : ''}`}>{s.city}</Td>
                <Td className="whitespace-nowrap text-sm text-ink-soft">{formatDateTime(s.createdAt)}</Td>
                <Td className="whitespace-nowrap text-sm text-ink-soft">{formatRelative(s.lastSeenAt)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

function UserSupport({ d }: { d: UserDetail }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['tickets', 'user', d.user.id], queryFn: () => listTickets({ userId: d.user.id, status: 'ALL', page: 1, pageSize: 50 }) });
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader title="Tickets" />
        {query.isLoading ? <LoadingState /> : !query.data?.items.length ? <EmptyState title="Aucun ticket" /> : <TicketsTable items={query.data.items} onOpen={setOpenId} compact />}
      </Card>
      <NotesPanel subject={{ userId: d.user.id }} />
      <TicketDetailDialog ticketId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
