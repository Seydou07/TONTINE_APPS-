import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const logoImg = require('../../../../assets/venega-logo.png');
const readyImg = require('../../../../assets/images/onboarding/ready.png');

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Page statique, sans défilement */}
        <View style={styles.content}>
          {/* Bouton retour vers l'onboarding */}
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.75}
            onPress={() => router.replace('/onboarding')}
          >
            <ArrowLeft size={20} color="#074B36" />
          </TouchableOpacity>

          {/* Logo Officiel Venega */}
          <Animated.View entering={FadeInDown.duration(700)} style={styles.header}>
            <Image source={logoImg} style={styles.logoImage} contentFit="contain" />
          </Animated.View>

          {/* Titres premium — même disposition que l'onboarding */}
          <Animated.View entering={FadeInDown.delay(100).duration(700)} style={styles.titlesWrap}>
            <View style={styles.tagRow}>
              <View style={styles.accentDot} />
              <Text style={styles.eyebrow}>DERNIÈRE ÉTAPE</Text>
            </View>

            <Text style={styles.title}>PRÊT À COMMENCER ?</Text>

            <View style={styles.dividerLine} />

            <Text style={styles.subtitle}>REJOIGNEZ VENEGA AUJOURD'HUI !</Text>

            <Text style={styles.desc}>
              Créez votre premier cercle, invitez vos proches et commencez à épargner ensemble en toute transparence.
            </Text>
          </Animated.View>

          {/* Illustration simple, sans photo ni ombre */}
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.imageWrap}>
            <Image source={readyImg} style={styles.readyImage} contentFit="contain" />
          </Animated.View>

          {/* Boutons d'Action CTAs */}
          <Animated.View entering={FadeInDown.delay(300).duration(700)} style={styles.ctaGroup}>
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(7, 75, 54, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  logoImage: {
    width: 150,
    height: 100,
  },
  titlesWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9A441',
  },
  eyebrow: {
    fontFamily: 'SoraBold',
    fontSize: 11,
    letterSpacing: 2.4,
    color: '#64748B',
  },
  title: {
    fontFamily: 'SoraBold',
    fontSize: 29,
    lineHeight: 35,
    color: '#074B36',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  dividerLine: {
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D9A441',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'SoraBold',
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  desc: {
    fontFamily: 'WorkSans',
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  imageWrap: {
    flex: 1,
    width: '100%',
    minHeight: 160,
    maxHeight: 250,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyImage: {
    width: '100%',
    height: '100%',
  },
  ctaGroup: {
    marginTop: 12,
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
