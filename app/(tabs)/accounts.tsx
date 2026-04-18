import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Modal,
  Pressable, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { accountsApi } from '../../src/services/api';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Skeleton from '../../src/components/ui/Skeleton';
import { Colors, Spacing, Font, Radius, Shadow } from '../../src/theme';
import type { Account } from '../../src/types/api';

const TYPES = ['Cheque', 'Savings', 'FixedDeposit'] as const;
const TYPE_LABEL: Record<string, string> = { FixedDeposit: 'Fixed Deposit' };
const GRADIENTS: Record<string, readonly [string, string]> = {
  Cheque:       ['#1A2744', '#0D1B35'],
  Savings:      ['#0D2B22', '#071A15'],
  FixedDeposit: ['#1E1A3A', '#110E28'],
};
const TYPE_ACCENT: Record<string, string> = {
  Cheque: Colors.info, Savings: Colors.accent, FixedDeposit: Colors.purple,
};

function formatZAR(n: number) {
  return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts]   = useState<Account[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]         = useState(false);
  const [name, setName]           = useState('');
  const [type, setType]           = useState<typeof TYPES[number]>('Cheque');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = async () => {
    try {
      const res = await accountsApi.getAll();
      setAccounts(res.data.data);
    } catch {}
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  const create = async () => {
    if (!name.trim()) return setError('Account name is required.');
    setSaving(true); setError('');
    try {
      const res = await accountsApi.create(name.trim(), type);
      setAccounts(prev => [res.data.data, ...prev]);
      setModal(false); setName('');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create account.');
    }
    setSaving(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}
      >
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Accounts</Text>
          <Pressable onPress={() => setModal(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>

        {loading
          ? [1,2].map(i => <Skeleton key={i} width="100%" height={140} style={{ borderRadius: Radius.lg, marginBottom: Spacing.md }} />)
          : accounts.length === 0
            ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>💳</Text>
                <Text style={styles.emptyTitle}>No accounts yet</Text>
                <Text style={styles.emptySubtitle}>Add your first account to get started</Text>
                <Button label="Add Account" onPress={() => setModal(true)} style={{ marginTop: Spacing.md, width: 180 }} />
              </View>
            )
            : accounts.map(acc => (
              <TouchableOpacity
                key={acc.id}
                onPress={() => router.push({ pathname: '/(tabs)/transactions', params: { accountId: acc.id, accountName: acc.name } })}
                activeOpacity={0.85}
              >
                <View style={[styles.cardWrap, Shadow.card]}>
                  <LinearGradient
                    colors={GRADIENTS[acc.accountType] as any}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardTop}>
                      <View>
                        <Text style={styles.cardType}>{TYPE_LABEL[acc.accountType] ?? acc.accountType}</Text>
                        <Text style={styles.cardName}>{acc.name}</Text>
                      </View>
                      <View style={[styles.typePill, { backgroundColor: `${TYPE_ACCENT[acc.accountType]}22`, borderColor: TYPE_ACCENT[acc.accountType] }]}>
                        <Text style={[styles.typePillText, { color: TYPE_ACCENT[acc.accountType] }]}>
                          {TYPE_LABEL[acc.accountType] ?? acc.accountType}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardBalance}>{formatZAR(acc.balance)}</Text>
                    <Text style={styles.cardSub}>Available balance</Text>
                    <View style={styles.cardBottom}>
                      <Text style={styles.cardHint}>Tap to view transactions →</Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            ))
        }
      </ScrollView>

      {/* Add Account Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setModal(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>New Account</Text>

          <Input label="Account name" value={name} onChangeText={setName} placeholder="e.g. FNB Cheque" error={error} />

          <Text style={styles.typeLabel}>Account type</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeChip, type === t && { backgroundColor: Colors.accentGlow, borderColor: Colors.accent }]}
              >
                <Text style={[styles.typeChipText, type === t && { color: Colors.accent }]}>
                  {TYPE_LABEL[t] ?? t}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button label="Create Account" onPress={create} loading={saving} style={{ marginTop: Spacing.md }} />
          <Button label="Cancel" onPress={() => setModal(false)} variant="ghost" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: Colors.bg },
  content:       { padding: Spacing.lg, paddingBottom: 100 },
  topBar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: 56 },
  pageTitle:     { color: Colors.text, fontSize: 26, fontWeight: '800' },
  addBtn:        { backgroundColor: Colors.accentGlow, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: Colors.accent },
  addBtnText:    { color: Colors.accent, fontSize: Font.sm, fontWeight: '700' },
  cardWrap:      { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.md },
  card:          { padding: Spacing.lg, minHeight: 140 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  cardType:      { color: 'rgba(255,255,255,0.5)', fontSize: Font.xs, letterSpacing: 1, textTransform: 'uppercase' },
  cardName:      { color: Colors.text, fontSize: Font.lg, fontWeight: '700' },
  typePill:      { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  typePillText:  { fontSize: Font.xs, fontWeight: '700' },
  cardBalance:   { color: Colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  cardSub:       { color: 'rgba(255,255,255,0.4)', fontSize: Font.xs, marginTop: 2 },
  cardBottom:    { marginTop: Spacing.sm },
  cardHint:      { color: 'rgba(255,255,255,0.3)', fontSize: Font.xs },
  empty:         { alignItems: 'center', paddingTop: 80 },
  emptyEmoji:    { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle:    { color: Colors.text, fontSize: Font.xl, fontWeight: '700' },
  emptySubtitle: { color: Colors.textMuted, fontSize: Font.sm, marginTop: 4 },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:         {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: 40,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  sheetHandle:   { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle:    { color: Colors.text, fontSize: Font.xl, fontWeight: '700', marginBottom: Spacing.md },
  typeLabel:     { color: Colors.textMuted, fontSize: Font.sm, fontWeight: '500', marginBottom: 8 },
  typeRow:       { flexDirection: 'row', gap: 8 },
  typeChip:      {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  typeChipText:  { color: Colors.textMuted, fontSize: Font.xs, fontWeight: '600' },
});
