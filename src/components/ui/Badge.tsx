import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Font } from '../../theme';

type Variant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface Props { label: string; variant?: Variant; }

const config: Record<Variant, { bg: string; color: string }> = {
  success: { bg: Colors.accentGlow,  color: Colors.accent },
  danger:  { bg: Colors.dangerGlow,  color: Colors.danger },
  warning: { bg: 'rgba(255,217,61,0.15)', color: Colors.warning },
  info:    { bg: 'rgba(79,195,247,0.15)', color: Colors.info },
  neutral: { bg: Colors.card, color: Colors.textMuted },
};

export default function Badge({ label, variant = 'neutral' }: Props) {
  const { bg, color } = config[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start' },
  text:  { fontSize: Font.xs, fontWeight: '700', letterSpacing: 0.3 },
});
