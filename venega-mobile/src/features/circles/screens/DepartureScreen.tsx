import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, typography } from '@venega/design-tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ShieldAlert, LogOut, HandCoins, Calculator, Check } from 'lucide-react-native';
import {
  getCircle,
  getActiveCycle,
  getCurrentUser,
  computeDepartureBreakdown,
  computeRecalculatedContribution,
  requestDeparture,
} from '../circleStore';
import { mockMemberships } from '@venega/types';
import type { DepartureRequest } from '@venega/types';
import { Button } from '../../../components/ui';
import {
  ScreenHeader,
  ScreenFooter,
  Card,
  SectionTitle,
  Notice,
  CheckRow,
  KeyValue,
  CenteredState,
  actionStyles,
} from '../components/ActionScreenParts';

const formatXOF = (amount: number) =>
  new Intl.NumberFormat('fr-BF', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

export default function DepartureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const circleId = params.id ?? 'c1';
  const circle = getCircle(circleId) ?? getCircle('c1');
  const cycle = getActiveCycle(circle!);
  const me = getCurrentUser();
  const memberships = mockMemberships.filter((m) => m.circleId === circleId);
  const currentMembership = memberships.find((m) => m.userId === me.id);

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<DepartureRequest | null>(null);

  if (!circle || !currentMembership || !me) return null;

  const hasReceivedPayout = currentMembership.hasReceivedPayout;
  const breakdown = computeDepartureBreakdown(circle, cycle, currentMembership);
  const recalculated = computeRecalculatedContribution(circle);

  /** Déjà reçu la cagnotte → départ bloqué (anti-fuite). */
  if (hasReceivedPayout) {
    return (
      <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Quitter le cercle" subtitle={circle.name} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={actionStyles.scroll} showsVerticalScrollIndicator={false}>
          <CenteredState
            icon={ShieldAlert}
            tone="danger"
            title="Départ impossible"
            text="Vous avez déjà reçu la cagnotte de ce cercle. Un membre qui a touché son gain ne peut pas quitter le cercle avant la fin du cycle : cette règle protège les autres membres."
          />
        </ScrollView>
        <ScreenFooter>
          <Button title="Retour" variant="secondary" onPress={() => router.back()} />
        </ScreenFooter>
      </SafeAreaView>
    );
  }

  /** Demande déjà envoyée → écran de statut. */
  if (request) {
    return (
      <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
        <ScreenHeader title="Demande envoyée" subtitle={circle.name} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={actionStyles.scroll} showsVerticalScrollIndicator={false}>
          <CenteredState
            icon={Check}
            tone="primary"
            title="Demande de départ transmise"
            text="Le fondateur doit approuver votre départ. Aucun nouveau membre ne sera ajouté : les cagnottes seront recalculées automatiquement."
          />

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>À récupérer, main à main</Text>
            <Text style={styles.amountValue}>{formatXOF(request.totalRecover)}</Text>
            <Text style={styles.amountHint}>
              {request.reimbursements.length} tour(s) cotisé(s) sans cagnotte reçue
            </Text>
          </View>

          <Text style={styles.remind}>
            Vous avez cotisé {request.pastTurns} tour(s). Ceux qui ont bénéficié de votre cotisation vous rembourseront
            directement.
          </Text>
        </ScrollView>
        <ScreenFooter>
          <Button title="Retour au cercle" onPress={() => router.back()} />
        </ScreenFooter>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const created = requestDeparture(circle!.id, me.id, me.displayName);
      setRequest(created);
      setSubmitting(false);
    }, 900);
  };

  return (
    <SafeAreaView style={actionStyles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Quitter le cercle" subtitle={circle.name} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={actionStyles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ce que je perdrais sans remboursement */}
        <Card style={styles.block}>
          <View style={styles.cardHead}>
            <View style={[styles.cardIcon, { backgroundColor: colors.danger.tint }]}>
              <HandCoins size={18} color={colors.danger.DEFAULT} strokeWidth={1.8} />
            </View>
            <Text style={styles.cardTitle}>Sans remboursement, vous perdez</Text>
          </View>
          <KeyValue
            label={`Cotisations versées (${breakdown.pastTurns} tour(s))`}
            value={formatXOF(breakdown.totalRecover)}
            valueColor={colors.danger.DEFAULT}
            last
          />
        </Card>

        {/* Remboursement par les bénéficiaires */}
        <SectionTitle style={styles.sectionGap}>Remboursement par les bénéficiaires</SectionTitle>
        <Card style={styles.block}>
          <Text style={styles.cardText}>
            Vous avez cotisé sans recevoir de cagnotte. Chaque bénéficiaire de vos tours vous remet une cotisation, main à
            main.
          </Text>

          {breakdown.reimbursements.length > 0 ? (
            <View style={styles.list}>
              {breakdown.reimbursements.map((r, i) => (
                <View
                  key={r.turnNumber}
                  style={[styles.listRow, i < breakdown.reimbursements.length - 1 && styles.listRowBorder]}
                >
                  <View style={styles.turnPill}>
                    <Text style={styles.turnPillText}>Tour {r.turnNumber}</Text>
                  </View>
                  <Text style={styles.listName} numberOfLines={1}>
                    {r.beneficiaryName}
                  </Text>
                  <Text style={styles.listAmount}>{formatXOF(r.amount)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.cardText, styles.emptyLine]}>
              Aucun tour passé à rembourser : vous n'avez pas encore cotisé.
            </Text>
          )}

          <KeyValue label="Total à récupérer" value={formatXOF(breakdown.totalRecover)} strong last />
          <Text style={styles.footnote}>
            Le remboursement se fait directement avec chaque bénéficiaire, sans passer par l'application.
          </Text>
        </Card>

        {/* Recalcul des cagnottes */}
        <Notice icon={Calculator} tone="info" title="Cagnottes recalculées, sans remplaçant" style={styles.sectionGap}>
          À votre départ, le cercle continue sans nouveau membre. Pour que le pot reste entier, la cotisation passe de{' '}
          {formatXOF(circle.tontineAmount)} à {formatXOF(recalculated)} par membre restant.
        </Notice>

        <View style={styles.sectionGap}>
          <CheckRow
            checked={confirmed}
            onPress={() => setConfirmed(!confirmed)}
            label={`Je comprends : je quitte le cercle, les autres membres me remboursent mes ${breakdown.pastTurns} tour(s) cotisé(s) et les cagnottes seront recalculées.`}
          />
        </View>
      </ScrollView>

      <ScreenFooter>
        <Button
          title="Demander à quitter le cercle"
          icon={LogOut}
          variant="danger"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!confirmed}
        />
      </ScreenFooter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  block: { paddingVertical: 14 },
  sectionGap: { marginTop: 20 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { flex: 1, ...typography.callout, fontWeight: '600', color: colors.ink },
  cardText: { ...typography.footnote, color: colors.muted },
  emptyLine: { marginTop: 8 },

  list: {
    marginTop: 12,
    marginBottom: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12 },
  listRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  turnPill: { backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  turnPillText: { ...typography.caption, color: colors.inkSoft },
  listName: { flex: 1, ...typography.callout, fontWeight: '500', color: colors.ink },
  listAmount: { ...typography.callout, fontWeight: '600', color: colors.primary.DEFAULT },
  footnote: { ...typography.caption, fontWeight: '400', color: colors.muted },

  amountCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  amountLabel: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8 },
  amountValue: { ...typography.display, color: '#FFFFFF', marginTop: 4 },
  amountHint: { ...typography.footnote, color: '#FFFFFF', opacity: 0.8, marginTop: 4, textAlign: 'center' },
  remind: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 16 },
});
