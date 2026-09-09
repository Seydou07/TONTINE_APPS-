import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
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
  X,
  Users,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

const formatXOF = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F CFA';

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money' },
  { id: 'MOOV', name: 'Moov Money' },
  { id: 'WAVE', name: 'Wave' },
];

const typeLabels: Record<string, string> = {
  TONTINE_ONLY: 'Tontine rotative',
  SOLIDARITY_ONLY: 'Caisse de solidarité',
  HYBRID: 'Tontine + Solidarité',
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.topSection}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backBtn} onPress={goBack}>
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>Rejoindre un cercle</Text>
              <View style={styles.backBtn} />
            </View>
            {circle && <Text style={styles.headerSub} numberOfLines={1}>{circle.name}</Text>}
            <View style={styles.progressRow}>
              {order.map((s) => (
                <View key={s} style={[styles.progressSegment, isSegmentActive(s) && styles.progressSegmentActive]} />
              ))}
            </View>
          </View>

          <View style={styles.bodySheet}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {step === 'search' && (
                <>
                  <View style={styles.searchHero}>
                    <View style={styles.searchIconWrap}>
                      <Users size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.searchTitle}>Rejoindre un cercle</Text>
                    <Text style={styles.searchSubtitle}>
                      Saisissez le code d'invitation partagé par le fondateur. Votre compte Venega pré-remplit vos
                      informations : vous n'avez rien à ressaisir.
                    </Text>
                    <View style={styles.searchRow}>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Code d'invitation"
                        placeholderTextColor="#94A3B8"
                        value={inviteCode}
                        onChangeText={(v) => {
                          setInviteCode(v);
                          setNotFound(false);
                        }}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        onSubmitEditing={handleSearch}
                      />
                      <TouchableOpacity
                        style={[styles.searchBtn, !inviteCode.trim() && styles.btnDisabled]}
                        disabled={!inviteCode.trim()}
                        onPress={handleSearch}
                      >
                        <Search size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                    {notFound && (
                      <Text style={styles.notFoundHint}>
                        Aucun cercle ne correspond à ce code. Vérifiez-le auprès du fondateur.
                      </Text>
                    )}
                    {notActive && (
                      <Text style={styles.notFoundHint}>
                        Ce cercle n'est pas encore activé par son fondateur. Réessayez plus tard.
                      </Text>
                    )}
                    <Text style={styles.searchHint}>Le code vous est remis par le fondateur du cercle.</Text>
                  </View>
                </>
              )}

              {step === 'fiche' && circle && (
                <>
                  <Text style={styles.ficheIntro}>
                    Voici la fiche de ce cercle, générée automatiquement à partir de ses réglages. Lisez-la avant de
                    poursuivre.
                  </Text>

                  <View style={styles.circleInfoCard}>
                    <View style={styles.circleInfoHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.circleName} numberOfLines={2}>{circle.name}</Text>
                        <Text style={styles.circleMeta}>
                          {typeLabels[circle.type] ?? circle.type} • {circle.memberCount} membre(s)
                        </Text>
                      </View>
                      <View style={[styles.phaseBadge, phase === 'ACTIVE' ? styles.phaseBadgeActive : styles.phaseBadgeNew]}>
                        <Text style={[styles.phaseBadgeText, phase === 'ACTIVE' ? styles.phaseBadgeTextActive : styles.phaseBadgeTextNew]}>
                          {phase === 'ACTIVE' ? 'En cours' : 'Nouveau'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.circleInfoDivider} />
                    <Text style={styles.circleCotisation}>
                      Cotisation : <Text style={styles.circleCotisationStrong}>{cotisationLine(circle)}</Text> par tour
                    </Text>
                  </View>

                  <View style={styles.conditionsHeaderRow}>
                    <Text style={styles.sectionTitle}>Conditions d'adhésion</Text>
                    <View style={styles.autoTag}>
                      <Text style={styles.autoTagText}>Résumé automatique</Text>
                    </View>
                  </View>
                  <View style={styles.conditionsBox}>
                    <Text style={styles.conditionsText}>
                      {buildConditionsText(circle, cycle, rachat, deposit)}
                    </Text>
                  </View>

                  {needsPayment && (
                    <View style={styles.summaryCard}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Frais de rachat des tours passés</Text>
                        <Text style={styles.summaryValue}>{formatXOF(rachat)}</Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Dépôt de garantie</Text>
                        <Text style={styles.summaryValue}>{formatXOF(deposit)}</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                        <Text style={styles.summaryLabelTotal}>Total à payer</Text>
                        <Text style={styles.summaryValueTotal}>{formatXOF(total)}</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setConditionsAccepted(!conditionsAccepted)}>
                    <View style={[styles.checkbox, conditionsAccepted && styles.checkboxActive]}>
                      {conditionsAccepted && <Check size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.checkboxLabel}>J'ai lu et j'accepte les conditions du cercle</Text>
                  </TouchableOpacity>

                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.btnSecondary} onPress={reset}>
                      <Text style={styles.btnSecondaryText}>Retour</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnPrimary, !conditionsAccepted && styles.btnDisabled]}
                      disabled={!conditionsAccepted}
                      onPress={() => setStep('form')}
                    >
                      <Text style={styles.btnPrimaryText}>Suivant — mes informations</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {step === 'form' && circle && (
                <>
                  <Text style={styles.sectionTitle}>Vos informations</Text>

                  <Text style={styles.label}>Nom complet *</Text>
                  <TextInput style={styles.input} placeholder="Ex: Aminata Ouédraogo" placeholderTextColor="#94A3B8" value={form.fullName} onChangeText={(v) => setForm((p) => ({ ...p, fullName: v }))} />

                  <Text style={styles.label}>Numéro de téléphone *</Text>
                  <TextInput style={styles.input} placeholder="+226 70 12 34 56" placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={form.phoneNumber} onChangeText={(v) => setForm((p) => ({ ...p, phoneNumber: v }))} />

                  <Text style={styles.label}>Numéro de dépôt Mobile Money *</Text>
                  <TextInput style={styles.input} placeholder="+226 70 12 34 56" placeholderTextColor="#94A3B8" keyboardType="phone-pad" value={form.depositNumber} onChangeText={(v) => setForm((p) => ({ ...p, depositNumber: v }))} />

                  {accountVerified ? (
                    <View style={styles.verifiedNote}>
                      <ShieldCheck size={18} color="#059669" />
                      <Text style={styles.verifiedNoteText}>
                        Identité vérifiée — aucune pièce à fournir. Vos informations sont transmises au fondateur,
                        qui validera votre entrée.
                      </Text>
                    </View>
                  ) : needsDocs ? (
                    <>
                      <Text style={[styles.sectionTitle, { marginTop: 6 }]}>Documents exigés</Text>
                      <Text style={styles.docSub}>Exigence du cercle : {kycLabel}</Text>

                      <Text style={styles.label}>CNIB recto</Text>
                      <TouchableOpacity style={[styles.uploadBox, docs.cnibFront && styles.uploadBoxDone]} onPress={() => setDocs((p) => ({ ...p, cnibFront: !p.cnibFront }))}>
                        <Upload size={18} color={docs.cnibFront ? '#059669' : '#64748B'} />
                        <Text style={[styles.uploadText, docs.cnibFront && { color: '#059669' }]}>
                          {docs.cnibFront ? 'CNIB recto ajouté' : 'Choisir le recto'}
                        </Text>
                        {docs.cnibFront && <Check size={18} color="#059669" />}
                      </TouchableOpacity>

                      <Text style={styles.label}>CNIB verso</Text>
                      <TouchableOpacity style={[styles.uploadBox, docs.cnibBack && styles.uploadBoxDone]} onPress={() => setDocs((p) => ({ ...p, cnibBack: !p.cnibBack }))}>
                        <Upload size={18} color={docs.cnibBack ? '#059669' : '#64748B'} />
                        <Text style={[styles.uploadText, docs.cnibBack && { color: '#059669' }]}>
                          {docs.cnibBack ? 'CNIB verso ajouté' : 'Choisir le verso'}
                        </Text>
                        {docs.cnibBack && <Check size={18} color="#059669" />}
                      </TouchableOpacity>

                      {needsSelfie && (
                        <>
                          <Text style={styles.label}>Selfie facial</Text>
                          <TouchableOpacity style={[styles.uploadBox, docs.selfie && styles.uploadBoxDone]} onPress={() => setDocs((p) => ({ ...p, selfie: !p.selfie }))}>
                            <Upload size={18} color={docs.selfie ? '#059669' : '#64748B'} />
                            <Text style={[styles.uploadText, docs.selfie && { color: '#059669' }]}>
                              {docs.selfie ? 'Selfie ajouté' : 'Prendre un selfie'}
                            </Text>
                            {docs.selfie && <Check size={18} color="#059669" />}
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  ) : null}

                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.btnSecondary} onPress={goBack}>
                      <Text style={styles.btnSecondaryText}>Retour</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnPrimary, (!formFilled || !docsOk) && styles.btnDisabled]}
                      disabled={!formFilled || !docsOk}
                      onPress={() => (needsPayment ? setStep('payment') : submitRequest())}
                    >
                      <Text style={styles.btnPrimaryText}>
                        {needsPayment ? 'Continuer vers le paiement' : 'Envoyer la demande'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {step === 'payment' && circle && (
                <>
                  <Text style={styles.sectionTitle}>Paiement de la place</Text>
                  <Text style={styles.subText}>
                    Réglez les frais d'adhésion pour finaliser votre demande. Le montant est vérifié avant
                    l'approbation du fondateur.
                  </Text>

                  <View style={styles.paySummary}>
                    <View style={styles.payRow}>
                      <Text style={styles.payLabel}>Frais de rachat des tours passés</Text>
                      <Text style={styles.payValue}>{formatXOF(rachat)}</Text>
                    </View>
                    <View style={styles.payRow}>
                      <Text style={styles.payLabel}>Dépôt de garantie</Text>
                      <Text style={styles.payValue}>{formatXOF(deposit)}</Text>
                    </View>
                    <View style={styles.payDivider} />
                    <View style={styles.payRow}>
                      <Text style={styles.payLabelTotal}>Total à payer</Text>
                      <Text style={styles.payValueTotal}>{formatXOF(total)}</Text>
                    </View>
                  </View>

                  <Text style={styles.label}>Opérateur de paiement</Text>
                  <View style={styles.operatorsRow}>
                    {OPERATORS.map((op) => {
                      const isSelected = selectedOperator === op.id;
                      return (
                        <TouchableOpacity
                          key={op.id}
                          style={[styles.operatorBox, isSelected && styles.operatorBoxSelected]}
                          onPress={() => setSelectedOperator(op.id)}
                        >
                          <Image source={operatorLogos[op.id]} style={styles.operatorLogo} contentFit="contain" />
                          <Text style={[styles.operatorName, isSelected && styles.operatorNameSelected]}>
                            {op.name}
                          </Text>
                          {isSelected && <Check size={14} color="#074B36" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep('form')}>
                      <Text style={styles.btnSecondaryText}>Retour</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleInitiatePayment}>
                      <Wallet size={17} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>Payer {formatXOF(total)}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {step === 'done' && (
                <View style={styles.doneContainer}>
                  <View style={styles.doneIcon}>
                    <Check size={32} color="#059669" />
                  </View>
                  <Text style={styles.doneTitle}>Demande envoyée !</Text>
                  <Text style={styles.doneText}>
                    {needsPayment ? (
                      <>
                        Paiement reçu (<Text style={{ fontWeight: '600' }}>{paymentRef}</Text>). Votre demande
                        d'adhésion à <Text style={{ fontWeight: '600' }}>{circle?.name}</Text> est en attente
                        de validation par le fondateur.
                      </>
                    ) : (
                      <>
                        Votre demande d'adhésion à <Text style={{ fontWeight: '600' }}>{circle?.name}</Text> est
                        en attente de validation par le fondateur.
                      </>
                    )}
                  </Text>
                  <TouchableOpacity style={styles.btnPrimary} onPress={() => router.back()}>
                    <Text style={styles.btnPrimaryText}>Retour aux cercles</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>

          {/* MODALE USSD */}
          <Modal visible={ussdModal} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Paiement de la place</Text>
                  <TouchableOpacity onPress={() => setUssdModal(false)}>
                    <X size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.ussdSub}>
                  Exécutez ce code USSD pour régler <Text style={{ fontWeight: '700', color: '#074B36' }}>{formatXOF(total)}</Text>.
                </Text>
                <View style={styles.ussdCodeBox}>
                  <Text style={styles.ussdCodeText}>{ussdCode}</Text>
                </View>
                <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnCopied]} onPress={handleCopyCode}>
                  {copied ? <Check size={17} color="#FFFFFF" /> : <Copy size={17} color="#FFFFFF" />}
                  <Text style={styles.copyBtnText}>{copied ? 'Copié !' : 'Copier le code'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.88} onPress={handleExecuteUssd} disabled={detecting}>
                  {detecting ? <Loader size={17} color="#FFFFFF" /> : <Smartphone size={17} color="#FFFFFF" />}
                  <Text style={styles.primaryBtnText}>
                    {detecting ? 'Paiement détecté…' : 'Exécuter le code USSD'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const operatorLogos: Record<string, any> = {
  ORANGE: require('../../../../assets/operators/orange.png'),
  MOOV: require('../../../../assets/operators/moov.png'),
  WAVE: require('../../../../assets/operators/wave.png'),
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 24 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'SoraBold',
    fontSize: 17,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSub: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressRow: { flexDirection: 'row', gap: 8 },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressSegmentActive: { backgroundColor: '#36E395' },
  bodySheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 22,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, gap: 12 },
  sectionTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#074B36', marginTop: 6 },
  subText: { fontFamily: 'WorkSans', fontSize: 13, lineHeight: 19, color: '#64748B' },
  label: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#334155', marginTop: 10, marginBottom: 2 },
  docSub: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B', marginBottom: 4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    fontFamily: 'WorkSans',
    fontSize: 14,
    color: '#0F172A',
  },
  searchHero: { alignItems: 'center', paddingTop: 26, gap: 14 },
  searchIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTitle: { fontFamily: 'SoraBold', fontSize: 22, color: '#0F172A', textAlign: 'center' },
  searchSubtitle: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  searchRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    fontFamily: 'WorkSans',
    fontSize: 15,
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  searchBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#074B36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundHint: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12.5,
    color: '#DC2626',
    textAlign: 'center',
  },
  searchHint: { fontFamily: 'WorkSans', fontSize: 11.5, color: '#94A3B8', textAlign: 'center' },
  btnDisabled: { opacity: 0.4 },
  circleInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 6,
  },
  circleInfoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circleName: { fontFamily: 'SoraBold', fontSize: 15, color: '#0F172A' },
  circleMeta: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B', marginTop: 2 },
  circleInfoDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  circleCotisation: { fontFamily: 'WorkSans', fontSize: 13, color: '#475569' },
  circleCotisationStrong: { fontFamily: 'WorkSansSemiBold', color: '#074B36' },
  phaseBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  phaseBadgeActive: { backgroundColor: 'rgba(217, 164, 65, 0.14)' },
  phaseBadgeNew: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  phaseBadgeText: { fontFamily: 'WorkSansSemiBold', fontSize: 11 },
  phaseBadgeTextActive: { color: '#B47818' },
  phaseBadgeTextNew: { color: '#059669' },
  ficheIntro: { fontFamily: 'WorkSans', fontSize: 12.5, lineHeight: 19, color: '#64748B', marginTop: -2 },
  conditionsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  autoTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: '#F1F3F6' },
  autoTagText: { fontFamily: 'WorkSansSemiBold', fontSize: 9.5, color: '#94A3B8' },
  conditionsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  conditionsText: { fontFamily: 'WorkSans', fontSize: 12.5, lineHeight: 19, color: '#334155' },
  summaryCard: {
    backgroundColor: 'rgba(7, 75, 54, 0.05)',
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryRowTotal: { borderTopWidth: 1, borderTopColor: 'rgba(7, 75, 54, 0.15)', paddingTop: 10 },
  summaryLabel: { fontFamily: 'WorkSans', fontSize: 13, color: '#475569' },
  summaryValue: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#0F172A' },
  summaryLabelTotal: { fontFamily: 'SoraBold', fontSize: 14, color: '#074B36' },
  summaryValueTotal: { fontFamily: 'SoraBold', fontSize: 16, color: '#074B36' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: { backgroundColor: '#074B36', borderColor: '#074B36' },
  checkboxLabel: { flex: 1, fontFamily: 'WorkSans', fontSize: 13.5, color: '#334155' },
  verifiedNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  verifiedNoteText: { flex: 1, fontFamily: 'WorkSans', fontSize: 12.5, lineHeight: 18, color: '#065F46' },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  uploadBoxDone: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.04)', borderStyle: 'solid' },
  uploadText: { flex: 1, fontFamily: 'WorkSans', fontSize: 13, color: '#64748B' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimaryText: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#FFFFFF' },
  btnSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: '#475569' },
  paySummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 8,
    marginTop: 8,
  },
  payRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payLabel: { fontFamily: 'WorkSans', fontSize: 13, color: '#64748B' },
  payValue: { fontFamily: 'WorkSansSemiBold', fontSize: 13.5, color: '#0F172A' },
  payDivider: { height: 1, backgroundColor: '#F1F5F9' },
  payLabelTotal: { fontFamily: 'SoraBold', fontSize: 14.5, color: '#074B36' },
  payValueTotal: { fontFamily: 'SoraBold', fontSize: 17, color: '#074B36' },
  operatorsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  operatorBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  operatorBoxSelected: { borderColor: '#074B36', backgroundColor: 'rgba(7, 75, 54, 0.04)' },
  operatorLogo: { width: 34, height: 34 },
  operatorName: { fontFamily: 'WorkSansSemiBold', fontSize: 11.5, color: '#64748B', textAlign: 'center' },
  operatorNameSelected: { color: '#074B36' },
  doneContainer: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneTitle: { fontFamily: 'SoraBold', fontSize: 20, color: '#0F172A' },
  doneText: { fontFamily: 'WorkSans', fontSize: 14.5, lineHeight: 21, color: '#64748B', textAlign: 'center', paddingHorizontal: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    width: '100%',
    gap: 12,
  },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontFamily: 'SoraBold', fontSize: 17, color: '#074B36' },
  ussdSub: { fontFamily: 'WorkSans', fontSize: 12.5, lineHeight: 18, color: '#64748B' },
  ussdCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  ussdCodeText: { fontFamily: 'SoraBold', fontSize: 20, color: '#074B36', letterSpacing: 1, textAlign: 'center' },
  copyBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#074B36',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  copyBtnCopied: { backgroundColor: '#059669' },
  copyBtnText: { fontFamily: 'SoraBold', fontSize: 14, color: '#FFFFFF' },
  primaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: { fontFamily: 'SoraBold', fontSize: 14, color: '#FFFFFF' },
});
