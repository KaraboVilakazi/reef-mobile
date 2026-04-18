import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Radius, Font, Spacing } from '../../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export default function Input({ label, error, rightIcon, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputRow,
        focused && styles.inputFocused,
        !!error && styles.inputError,
      ]}>
        <TextInput
          {...props}
          style={[styles.input, style]}
          placeholderTextColor={Colors.textDim}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e  => { setFocused(false); props.onBlur?.(e); }}
        />
        {rightIcon && <View style={styles.right}>{rightIcon}</View>}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:      { marginBottom: Spacing.md },
  label:        { color: Colors.textMuted, fontSize: Font.sm, fontWeight: '500', marginBottom: 6 },
  inputRow:     {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputFocused: { borderColor: Colors.accent },
  inputError:   { borderColor: Colors.danger },
  input:        { flex: 1, height: 52, color: Colors.text, fontSize: Font.md },
  right:        { paddingLeft: Spacing.sm },
  error:        { color: Colors.danger, fontSize: Font.xs, marginTop: 4 },
});
