import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowRight, ShieldCheck, Sparkles, Users } from 'lucide-react-native';

const logoImg = require('../../../../assets/venega-logo.png');
const slide4Img = require('../../../../assets/images/onboarding/slide4.png');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F1" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo Officiel Venega */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <Image source={logoImg} style={styles.logoImage} contentFit="contain" />
          </Animated.View>

          {/* Hero Poster Section avec slide4.jpg */}
          <Animated.View entering={FadeInUp.delay(150).duration(800)} style={styles.hero}>
            <View style={styles.posterCard}>
              <Image
                source={slide4Img}
                style={styles.posterImg}
                contentFit="cover"
                transition={300}
              />
            </View>
          </Animated.View>

          {/* Accroche Principale */}
          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.content}>
            <Text style={styles.mainTitle}>
              Prêt à commencer ?{'\n'}Rejoignez <Text style={styles.accentText}>Venega</Text> dès aujourd'hui !
            </Text>
            <Text style={styles.subTitle}>
              Accédez à des cercles d'épargne transparents, gérez vos cotisations en toute sérénité et développez la solidarité de votre communauté.
            </Text>
          </Animated.View>

          {/* Avantages Clés Premium */}
          <Animated.View entering={FadeInUp.delay(450).duration(800)} style={styles.benefitsGroup}>
            <View style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <ShieldCheck size={20} color="#074B36" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>Transparence absolue</Text>
                <Text style={styles.benefitDesc}>Chaque versement et tour de rotation est traçable à tout moment.</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <Users size={20} color="#074B36" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>Fondateurs vérifiés</Text>
                <Text style={styles.benefitDesc}>Un suivi rigoureux des rôles et des cotisations du groupe.</Text>
              </View>
            </View>

            <View style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <Sparkles size={20} color="#074B36" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>Paiements instantanés</Text>
                <Text style={styles.benefitDesc}>Intégration directe avec vos comptes Mobile Money habituels.</Text>
              </View>
            </View>
          </Animated.View>

          {/* Boutons d'Action CTAs */}
          <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.ctaGroup}>
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.88}
              onPress={() => router.replace('/register')}
            >
              <Text style={styles.primaryBtnText}>Créer un compte</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.75}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.secondaryBtnText}>J'ai déjà un compte</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F1',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 200,
    height: 64,
  },
  hero: {
    marginTop: 10,
  },
  posterCard: {
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    height: 250,
    backgroundColor: 'transparent',
  },
  posterImg: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  content: {
    marginTop: 22,
  },
  mainTitle: {
    fontFamily: 'SoraBold',
    fontSize: 25,
    lineHeight: 33,
    color: '#0F172A',
    marginBottom: 8,
  },
  accentText: {
    color: '#074B36',
  },
  subTitle: {
    fontFamily: 'WorkSans',
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },
  benefitsGroup: {
    marginTop: 20,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  benefitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(7, 75, 54, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTitle: {
    fontFamily: 'WorkSansSemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  benefitDesc: {
    fontFamily: 'WorkSans',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  ctaGroup: {
    marginTop: 28,
    gap: 10,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#074B36',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#074B36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  secondaryBtnText: {
    fontFamily: 'SoraBold',
    fontSize: 15,
    color: '#0F172A',
  },
});

