import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ShieldCheck,
  BadgeCheck,
  User,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Mail,
  X,
  Check,
  Camera,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getProfile } from '../profileStore';

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

const FAQ_ITEMS = [
  {
    question: 'Comment fonctionnent les tours de tontine ?',
    answer: 'À chaque tour, tous les membres versent leur cotisation. La somme totale collectée est attribuée automatiquement au bénéficiaire désigné pour ce tour.',
  },
  {
    question: 'Que se passe-t-il si un membre prend du retard ?',
    answer: 'Des pénalités peuvent s\'appliquer selon les règles du président. Le score de fiabilité du membre diminue et il peut être relancé ou remplacé.',
  },
  {
    question: 'Comment se fait le paiement des cotisations ?',
    answer: 'Les paiements s\'effectuent directement via Mobile Money (Orange Money, Moov Money, Wave) vers votre compte personnel Citney.',
  },
  {
    question: 'Comment vérifier mon identité ?',
    answer: 'Rendez-vous dans la rubrique "Vérification d\'identité" pour soumettre votre CNIB (photo ou upload) et réaliser votre selfie de confirmation.',
  },
];

export default function ProfileScreen() {
  const router = useRouter();

  // User state
  const [user, setUser] = useState({
    name: 'Aminata Ouédraogo',
    phone: '70 12 34 56',
    email: 'aminata.ouedraogo@example.com',
    avatarUrl: '',
    isVerified: true,
  });

  // Modal States
  const [showEditPhoneModal, setShowEditPhoneModal] = useState(false);
  const [newPhone, setNewPhone] = useState(user.phone);

  const [showFaqModal, setShowFaqModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const { avatarUrl } = getProfile();
      setUser((prev) => (prev.avatarUrl === avatarUrl ? prev : { ...prev, avatarUrl }));
    }, [])
  );


  const handleSavePhone = () => {
    if (!newPhone.trim()) return;
    setUser((prev) => ({ ...prev, phone: newPhone }));
    setShowEditPhoneModal(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#074B36" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* En-tête vert premium, centré */}
        <View style={styles.topSection}>
          <View style={styles.userCardHeader}>
            <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.85} onPress={() => router.push('/profile-photo' as any)}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <View style={styles.avatarInitials}>
                  <Text style={styles.avatarInitialsText}>{getInitials(user.name)}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera size={12} color="#074B36" />
              </View>
            </TouchableOpacity>
            <View style={styles.userInfoCol}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>+226 {user.phone}</Text>
              <View style={styles.kycStatusTag}>
                <ShieldCheck size={13} color="#36E395" />
                <Text style={styles.kycStatusText}>Compte Vérifié</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Corps crème emboîté */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.formCardSheet}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Section 1: Compte & Sécurité */}
            <Text style={styles.sectionTitle}>Compte & Sécurité</Text>
            <View style={styles.menuGroupCard}>
              <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/profile-setup')}>
                <View style={styles.menuIconWrap}>
                  <User size={18} color="#64748B" />
                </View>
                <Text style={styles.menuTextTitle}>Informations personnelles</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/kyc-upload')}>
                <View style={styles.menuIconWrap}>
                  <BadgeCheck size={18} color="#64748B" />
                </View>
                <Text style={styles.menuTextTitle}>Pièce d'identité (CNIB)</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuRow}>
                <View style={styles.menuIconWrap}>
                  <Lock size={18} color="#64748B" />
                </View>
                <Text style={styles.menuTextTitle}>Mot de passe</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Section 2: Mobile Money */}
            <Text style={styles.sectionTitle}>Mobile Money</Text>
            <View style={styles.menuGroupCard}>
              <TouchableOpacity style={styles.menuRow} onPress={() => { setNewPhone(user.phone); setShowEditPhoneModal(true); }}>
                <View style={styles.menuIconWrap}>
                  <Smartphone size={18} color="#64748B" />
                </View>
                <Text style={styles.menuTextTitle}>Numéro pour recevoir les cagnottes</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Section 3: Assistance */}
            <Text style={styles.sectionTitle}>Assistance</Text>
            <View style={styles.menuGroupCard}>
              <TouchableOpacity style={styles.menuRow} onPress={() => setShowFaqModal(true)}>
                <View style={styles.menuIconWrap}>
                  <HelpCircle size={18} color="#64748B" />
                </View>
                <Text style={styles.menuTextTitle}>Centre d'aide</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuRow}>
                <View style={styles.menuIconWrap}>
                  <BadgeCheck size={18} color="#64748B" />
                </View>
                <Text style={styles.menuTextTitle}>Conditions d'utilisation</Text>
                <ChevronRight size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
              <LogOut size={16} color="#E53E3E" />
              <Text style={styles.logoutBtnText}>Se déconnecter</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Modal 1: Modifier le numéro Mobile Money */}
        <Modal visible={showEditPhoneModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Numéro Mobile Money</Text>
                <TouchableOpacity onPress={() => setShowEditPhoneModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubText}>
                Ce numéro sera utilisé pour recevoir les versements de vos cotisations et les bénéfices de vos tours.
              </Text>

              <View style={styles.modalInputWrapper}>
                <Smartphone size={18} color="#074B36" />
                <Text style={styles.prefixText}>+226</Text>
                <View style={styles.prefixDivider} />
                <TextInput
                  style={styles.modalInput}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity style={styles.primaryPillBtn} onPress={handleSavePhone}>
                <Check size={18} color="#FFFFFF" />
                <Text style={styles.primaryPillBtnText}>Enregistrer le numéro</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal 2: Centre d'aide & FAQ Premium */}
        <Modal visible={showFaqModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.faqModalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={22} color="#074B36" />
                  <Text style={styles.modalTitle}>Centre d'aide & FAQ</Text>
                </View>
                <TouchableOpacity onPress={() => setShowFaqModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <View key={index} style={styles.faqItemCard}>
                      <TouchableOpacity
                        style={styles.faqItemHeader}
                        onPress={() => setExpandedFaq(isOpen ? null : index)}
                      >
                        <Text style={styles.faqQuestion}>{item.question}</Text>
                        {isOpen ? <ChevronUp size={18} color="#074B36" /> : <ChevronDown size={18} color="#94A3B8" />}
                      </TouchableOpacity>
                      {isOpen && <Text style={styles.faqAnswer}>{item.answer}</Text>}
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.contactSupportBox}>
                <Text style={styles.contactTitle}>Besoin d'aide directe ?</Text>
                <View style={styles.contactRow}>
                  <TouchableOpacity style={styles.contactBtn} onPress={() => {}}>
                    <PhoneCall size={16} color="#074B36" />
                    <Text style={styles.contactBtnText}>+226 25 00 00 00</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contactBtn} onPress={() => {}}>
                    <Mail size={16} color="#074B36" />
                    <Text style={styles.contactBtnText}>support@venega.app</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.secondaryPillBtn} onPress={() => setShowFaqModal(false)}>
                <Text style={styles.secondaryPillBtnText}>Fermer</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Modal 3: Déconnexion Custom Premium */}
        <Modal visible={showLogoutModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInDown.duration(300)} style={styles.logoutModalCard}>
              <View style={styles.logoutIconCircle}>
                <LogOut size={32} color="#EF4444" />
              </View>
              <Text style={styles.logoutModalTitle}>Se déconnecter ?</Text>
              <Text style={styles.logoutModalSub}>
                Êtes-vous sûr de vouloir fermer votre session sur l'application Venega ?
              </Text>

              <View style={styles.logoutActionsRow}>
                <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowLogoutModal(false)}>
                  <Text style={styles.cancelModalBtnText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmLogoutBtn} onPress={handleConfirmLogout}>
                  <Text style={styles.confirmLogoutBtnText}>Déconnexion</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#074B36',
  },
  topSection: {
    backgroundColor: '#074B36',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  userCardHeader: {
    alignItems: 'center',
    gap: 8,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D9A441',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarInitialsText: {
    fontFamily: 'SoraBold',
    fontSize: 26,
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#074B36',
  },
  userInfoCol: {
    alignItems: 'center',
    gap: 3,
  },
  userName: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  userPhone: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  kycStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    backgroundColor: 'rgba(54, 227, 149, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  kycStatusText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#36E395',
  },
  formCardSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 18,
  },
  sectionTitle: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  menuGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 22,
    alignItems: 'center',
  },
  menuTextTitle: {
    flex: 1,
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#1A202C',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFECEC',
    marginTop: 4,
  },
  logoutBtnText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 13.5,
    color: '#E53E3E',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
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
    gap: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 18,
    color: '#074B36',
  },
  modalSubText: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 52,
    gap: 10,
  },
  prefixText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  prefixDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  modalInput: {
    flex: 1,
    fontFamily: 'WorkSans',
    fontSize: 14.5,
    color: '#0F172A',
  },
  primaryPillBtn: {
    height: 50,
    backgroundColor: '#074B36',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryPillBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryPillBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryPillBtnText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  faqModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    width: '100%',
    gap: 14,
  },
  faqItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 8,
  },
  faqItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontFamily: 'SoraBold',
    fontSize: 13.5,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontFamily: 'WorkSans',
    fontSize: 12.5,
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
  },
  contactSupportBox: {
    backgroundColor: 'rgba(7, 75, 54, 0.06)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  contactTitle: {
    fontFamily: 'SoraBold',
    fontSize: 13,
    color: '#074B36',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactBtnText: {
    fontFamily: 'WorkSansMedium',
    fontSize: 11.5,
    color: '#074B36',
  },
  logoutModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  logoutIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoutModalTitle: {
    fontFamily: 'SoraBold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 6,
  },
  logoutModalSub: {
    fontFamily: 'WorkSans',
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  logoutActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#475569',
  },
  confirmLogoutBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmLogoutBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
