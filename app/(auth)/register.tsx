import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import { Colors, Spacing, Font, Radius } from '../../src/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router       = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password)
      return setError('All fields are required.');
    if (form.password.length < 8)
      return setError('Password must be at least 8 characters.');
    setLoading(true); setError('');
    try {
      await register(form.firstName, form.lastName, form.email.trim(), form.password);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Reef and take control of your money</Text>
        </View>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="First name" value={form.firstName} onChangeText={set('firstName')} placeholder="Karabo" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Last name" value={form.lastName} onChangeText={set('lastName')} placeholder="Vilakazi" />
            </View>
          </View>

          <Input
            label="Email address" value={form.email} onChangeText={set('email')}
            keyboardType="email-address" autoCapitalize="none" placeholder="you@email.com"
          />
          <Input
            label="Password" value={form.password} onChangeText={set('password')}
            secureTextEntry placeholder="Minimum 8 characters"
          />

          <Button label="Create account" onPress={handle} loading={loading} style={styles.btn} />

          <Pressable onPress={() => router.push('/(auth)/login')} style={styles.link}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={{ color: Colors.accent }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:      { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  topBar:      { paddingTop: 60, marginBottom: Spacing.lg },
  back:        { alignSelf: 'flex-start' },
  backText:    { color: Colors.accent, fontSize: Font.md },
  heading:     { marginBottom: Spacing.lg },
  title:       { color: Colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle:    { color: Colors.textMuted, fontSize: Font.md, marginTop: 4 },
  card:        {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg,
  },
  errorBanner: {
    backgroundColor: Colors.dangerGlow, borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.danger,
  },
  errorText:   { color: Colors.danger, fontSize: Font.sm },
  row:         { flexDirection: 'row' },
  btn:         { marginTop: Spacing.sm },
  link:        { alignItems: 'center', marginTop: Spacing.md },
  linkText:    { color: Colors.textMuted, fontSize: Font.sm },
});
