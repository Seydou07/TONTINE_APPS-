import React, { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { StyleProp, TextInputInstance, TextInputProps, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius, sizes, typography } from '@venega/design-tokens';

type Props = TextInputProps & {
  label?: string;
  /** Texte fixe avant la saisie (ex. « +226 »). */
  prefix?: string;
  /** Texte fixe après la saisie (ex. « F CFA »). */
  suffix?: string;
  hint?: string;
  error?: string;
  /** Champ mot de passe avec bouton afficher / masquer. */
  password?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Champ de formulaire : libellé au-dessus, saisie, aide ou erreur en dessous. */
const TextField: React.ForwardRefExoticComponent<Props & React.RefAttributes<TextInputInstance>> = forwardRef<TextInputInstance, Props>(function TextField(
  { label, prefix, suffix, hint, error, password, multiline, containerStyle, onFocus, onBlur, style, ...input },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? colors.danger.DEFAULT : focused ? colors.primary.DEFAULT : colors.lineStrong;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { borderColor, borderWidth: focused || error ? 1.5 : 1 },
        ]}
      >
        {prefix ? (
          <View style={styles.prefix}>
            <Text style={styles.affixText}>{prefix}</Text>
            <View style={styles.prefixDivider} />
          </View>
        ) : null}

        <TextInput
          ref={ref}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          placeholderTextColor={colors.subtle}
          secureTextEntry={password ? hidden : input.secureTextEntry}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...input}
        />

        {suffix ? <Text style={[styles.affixText, styles.suffix]}>{suffix}</Text> : null}

        {password ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
          >
            {hidden ? <Eye size={20} color={colors.subtle} /> : <EyeOff size={20} color={colors.subtle} />}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

export default TextField;

const styles = StyleSheet.create({
  label: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.inkSoft,
    marginBottom: 8,
  },
  field: {
    minHeight: sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.line,
  },
  affixText: {
    ...typography.body,
    fontWeight: '500',
    color: colors.ink,
  },
  suffix: {
    color: colors.muted,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.ink,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 0,
  },
  hint: {
    ...typography.footnote,
    color: colors.muted,
    marginTop: 6,
  },
  error: {
    ...typography.footnote,
    color: colors.danger.DEFAULT,
    marginTop: 6,
  },
});
