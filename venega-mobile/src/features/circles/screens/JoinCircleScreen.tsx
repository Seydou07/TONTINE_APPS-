import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Linking } from 'react-native';
import {
  ArrowLeft,
  Search,
  Upload,
  Check,
  ShieldCheck,
  Wallet,
  Smartphone,
  Copy,
  Loader,
  Users,
} from 'lucide-react-native';
import { colors, radius, typography } from '@venega/design-tokens';
import {
  getCircleByInvite,
  getActiveCycle,
  getCirclePhase,
  computeRachat,
  computeDeposit,
  computeAdhesionTotal,
  buildConditionsText,
  addMembershipRequest,
  getCurrentUser,
} from '../circleStore';
import { KycRequirement, MembershipRequestStatus, AdhesionPaymentStatus, KycStatus } from '@venega/types';
import type { Circle, User } from '@venega/types';
import { Button, IconButton, Sheet, TextField } from '../../../components/ui';
import OperatorPicker, { UssdCodeBox } from '../components/OperatorPicker';

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Money' },
  { id: 'WAVE', name: 'Wave' },
];

const typeLabels: Record<string, string> = {
  TONTINE_ONLY: 'Tontine rotative',
  SOLIDARITY_ONLY: 'Caisse de solidarité',
  NATURE: 'Tontine en nature',
};

const cotisationLine = (c: Circle): string => {
  const parts: string[] = [];
  if (c.tontineAmount > 0) parts.push(`${formatXOF(c.tontineAmount)} de tontine`);
  if (c.solidarityAmount > 0) parts.push(`${formatXOF(c.solidarityAmount)} de solidarité`);
  return parts.length > 0 ? parts.join(' + ') : '—';
};

type Step = 'search' | 'fiche' | 'form' | 'payment' | 'done';

export default function JoinCircleScreen() {
  const router = useRouter();
  const me = getCurrentUser();

  const [step, setStep] = useState<Step>('search');
  const [inviteCode, setInviteCode] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [notActive, setNotActive] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  const [form, setForm] = useState({
    fullName: me.displayName,
    phoneNumber: me.phoneNumber,
    depositNumber: me.phoneNumber,
  });
  const [docs, setDocs] = useState({ cnibFront: false, cnibBack: false, selfie: false });

  const [selectedOperator, setSelectedOperator] = useState('ORANGE');
  const [ussdModal, setUssdModal] = useState(false);
  const [ussdCode, setUssdCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  const cycle = circle ? getActiveCycle(circle) : undefined;
  const phase = circle ? getCirclePhase(circle, cycle) : 'CONSTITUTION';
  const rachat = circle ? computeRachat(circle, cycle) : 0;
  const deposit = circle ? computeDeposit(circle, cycle) : 0;
  const total = circle ? computeAdhesionTotal(circle, cycle) : 0;
  const kyc = circle?.rules?.kycRequirement ?? KycRequirement.NONE;

  const accountVerified = me.kycStatus === KycStatus.VERIFIED;
  const needsDocs = !accountVerified && kyc !== KycRequirement.NONE;
  const needsSelfie = !accountVerified && kyc === KycRequirement.CNIB_SELFIE;
  const needsPayment = total > 0;

  const formFilled = form.fullName.trim() && form.phoneNumber.trim() && form.depositNumber.trim();
  const docsOk = (!needsDocs || (docs.cnibFront && docs.cnibBack)) && (!needsSelfie || docs.selfie);

  const handleSearch = () => {
    const found = getCircleByInvite(inviteCode);
    setNotActive(false);
    if (found) {
      if (!found.activatedAt) {
        setNotFound(false);
        setNotActive(true);
        return;
      }
      setCircle(found);
      setNotFound(false);
      setConditionsAccepted(false);
      setStep('fiche');
    } else {
      setNotFound(true);
    }
  };

  const reset = () => {
    setCircle(null);
    setInviteCode('');
    setNotFound(false);
    setNotActive(false);
    setStep('search');
    setConditionsAccepted(false);
    setDocs({ cnibFront: false, cnibBack: false, selfie: false });
  };

  const buildRequest = (paymentStatus?: AdhesionPaymentStatus, ref?: string) => {
    if (!circle) return;
    const candidateUser: User = {
      id: me.id,
      phoneNumber: form.phoneNumber.trim(),
      displayName: form.fullName.trim(),
      firstName: form.fullName.trim().split(' ')[0] || '',
      lastName: form.fullName.trim().split(' ').slice(1).join(' ') || '',
      kycStatus: me.kycStatus,
      reputationScore: me.reputationScore,
      createdAt: me.createdAt,
    };
    addMembershipRequest({
      id: 'mr' + Date.now(),
      circleId: circle.id,
      userId: me.id,
      status: MembershipRequestStatus.PENDING,
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      depositNumber: form.depositNumber.trim(),
      cnibFrontUrl: needsDocs ? '/mock/cnib-front-candidat.jpg' : '',
      cnibBackUrl: needsDocs ? '/mock/cnib-back-candidat.jpg' : '',
      selfieUrl: needsSelfie ? '/mock/selfie-candidat.jpg' : undefined,
      conditionsAccepted: true,
      joiningFee: rachat,
      depositAmount: deposit,
      paymentStatus,
      paymentReference: ref,
      paidAt: paymentStatus === AdhesionPaymentStatus.PAID ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      user: candidateUser,
    });
  };

  const submitRequest = () => {
    buildRequest();
    setStep('done');
  };

  const buildUssd = (op: string) =>
    `*${op === 'MOOV' ? '802' : op === 'WAVE' ? '888' : '800'}*${total}*${Math.floor(100 + Math.random() * 900)}#`;

  const handleInitiatePayment = () => {
    setUssdCode(buildUssd(selectedOperator));
    setUssdModal(true);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(ussdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExecuteUssd = () => {
    Linking.openURL(`tel:${ussdCode.replace(/#$/, '%23')}`).catch(() => {
      Alert.alert('Code USSD', ussdCode);
    });
    setDetecting(true);
    setTimeout(() => {
      setDetecting(false);
      setUssdModal(false);
      const ref = `CP-${Date.now().toString().slice(-6)}`;
      setPaymentRef(ref);
      buildRequest(AdhesionPaymentStatus.PAID, ref);
      setStep('done');
    }, 6000);
  };

  const kycLabel =
    kyc === KycRequirement.NONE ? 'Aucun document' : kyc === KycRequirement.CNIB ? 'CNIB' : 'CNIB + Selfie';

  const order = ['fiche', 'form', 'payment'] as const;
  const isSegmentActive = (s: (typeof order)[number]) => {
    if (step === 'done') return s === 'fiche' || s === 'form' || (s === 'payment' && needsPayment);
    return order.indexOf(step as never) >= order.indexOf(s as never);
  };

  const goBack = () => {
    if (step === 'form') { setStep('fiche'); return; }
    if (step === 'payment') { setStep('form'); return; }
    if (step === 'fiche') { reset(); return; }
    router.back();
  };

  /* ── CTA du footer selon l'étape ── */
  const footer = (() => {
    switch (step) {
      case 'search':
        return <Button title="Rechercher" icon={Search} disabled={!inviteCode.trim()} onPress={handleSearch} />;
      case 'fiche':
        return <Button title="Continuer" disabled={!conditionsAccepted} onPress={() => setStep('form')} />;
      case 'form':
        return (
          <Button
            title={needsPayment ? 'Continuer vers le paiement' : 'Envoyer la demande'}
            disabled={!formFilled || !docsOk}
            onPress={() => (needsPayment ? setStep('payment') : submitRequest())}
          />
        );
      case 'payment':
        return <Button title={`Payer ${formatXOF(total)}`} icon={Wallet} onPress={handleInitiatePayment} />;
      case 'done':
        return <Button title="Retour aux cercles" onPress={() => router.back()} />;
    }
  })();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* ── En-tête ── */}
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} variant="plain" accessibilityLabel="Retour" onPress={goBack} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>Rejoindre un cercle</Text>
            {circle && step !== 'search' ? (
              <Text style={styles.headerSub} numberOfLines={1}>{circle.name}</Text>
            ) : null}
          </View>
          <View style={styles.headerSpacer} />
        </View>
        {step !== 'search' && (
          <View style={styles.progress}>
            {order.map((s) => (
              <View key={s} style={[styles.progressSeg, isSegmentActive(s) && styles.progressSegDone]} />
            ))}
          </View>
        )}

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Recherche par code ── */}
            {step === 'search' && (
              <>
                <View style={styles.intro}>
                  <View style={styles.introIcon}>
                    <Users size={26} color={colors.primary.DEFAULT} strokeWidth={1.8} />
                  </View>
                  <Text style={styles.stepTitle}>Entrez le code d'invitation</Text>
                  <Text style={styles.stepSubtitle}>
                    Le code vous est remis par le fondateur du cercle. Votre compte Venega pré-remplit vos
                    informations : vous n'avez rien à ressaisir.
                  </Text>
                </View>

                <TextField
                  label="Code d'invitation"
                  placeholder="Ex. DASS4821"
                  value={inviteCode}
                  onChangeText={(v) => {
                    setInviteCode(v);
                    setNotFound(false);
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  style={styles.codeInput}
                  error={
                    notFound
                      ? 'Aucun cercle ne correspond à ce code. Vérifiez-le auprès du fondateur.'
                      : notActive
                      ? "Ce cercle n'est pas encore activé par son fondateur. Réessayez plus tard."
                      : undefined
                  }
                />
              </>
            )}

            {/* ── Fiche du cercle ── */}
            {step === 'fiche' && circle && (
              <>
                <Text style={styles.stepTitle}>Fiche du cercle</Text>
                <Text style={styles.stepSubtitle}>
                  Générée automatiquement à partir des réglages du cercle. Lisez-la avant de poursuivre.
                </Text>

                <View style={styles.card}>
                  <View style={styles.circleHeader}>
                    <View style={styles.flex}>
                      <Text style={styles.circleName}>{circle.name}</Text>
                      <Text style={styles.circleMeta}>
                        {typeLabels[circle.type] ?? circle.type} · {circle.memberCount} membre(s)
                      </Text>
                    </View>
                    <View style={[styles.badge, phase === 'ACTIVE' ? styles.badgeActive : styles.badgeNew]}>
                      <Text style={[styles.badgeText, phase === 'ACTIVE' ? styles.badgeTextActive : styles.badgeTextNew]}>
                        {phase === 'ACTIVE' ? 'En cours' : 'Nouveau'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.cotisation}>
                    Cotisation : <Text style={styles.cotisationStrong}>{cotisationLine(circle)}</Text> par tour
                  </Text>
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitleInline}>Conditions d'adhésion</Text>
                  <Text style={styles.autoTag}>Résumé automatique</Text>
                </View>
                <View style={styles.conditionsBox}>
                  <Text style={styles.conditionsText}>{buildConditionsText(circle, cycle, rachat, deposit)}</Text>
                </View>

                {needsPayment && (
                  <View style={[styles.card, styles.section]}>
                    <AmountRow label="Frais de rachat des tours passés" value={formatXOF(rachat)} />
                    <AmountRow label="Dépôt de garantie" value={formatXOF(deposit)} />
                    <AmountRow label="Total à payer" value={formatXOF(total)} strong last />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.checkboxRow}
                  activeOpacity={0.7}
                  onPress={() => setConditionsAccepted(!conditionsAccepted)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: conditionsAccepted }}
                >
                  <View style={[styles.checkbox, conditionsAccepted && styles.checkboxActive]}>
                    {conditionsAccepted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={styles.checkboxLabel}>J'ai lu et j'accepte les conditions du cercle</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Informations du candidat ── */}
            {step === 'form' && circle && (
              <>
                <Text style={styles.stepTitle}>Vos informations</Text>
                <Text style={styles.stepSubtitle}>Elles sont transmises au fondateur pour valider votre entrée.</Text>

                <View style={styles.fields}>
                  <TextField
                    label="Nom complet"
                    placeholder="Ex. Aminata Ouédraogo"
                    value={form.fullName}
                    onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))}
                  />
                  <TextField
                    label="Numéro de téléphone"
                    placeholder="+226 70 12 34 56"
                    keyboardType="phone-pad"
                    value={form.phoneNumber}
                    onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))}
                  />
                  <TextField
                    label="Numéro de dépôt Mobile Money"
                    placeholder="+226 70 12 34 56"
                    keyboardType="phone-pad"
                    value={form.depositNumber}
                    onChangeText={(v) => setForm((p) => ({ ...p, depositNumber: v }))}
                    hint="Numéro sur lequel vous recevrez la cagnotte."
                  />
                </View>

                {accountVerified ? (
                  <View style={[styles.verifiedNote, styles.section]}>
                    <ShieldCheck size={18} color={colors.primary.DEFAULT} />
                    <Text style={styles.verifiedNoteText}>
                      Identité vérifiée — aucune pièce à fournir. Vos informations sont transmises au fondateur, qui
                      validera votre entrée.
                    </Text>
                  </View>
                ) : needsDocs ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents exigés</Text>
                    <Text style={styles.sectionHint}>Exigence du cercle : {kycLabel}</Text>
                    <View style={styles.stack}>
                      <DocRow
                        label="CNIB recto"
                        doneLabel="CNIB recto ajouté"
                        action="Choisir le recto"
                        done={docs.cnibFront}
                        onPress={() => setDocs((p) => ({ ...p, cnibFront: !p.cnibFront }))}
                      />
                      <DocRow
                        label="CNIB verso"
                        doneLabel="CNIB verso ajouté"
                        action="Choisir le verso"
                        done={docs.cnibBack}
                        onPress={() => setDocs((p) => ({ ...p, cnibBack: !p.cnibBack }))}
                      />
                      {needsSelfie && (
                        <DocRow
                          label="Selfie facial"
                          doneLabel="Selfie ajouté"
                          action="Prendre un selfie"
                          done={docs.selfie}
                          onPress={() => setDocs((p) => ({ ...p, selfie: !p.selfie }))}
                        />
                      )}
                    </View>
                  </View>
                ) : null}
              </>
            )}

            {/* ── Paiement de la place ── */}
            {step === 'payment' && circle && (
              <>
                <Text style={styles.stepTitle}>Paiement de la place</Text>
                <Text style={styles.stepSubtitle}>
                  Réglez les frais d'adhésion pour finaliser votre demande. Le montant est vérifié avant l'approbation
                  du fondateur.
                </Text>

                <View style={styles.card}>
                  <AmountRow label="Frais de rachat des tours passés" value={formatXOF(rachat)} />
                  <AmountRow label="Dépôt de garantie" value={formatXOF(deposit)} />
                  <AmountRow label="Total à payer" value={formatXOF(total)} strong last />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Opérateur de paiement</Text>
                  <OperatorPicker operators={OPERATORS} value={selectedOperator} onChange={setSelectedOperator} />
                </View>
              </>
            )}

            {/* ── Demande envoyée ── */}
            {step === 'done' && (
              <View style={styles.done}>
                <View style={styles.doneIcon}>
                  <Check size={30} color={colors.primary.DEFAULT} strokeWidth={2.5} />
                </View>
                <Text style={styles.doneTitle}>Demande envoyée</Text>
                <Text style={styles.doneText}>
                  {needsPayment ? (
                    <>
                      Paiement reçu (<Text style={styles.doneStrong}>{paymentRef}</Text>). Votre demande d'adhésion à{' '}
                      <Text style={styles.doneStrong}>{circle?.name}</Text> est en attente de validation par le
                      fondateur.
                    </>
                  ) : (
                    <>
                      Votre demande d'adhésion à <Text style={styles.doneStrong}>{circle?.name}</Text> est en attente
                      de validation par le fondateur.
                    </>
                  )}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>{footer}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Code USSD ── */}
      <Sheet visible={ussdModal} onClose={() => setUssdModal(false)} title="Paiement de la place">
        <Text style={styles.sheetText}>
          Exécutez ce code USSD pour régler <Text style={styles.sheetStrong}>{formatXOF(total)}</Text>.
        </Text>
        <View style={styles.sheetCode}>
          <UssdCodeBox code={ussdCode} />
        </View>
        <View style={styles.sheetActions}>
          <Button
            title={copied ? 'Copié' : 'Copier le code'}
            icon={copied ? Check : Copy}
            variant="secondary"
            onPress={handleCopyCode}
          />
          <Button
            title={detecting ? 'Détection du paiement…' : 'Exécuter le code USSD'}
            icon={detecting ? Loader : Smartphone}
            disabled={detecting}
            onPress={handleExecuteUssd}
          />
        </View>
      </Sheet>
    </View>
  );
}

function AmountRow({ label, value, strong, last }: { label: string; value: string; strong?: boolean; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]}>{value}</Text>
    </View>
  );
}

function DocRow({
  label,
  doneLabel,
  action,
  done,
  onPress,
}: {
  label: string;
  doneLabel: string;
  action: string;
  done: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.docRow, done && styles.docRowDone]}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={done ? doneLabel : action}
    >
      <View style={[styles.docIcon, done && styles.docIconDone]}>
        {done ? (
          <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <Upload size={18} color={colors.primary.DEFAULT} />
        )}
      </View>
      <View style={styles.flex}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={[styles.docAction, done && styles.docActionDone]}>{done ? doneLabel : action}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },

  /* En-tête */
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.headline, color: colors.ink, textAlign: 'center' },
  headerSub: { ...typography.caption, fontWeight: '400', color: colors.muted, textAlign: 'center' },
  headerSpacer: { width: 40 },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 4 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line },
  progressSegDone: { backgroundColor: colors.primary.DEFAULT },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  stepTitle: { ...typography.title, color: colors.ink },
  stepSubtitle: { ...typography.callout, color: colors.muted, marginTop: 6, marginBottom: 24 },

  fields: { gap: 20 },
  stack: { gap: 10 },
  section: { marginTop: 24 },
  sectionTitle: { ...typography.bodyStrong, color: colors.ink, marginBottom: 4 },
  sectionHint: { ...typography.footnote, color: colors.muted, marginBottom: 12 },

  /* Recherche */
  intro: { marginBottom: 4 },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeInput: { letterSpacing: 2, fontWeight: '600' },

  /* Cartes */
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
  },
  circleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16 },
  circleName: { ...typography.bodyStrong, color: colors.ink },
  circleMeta: { ...typography.footnote, color: colors.muted, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginVertical: 14 },
  cotisation: { ...typography.callout, color: colors.inkSoft, paddingBottom: 16 },
  cotisationStrong: { fontWeight: '600', color: colors.ink },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeActive: { backgroundColor: colors.accent.tint },
  badgeNew: { backgroundColor: colors.primary.tint },
  badgeText: { ...typography.caption, fontWeight: '600' },
  badgeTextActive: { color: colors.accent.deep },
  badgeTextNew: { color: colors.primary.dark },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 24, marginBottom: 12 },
  sectionTitleInline: { ...typography.bodyStrong, color: colors.ink },
  autoTag: {
    ...typography.caption,
    color: colors.muted,
    backgroundColor: colors.fill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  conditionsBox: { borderRadius: radius.lg, backgroundColor: colors.fill, padding: 16 },
  conditionsText: { ...typography.callout, color: colors.inkSoft },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLabel: { flex: 1, ...typography.callout, color: colors.muted },
  rowLabelStrong: { fontWeight: '600', color: colors.ink },
  rowValue: { ...typography.callout, fontWeight: '500', color: colors.ink, textAlign: 'right' },
  rowValueStrong: { ...typography.headline, fontWeight: '700', color: colors.primary.dark },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, minHeight: 40 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  checkboxActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  checkboxLabel: { flex: 1, ...typography.callout, color: colors.ink },

  /* Formulaire */
  verifiedNote: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary.tint,
  },
  verifiedNoteText: { flex: 1, ...typography.footnote, color: colors.primary.dark },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg,
  },
  docRowDone: { borderStyle: 'solid', borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.tint },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docIconDone: { backgroundColor: colors.primary.DEFAULT },
  docLabel: { ...typography.callout, fontWeight: '600', color: colors.ink },
  docAction: { ...typography.footnote, color: colors.muted, marginTop: 1 },
  docActionDone: { color: colors.primary.dark },

  /* Terminé */
  done: { alignItems: 'center', paddingTop: 40 },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  doneTitle: { ...typography.title, color: colors.ink, textAlign: 'center' },
  doneText: { ...typography.callout, color: colors.muted, textAlign: 'center', marginTop: 8, paddingHorizontal: 8 },
  doneStrong: { fontWeight: '600', color: colors.ink },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },

  /* Feuille USSD */
  sheetText: { ...typography.body, color: colors.inkSoft },
  sheetStrong: { fontWeight: '600', color: colors.ink },
  sheetCode: { marginTop: 16 },
  sheetActions: { gap: 10, marginTop: 20 },
});
