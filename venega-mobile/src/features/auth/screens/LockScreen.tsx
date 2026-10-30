import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Fingerprint } from 'lucide-react-native';
import { colors, typography } from '@venega/design-tokens';
import { Button } from '../../../components/ui';
import { authenticate, setLockShown } from '../../../lib/appLock';
import { logout } from '../api';

// Logo d'origine sur carte blanche (jamais recoloré), comme l'écran de démarrage.
const symbolImg = require('../../../../assets/splash.png');

/**
 * Écran affiché à l'ouverture (ou au retour après quelques minutes) quand le verrou est activé.
 * `next=tabs` : ouverture de l'app → accueil ; sinon on revient simplement à l'écran précédent.
 */
export default function LockScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [failed, setFailed] = useState(false);

  const unlock = useCallback(async () => {
    setFailed(false);
    if (await authenticate()) {
      setLockShown(false);
      if (next === 'tabs' || !router.canGoBack()) router.replace('/(tabs)');
      else router.back();
    } else {
      setFailed(true);
    }
  }, [next, router]);

  useEffect(() => {
    setLockShown(true);
    unlock();
  }, []);

  // Le bouton retour d'Android ne doit pas contourner le verrou.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  const signOut = async () => {
    await logout();
    setLockShown(false);
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.center}>
        <View style={styles.card}>
          <Image source={symbolImg} style={styles.symbol} contentFit="contain" />
        </View>
        <Text style={styles.title}>Venega est verrouillé</Text>
        <Text style={styles.text}>
          {failed
            ? 'Déverrouillage annulé ou non reconnu. Réessayez.'
            : 'Utilisez votre empreinte, ou le code ou le schéma de votre téléphone.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Déverrouiller" icon={Fingerprint} variant="secondary" onPress={unlock} />
        <TouchableOpacity onPress={signOut} hitSlop={8} activeOpacity={0.6} style={styles.signOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  symbol: { width: 64, height: 64 },
  title: {
    ...typography.title,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  text: {
    ...typography.callout,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 10,
  },
  actions: {
    gap: 16,
  },
  signOut: {
    alignSelf: 'center',
  },
  signOutText: {
    ...typography.callout,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
});
