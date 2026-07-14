import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { Users, TrendingUp, Shield, ArrowRight } from 'lucide-react-native';
import { colors, spacing, radius } from '../../../../packages/design-tokens/src';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const features = [
    { icon: <Users size={28} color={colors.primary.DEFAULT} />, title: 'Tontine & Solidarité', description: 'Gérez vos groupes facilement, avec transparence.' },
    { icon: <TrendingUp size={28} color={colors.primary.DEFAULT} />, title: 'Paiements Rapides', description: 'Intégré à Orange Money et Moov Money.' },
    { icon: <Shield size={28} color={colors.primary.DEFAULT} />, title: 'Sécurité & Confiance', description: 'Vos données sont protégées, vos fonds sécurisés.' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>Venega</Text>
        </View>

        <View style={styles.hero}>
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.heroImageContainer}>
            <View style={styles.heroImage} />
            <View style={styles.badge}>
              <Users size={16} color={colors.primary.DEFAULT} />
              <Text style={styles.badgeText}>+2 400 membres actifs</Text>
            </View>
          </Animatable.View>

          <Animatable.Text animation="fadeInUp" duration={1000} delay={200} style={styles.title}>
            Gérer votre épargne{'\n'}en communauté{' '}
            <Text style={{ color: colors.primary.DEFAULT }}>simplement</Text>
          </Animatable.Text>

          <Animatable.Text animation="fadeInUp" duration={1000} delay={400} style={styles.subtitle}>
            Digitalisez vos tontines et votre caisse de solidarité, avec une interface claire et moderne.
          </Animatable.Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <Animatable.View key={index} animation="fadeInUp" duration={1000} delay={600 + index * 150} style={styles.featureCard}>
              <View style={styles.featureIcon}>{feature.icon}</View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.description}</Text>
            </Animatable.View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.replace('/register')}>
          <Text style={styles.btnPrimaryText}>Créer un compte</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => router.replace('/login')}>
          <Text style={styles.btnOutlineText}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing[6] },
  header: { paddingVertical: spacing[6] },
  logo: { fontFamily: 'Sora', fontSize: 32, color: colors.primary.DEFAULT, fontWeight: '800' },
  hero: { marginTop: spacing[6] },
  heroImageContainer: { position: 'relative', marginBottom: spacing[8] },
  heroImage: { width: '100%', height: 240, borderRadius: radius.lg, backgroundColor: colors.primary.tint },
  badge: {
    position: 'absolute', bottom: -16, right: spacing[6],
    backgroundColor: colors.surface, paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    shadowColor: colors.primary.DEFAULT, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  badgeText: { fontFamily: 'WorkSans', fontSize: 13, color: colors.text, fontWeight: '600' },
  title: { fontFamily: 'Sora', fontSize: 32, lineHeight: 38, color: colors.text, fontWeight: '800', marginBottom: spacing[4] },
  subtitle: { fontFamily: 'WorkSans', fontSize: 16, color: colors.textMuted, lineHeight: 26 },
  features: { marginTop: spacing[8], gap: spacing[6] },
  featureCard: {
    backgroundColor: colors.surface, padding: spacing[6], borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  featureIcon: {
    width: 52, height: 52, backgroundColor: colors.primary.tint,
    borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4],
  },
  featureTitle: { fontFamily: 'Sora', fontSize: 18, color: colors.text, fontWeight: '700', marginBottom: spacing[1] },
  featureDesc: { fontFamily: 'WorkSans', fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface,
    paddingHorizontal: spacing[6], paddingVertical: spacing[8],
    borderTopWidth: 1, borderColor: colors.border, shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10,
    elevation: 4, gap: spacing[4],
  },
  btnPrimary: {
    backgroundColor: colors.primary.DEFAULT, paddingVertical: spacing[6],
    borderRadius: radius.lg, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: spacing[2],
  },
  btnPrimaryText: { fontFamily: 'WorkSans', fontSize: 16, color: '#fff', fontWeight: '600' },
  btnOutline: {
    paddingVertical: spacing[6], borderRadius: radius.lg, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  btnOutlineText: { fontFamily: 'WorkSans', fontSize: 16, color: colors.text, fontWeight: '600' },
});
