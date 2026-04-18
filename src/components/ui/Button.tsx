import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Font, Spacing } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

export default function Button({ label, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.ghost, pressed && styles.pressed, style]}
      >
        <Text style={styles.ghostLabel}>{label}</Text>
      </Pressable>
    );
  }

  if (variant === 'danger') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed, (disabled || loading) && styles.dimmed, style]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.label}>{label}</Text>
        }
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed, (disabled || loading) && styles.dimmed, style]}
    >
      <LinearGradient
        colors={[Colors.accent, Colors.accentDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.label}>{label}</Text>
        }
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper:   { borderRadius: Radius.md, overflow: 'hidden' },
  gradient:  { height: 52, alignItems: 'center', justifyContent: 'center' },
  label:     { color: '#fff', fontSize: Font.md, fontWeight: '700', letterSpacing: 0.3 },
  pressed:   { opacity: 0.85, transform: [{ scale: 0.98 }] },
  dimmed:    { opacity: 0.5 },
  ghost:     { height: 52, alignItems: 'center', justifyContent: 'center' },
  ghostLabel:{ color: Colors.textMuted, fontSize: Font.md, fontWeight: '500' },
  dangerBtn: {
    height: 52, borderRadius: Radius.md,
    backgroundColor: Colors.danger,
    alignItems: 'center', justifyContent: 'center',
  },
});
