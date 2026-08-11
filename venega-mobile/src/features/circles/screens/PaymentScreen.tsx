import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  Linking,
  AppState,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Smartphone,
  Copy,
  PhoneCall,
  User,
  Check,
  X,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const formatXOF = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';

// Logos opérateurs — images locales dans assets/operators/
const operatorLogos: Record<string, any> = {
  ORANGE: require('../../../../assets/operators/orange.png'),
  MOOV: require('../../../../assets/operators/moov.png'),
  WAVE: require('../../../../assets/operators/wave.png'),
};

const OPERATORS = [
  { id: 'ORANGE', name: 'Orange Money', color: '#FF7900', ussdPrefix: '*144*4*6*' },
  { id: 'MOOV', name: 'Moov Africa', color: '#005CA9', ussdPrefix: '*155*4*1*' },
  { id: 'WAVE', name: 'Wave', color: '#1DC3F6', ussdPrefix: '*800*' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ circleId?: string; amount?: string }>();
  const rawAmount = parseFloat(params.amount || '10500');

  const cotisationShare = Math.max(rawAmount - 500, 1000);
  const feeShare = Math.min(500, rawAmount - cotisationShare);

  const [selectedOperator, setSelectedOperator] = useState('ORANGE');
  const [phoneNumber, setPhoneNumber] = useState('70 12 34 56');
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const currentOp = OPERATORS.find((op) => op.id === selectedOperator) ?? OPERATORS[0]!;
  const ussdCode = `${currentOp.ussdPrefix}70001122*${Math.round(rawAmount)}#`;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && paymentInitiated) {
        setShowUssdModal(false);
        setShowConfirmationModal(true);
        setPaymentInitiated(false);
      }
    });
    return () => subscription.remove();
  }, [paymentInitiated]);

  const handleInitiatePayment = () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez vérifier votre numéro.');
      return;
    }
    setPaymentInitiated(true);
    setShowUssdModal(true);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDial = () => {
    const encodedUssd = encodeURIComponent(ussdCode);
    Linking.openURL(`tel:${encodedUssd}`).catch(() => {
      Alert.alert('Code USSD', ussdCode);
    });
    setTimeout(() => {
      setShowUssdModal(false);
      setShowConfirmationModal(true);
      setPaymentInitiated(false);
    }, 1500);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
    router.replace('/(tabs)/circles');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.topSection}>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Paiement de la cotisation</Text>
              <View style={{ width: 38 }} />
            </View>

            <View style={styles.amountDisplayCard}>
              <Text style={styles.amountLabelText}>Montant total de la cotisation</Text>
              <Text style={styles.amountValueText}>{formatXOF(rawAmount)}</Text>
            </View>
          </View>

          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Opérateurs avec vrais logos */}
              <Text style={styles.sectionHeading}>Opérateur Mobile Money</Text>
              <View style={styles.operatorsRow}>
                {OPERATORS.map((op) => {
                  const isSelected = op.id === selectedOperator;
                  return (
                    <TouchableOpacity
                      key={op.id}
                      style={[styles.operatorCard, isSelected && styles.operatorCardSelected]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedOperator(op.id)}
                    >
                      <Image
                        source={operatorLogos[op.id]}
                        style={styles.operatorLogo}
                        contentFit="contain"
                      />
                      <Text style={[styles.opNameText, isSelected && styles.opNameTextSelected]}>
                        {op.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Numéro source */}
              <Text style={styles.sectionHeading}>Votre numéro</Text>
              <View style={styles.pillInputWrapper}>
                <Smartphone size={18} color="#074B36" />
                <Text style={styles.prefixText}>+226</Text>
                <View style={styles.prefixDivider} />
                <TextInput
                  style={styles.pillInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Compte récepteur — simple */}
              <Text style={styles.sectionHeading}>Compte récepteur</Text>
              <View style={styles.recipientCard}>
                <View style={styles.recipientIconWrap}>
                  <User size={18} color="#074B36" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recipientTitle}>+226 {phoneNumber}</Text>
                  <Text style={styles.recipientSub}>Les fonds sont versés sur votre compte</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryPillBtn}
                activeOpacity={0.88}
                onPress={handleInitiatePayment}
              >
                <Lock size={18} color="#FFFFFF" />
                <Text style={styles.primaryPillBtnText}>Initier le paiement</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Modal USSD */}
          <Modal visible={showUssdModal} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <Animated.View entering={FadeInDown.duration(400)} style={styles.modalCard}>
                <Text style={styles.modalTitle}>Exécution du paiement</Text>

                <View style={styles.breakdownBox}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Cotisation :</Text>
                    <Text style={styles.breakdownVal}>{formatXOF(cotisationShare)}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Frais :</Text>
                    <Text style={styles.breakdownVal}>{formatXOF(feeShare)}</Text>
                  </View>
                  <View style={styles.breakdownDivider} />
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownTotalLabel}>Total :</Text>
                    <Text style={styles.breakdownTotalVal}>{formatXOF(rawAmount)}</Text>
                  </View>
                </View>

                <Text style={styles.ussdLabel}>Code USSD de transaction</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{ussdCode}</Text>
                </View>

                <View style={styles.iconActionsRow}>
                  <TouchableOpacity
                    style={[styles.iconActionBtn, copied && styles.iconActionBtnDone]}
                    onPress={handleCopy}
                    activeOpacity={0.8}
                  >
                    {copied ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color="#074B36" />}
                    <Text style={[styles.iconActionBtnText, copied && styles.iconActionBtnTextDone]}>
                      {copied ? 'Copié !' : 'Copier'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.iconActionBtnPrimary} onPress={handleDial} activeOpacity={0.8}>
                    <PhoneCall size={18} color="#FFFFFF" />
                    <Text style={styles.iconActionBtnTextPrimary}>Appeler</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowUssdModal(false)}>
                  <Text style={styles.modalCloseText}>Annuler</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>

          {/* Modal confirmation au retour */}
          <Modal visible={showConfirmationModal} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <Animated.View entering={FadeInDown.duration(400)} style={styles.modalCard}>
                <View style={styles.successIconWrap}>
                  <CheckCircle2 size={54} color="#10B981" />
                </View>
                <Text style={styles.successModalTitle}>Paiement Réussi</Text>

                <View style={styles.infoRecapBox}>
                  <View style={styles.infoRecapRow}>
                    <Text style={styles.infoRecapLabel}>Montant :</Text>
                    <Text style={styles.infoRecapVal}>{formatXOF(rawAmount)}</Text>
                  </View>
                  <View style={styles.infoRecapRow}>
                    <Text style={styles.infoRecapLabel}>Opérateur :</Text>
                    <Text style={styles.infoRecapVal}>{currentOp.name}</Text>
                  </View>
                  <View style={styles.infoRecapRow}>
                    <Text style={styles.infoRecapLabel}>Référence :</Text>
                    <Text style={styles.infoRecapVal}>PAY-{Math.floor(100000 + Math.random() * 900000)}</Text>
                  </View>
                  <View style={styles.infoRecapRow}>
                    <Text style={styles.infoRecapLabel}>Date :</Text>
                    <Text style={styles.infoRecapVal}>{new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.primaryPillBtnFull}
                  activeOpacity={0.88}
                  onPress={handleCloseConfirmation}
                >
                  <Text style={styles.primaryPillBtnText}>Fermer</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#074B36' },
  topSection: { backgroundColor: '#074B36', paddingHorizontal: 20, paddingBottom: 36 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'SoraBold', fontSize: 18, color: '#FFFFFF' },
  amountDisplayCard: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 20, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.18)' },
  amountLabelText: { fontFamily: 'WorkSans', fontSize: 13, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 4 },
  amountValueText: { fontFamily: 'SoraBold', fontSize: 28, color: '#36E395' },
  formCardSheet: { flex: 1, backgroundColor: '#FAF7F1', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -20, paddingTop: 24 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, gap: 16 },
  sectionHeading: { fontFamily: 'SoraBold', fontSize: 15, color: '#074B36', marginTop: 6 },
  operatorsRow: { flexDirection: 'row', gap: 10 },
  operatorCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  operatorCardSelected: { borderColor: '#074B36', backgroundColor: 'rgba(7, 75, 54, 0.05)' },
  operatorLogo: { width: 40, height: 40, borderRadius: 10 },
  opNameText: { fontFamily: 'WorkSansMedium', fontSize: 11.5, color: '#64748B', textAlign: 'center' },
  opNameTextSelected: { fontFamily: 'WorkSansBold', color: '#074B36' },
  pillInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 25, paddingHorizontal: 18, height: 52, gap: 10 },
  prefixText: { fontFamily: 'WorkSansSemiBold', fontSize: 14, color: '#0F172A' },
  prefixDivider: { width: 1, height: 18, backgroundColor: '#CBD5E1' },
  pillInput: { flex: 1, fontFamily: 'WorkSans', fontSize: 14.5, color: '#0F172A' },
  recipientCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, borderWidth: 1.5, borderColor: '#E2E8F0', gap: 12 },
  recipientIconWrap: { width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(7, 75, 54, 0.08)', justifyContent: 'center', alignItems: 'center' },
  recipientTitle: { fontFamily: 'SoraBold', fontSize: 14, color: '#0F172A' },
  recipientSub: { fontFamily: 'WorkSans', fontSize: 12, color: '#64748B', marginTop: 1 },
  primaryPillBtn: { height: 52, backgroundColor: '#074B36', borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 14, shadowColor: '#074B36', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  primaryPillBtnFull: { height: 52, width: '100%', backgroundColor: '#074B36', borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  primaryPillBtnText: { fontFamily: 'SoraBold', fontSize: 15.5, color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: '#FAF7F1', borderRadius: 28, padding: 22, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  modalTitle: { fontFamily: 'SoraBold', fontSize: 20, color: '#074B36', marginBottom: 14 },
  breakdownBox: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, width: '100%', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14, gap: 6 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  breakdownLabel: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#64748B' },
  breakdownVal: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#0F172A' },
  breakdownDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },
  breakdownTotalLabel: { fontFamily: 'SoraBold', fontSize: 13.5, color: '#074B36' },
  breakdownTotalVal: { fontFamily: 'SoraBold', fontSize: 16, color: '#074B36' },
  ussdLabel: { fontFamily: 'WorkSansSemiBold', fontSize: 12, color: '#64748B', alignSelf: 'flex-start', marginBottom: 4 },
  codeBox: { backgroundColor: '#0F172A', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 14 },
  codeText: { fontFamily: 'SoraBold', fontSize: 17, color: '#36E395', letterSpacing: 1.1 },
  iconActionsRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 14 },
  iconActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#074B36' },
  iconActionBtnDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  iconActionBtnText: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#074B36' },
  iconActionBtnTextDone: { color: '#FFFFFF' },
  iconActionBtnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 22, backgroundColor: '#074B36' },
  iconActionBtnTextPrimary: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#FFFFFF' },
  modalCloseBtn: { paddingVertical: 8 },
  modalCloseText: { fontFamily: 'WorkSansMedium', fontSize: 13, color: '#64748B' },
  successIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  successModalTitle: { fontFamily: 'SoraBold', fontSize: 22, color: '#074B36', marginBottom: 14 },
  infoRecapBox: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, width: '100%', borderWidth: 1.5, borderColor: '#E2E8F0', gap: 8 },
  infoRecapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRecapLabel: { fontFamily: 'WorkSans', fontSize: 12.5, color: '#64748B' },
  infoRecapVal: { fontFamily: 'WorkSansSemiBold', fontSize: 13, color: '#0F172A' },
});
