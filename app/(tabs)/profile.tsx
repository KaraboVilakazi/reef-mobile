import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Spacing, Font, Radius, Shadow } from '../../src/theme';

function MenuItem({ icon, label, sublabel, onPress, danger, rightLabel }: {
  icon: string; label: string; sublabel?: string;
  onPress: () => void; danger?: boolean; rightLabel?: string;
}) {
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.65 }]}
    >
      <View style={[styles.menuIcon, danger && { backgroundColor: Colors.dangerGlow }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {rightLabel
        ? <Text style={styles.rightLabel}>{rightLabel}</Text>
        : !danger && <Text style={styles.menuArrow}>›</Text>
      }
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      {/* Profile hero */}
      <View style={[styles.heroWrap, Shadow.card]}>
        <LinearGradient colors={['#1A2744', '#0D1B35']} style={styles.hero}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓  Verified account</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Navigate */}
      <Text style={styles.section}>Quick Navigation</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="💳" label="Accounts" sublabel="View and manage accounts" onPress={() => router.push('/accounts')} />
        <View style={styles.divider} />
        <MenuItem icon="↕️" label="Transactions" sublabel="Deposits, payments & transfers" onPress={() => router.push('/transactions')} />
        <View style={styles.divider} />
        <MenuItem icon="🎯" label="Budgets" sublabel="Monthly spend limits" onPress={() => router.push('/budgets')} />
      </View>

      {/* Account info */}
      <Text style={styles.section}>Account Details</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="✉️" label="Email" sublabel={user?.email ?? ''} onPress={() => {}} rightLabel="" />
        <View style={styles.divider} />
        <MenuItem icon="🌍" label="Currency" onPress={() => {}} rightLabel="ZAR" />
        <View style={styles.divider} />
        <MenuItem icon="🌙" label="Theme" onPress={() => {}} rightLabel="Dark" />
      </View>

      {/* About */}
      <Text style={styles.section}>About</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="📋" label="Version" onPress={() => {}} rightLabel="1.0.0" />
        <View style={styles.divider} />
        <MenuItem
          icon="🐛" label="Report a bug"
          sublabel="Help us improve Reef"
          onPress={() => Linking.openURL('mailto:support@reef.app?subject=Bug Report')}
        />
      </View>

      {/* Sign out */}
      <View style={[styles.menuCard, styles.lastCard]}>
        <MenuItem icon="🚪" label="Sign out" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>Reef · Built with ❤️ in South Africa</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: Colors.bg },
  content:       { padding: Spacing.lg, paddingBottom: 100, paddingTop: 56 },
  heroWrap:      { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.lg },
  hero:          { padding: Spacing.lg, alignItems: 'center', paddingVertical: Spacing.xl },
  avatarRing:    {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.accentGlow, borderWidth: 2, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  avatarText:    { color: Colors.accent, fontSize: 28, fontWeight: '800' },
  name:          { color: Colors.text, fontSize: Font.xl, fontWeight: '800' },
  email:         { color: Colors.textMuted, fontSize: Font.sm, marginTop: 4 },
  verifiedBadge: {
    marginTop: Spacing.sm, paddingHorizontal: 14, paddingVertical: 5,
    backgroundColor: Colors.accentGlow, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.accent,
  },
  verifiedText:  { color: Colors.accent, fontSize: Font.xs, fontWeight: '700' },
  section:       { color: Colors.textMuted, fontSize: Font.xs, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.lg },
  menuCard:      { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  lastCard:      { marginBottom: 0 },
  menuItem:      { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  menuIcon:      { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  menuLabel:     { color: Colors.text, fontSize: Font.md, fontWeight: '500' },
  menuSublabel:  { color: Colors.textMuted, fontSize: Font.xs, marginTop: 2 },
  menuArrow:     { color: Colors.textDim, fontSize: 22 },
  rightLabel:    { color: Colors.textMuted, fontSize: Font.sm },
  divider:       { height: 1, backgroundColor: Colors.border, marginLeft: 52 + Spacing.md },
  version:       { textAlign: 'center', color: Colors.textDim, fontSize: Font.xs, marginTop: Spacing.xl, paddingBottom: Spacing.sm },
});
