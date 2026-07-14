import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, radius } from '@venega/design-tokens/src/native';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowRight size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.header}
          >
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Content de vous revoir !</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.form}
          >
            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <View style={styles.inputWrapper}>
                <Phone
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="+226 70 12 34 56"
                  placeholderTextColor={colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Lock
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textMuted} />
                  ) : (
                    <Eye size={20} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  header: {
    marginBottom: spacing[8],
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Sora',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
  },
  form: {
    gap: spacing[6],
  },
  inputContainer: {
    gap: spacing[2],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'WorkSans',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    height: 56,
  },
  inputIcon: {
    marginRight: spacing[3],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontFamily: 'WorkSans',
  },
  eyeButton: {
    padding: spacing[2],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.DEFAULT,
    fontFamily: 'WorkSans',
  },
  loginButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing[2],
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'WorkSans',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: spacing[6],
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'WorkSans',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
    fontFamily: 'WorkSans',
  },
});
