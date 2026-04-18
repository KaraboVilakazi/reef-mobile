import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { Colors, Spacing, Font, Radius } from '../../src/theme';

export default function LoginScreen() {
  const { login }       = useAuth();
  const router          = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);

  const handle = async () => {
    if (!email || !password) return setError('Please fill in all fields.');
    setLoading(true); setError('');
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Hero header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(0,200,150,0.2)', 'transparent']}
            style={styles.glow}
          />
          <View style={styles.logoRing}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.brand}>Reef</Text>
          <Text style={styles.tagline}>Your finances, simplified.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@email.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPw}
            placeholder="••••••••"
            rightIcon={
              <Pressable onPress={() => setShowPw(v => !v)}>
                <Text style={styles.showHide}>{showPw ? 'Hide' : 'Show'}</Text>
              </Pressable>
            }
          />

          <Button label="Sign in" onPress={handle} loading={loading} style={styles.btn} />

          <Pressable onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={{ color: Colors.accent }}>Create one</Text>
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:      { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  header:      { alignItems: 'center', paddingTop: 80, paddingBottom: Spacing.xl },
  glow:        { position: 'absolute', top: 40, width: 300, height: 300, borderRadius: 150 },
  logoRing:    {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1.5, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  logoText:    { color: Colors.accent, fontSize: 28, fontWeight: '800' },
  brand:       { color: Colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline:     { color: Colors.textMuted, fontSize: Font.md, marginTop: 4 },
  card:        {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg,
  },
  title:       { color: Colors.text, fontSize: Font.xl, fontWeight: '700', marginBottom: 4 },
  subtitle:    { color: Colors.textMuted, fontSize: Font.sm, marginBottom: Spacing.lg },
  errorBanner: {
    backgroundColor: Colors.dangerGlow, borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.danger,
  },
  errorText:   { color: Colors.danger, fontSize: Font.sm },
  btn:         { marginTop: Spacing.sm },
  link:        { alignItems: 'center', marginTop: Spacing.md },
  linkText:    { color: Colors.textMuted, fontSize: Font.sm },
  showHide:    { color: Colors.accent, fontSize: Font.sm, fontWeight: '600' },
});
