import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  Modal, Pressable, FlatList, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { transactionsApi, accountsApi } from '../../src/services/api';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Badge from '../../src/components/ui/Badge';
import Skeleton from '../../src/components/ui/Skeleton';
import { Colors, Spacing, Font, Radius } from '../../src/theme';
import type { Account, Transaction } from '../../src/types/api';

// Default expense categories seeded in the API
const EXPENSE_CATS = [
  { id: 2, name: 'Food & Groceries' }, { id: 3, name: 'Transport' },
  { id: 4, name: 'Entertainment' },    { id: 5, name: 'Utilities' },
  { id: 6, name: 'Healthcare' },       { id: 7, name: 'Shopping' },
  { id: 8, name: 'Education' },        { id: 9, name: 'Other' },
];
const INCOME_CATS = [
  { id: 1, name: 'Salary' }, { id: 10, name: 'Freelance' }, { id: 11, name: 'Investment' },
];

function formatZAR(n: number) {
  return `R ${Math.abs(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

type ModalType = 'deposit' | 'withdraw' | 'transfer' | null;

export default function TransactionsScreen() {
  const params  = useLocalSearchParams<{ accountId?: string; accountName?: string }>();

  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);
  const [txns, setTxns]               = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [modalType, setModalType]     = useState<ModalType>(null);

  // Form state
  const [amount, setAmount]         = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(2);
  const [destAccId, setDestAccId]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const loadAccounts = async () => {
    const res = await accountsApi.getAll();
    const accs = res.data.data;
    setAccounts(accs);
    const target = params.accountId
      ? accs.find(a => a.id === params.accountId) ?? accs[0]
      : accs[0];
    setSelectedAcc(target ?? null);
    return target;
  };

  const loadTxns = async (acc: Account) => {
    const res = await transactionsApi.getPage(acc.id);
    setTxns(res.data.data.items);
  };

  const load = async () => {
    try {
      const acc = await loadAccounts();
      if (acc) await loadTxns(acc);
    } catch {}
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [params.accountId]));

  const resetForm = () => { setAmount(''); setDescription(''); setCategoryId(2); setDestAccId(''); setError(''); };

  const submit = async () => {
    if (!selectedAcc) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return setError('Enter a valid amount.');
    setSaving(true); setError('');
    try {
      if (modalType === 'deposit')  await transactionsApi.deposit(selectedAcc.id, amt, description || 'Deposit', categoryId);
      if (modalType === 'withdraw') await transactionsApi.withdraw(selectedAcc.id, amt, description || 'Withdrawal', categoryId);
      if (modalType === 'transfer') {
        if (!destAccId) return setError('Select a destination account.');
        await transactionsApi.transfer(selectedAcc.id, destAccId, amt, description || 'Transfer');
      }
      setModalType(null); resetForm();
      const accRes = await accountsApi.getAll();
      const accs = accRes.data.data;
      setAccounts(accs);
      const updated = accs.find(a => a.id === selectedAcc.id);
      if (updated) { setSelectedAcc(updated); await loadTxns(updated); }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Transaction failed.');
    }
    setSaving(false);
  };

  const txnVariant = (t: Transaction) => t.type === 'Income' ? 'success' : t.type === 'Transfer' ? 'info' : 'danger';

  return (
    <View style={styles.screen}>
      {/* Account selector */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Transactions</Text>
      </View>

      {accounts.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accStrip} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 8 }}>
          {accounts.map(acc => (
            <Pressable
              key={acc.id}
              onPress={() => { setSelectedAcc(acc); setLoading(true); loadTxns(acc).then(() => setLoading(false)); }}
              style={[styles.accChip, selectedAcc?.id === acc.id && styles.accChipActive]}
            >
              <Text style={[styles.accChipText, selectedAcc?.id === acc.id && { color: Colors.accent }]}>{acc.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Balance bar */}
      {selectedAcc && (
        <View style={styles.balanceBar}>
          <View>
            <Text style={styles.accName}>{selectedAcc.name}</Text>
            <Text style={styles.accBalance}>{formatZAR(selectedAcc.balance)}</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable onPress={() => { resetForm(); setCategoryId(1); setModalType('deposit'); }} style={styles.actionBtn}>
              <Text style={styles.actionIcon}>↓</Text>
              <Text style={styles.actionLabel}>Deposit</Text>
            </Pressable>
            <Pressable onPress={() => { resetForm(); setModalType('withdraw'); }} style={styles.actionBtn}>
              <Text style={[styles.actionIcon, { color: Colors.danger }]}>↑</Text>
              <Text style={styles.actionLabel}>Pay</Text>
            </Pressable>
            {accounts.length > 1 && (
              <Pressable onPress={() => { resetForm(); setModalType('transfer'); }} style={styles.actionBtn}>
                <Text style={[styles.actionIcon, { color: Colors.purple }]}>⇄</Text>
                <Text style={styles.actionLabel}>Transfer</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Transaction list */}
      {loading
        ? <View style={{ padding: Spacing.lg, gap: 12 }}>
            {[1,2,3].map(i => <Skeleton key={i} width="100%" height={64} style={{ borderRadius: Radius.md }} />)}
          </View>
        : txns.length === 0
          ? <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          : <FlatList
              data={txns}
              keyExtractor={t => t.id}
              contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}
              renderItem={({ item: t }) => (
                <View style={styles.txnRow}>
                  <View style={[styles.txnIcon, { backgroundColor: t.type === 'Income' ? Colors.accentGlow : t.type === 'Transfer' ? Colors.purpleGlow : Colors.dangerGlow }]}>
                    <Text style={styles.txnIconText}>{t.type === 'Income' ? '↓' : t.type === 'Transfer' ? '⇄' : '↑'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnDesc}>{t.description}</Text>
                    <Text style={styles.txnMeta}>{t.categoryName} · {formatDate(t.transactionDate)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.txnAmount, { color: t.type === 'Income' ? Colors.accent : t.type === 'Transfer' ? Colors.purple : Colors.danger }]}>
                      {t.type === 'Income' ? '+' : '-'}{formatZAR(t.amount)}
                    </Text>
                    <Text style={styles.txnBalance}>Bal: {formatZAR(t.balanceAfter)}</Text>
                  </View>
                </View>
              )}
            />
      }

      {/* Transaction Modal */}
      <Modal visible={!!modalType} transparent animationType="slide" onRequestClose={() => { Keyboard.dismiss(); setModalType(null); }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kavWrapper}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {/* Header row with Done button to dismiss keyboard */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {modalType === 'deposit' ? '↓ Deposit' : modalType === 'withdraw' ? '↑ Pay / Withdraw' : '⇄ Transfer'}
              </Text>
              <Pressable onPress={Keyboard.dismiss} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {!!error && <View style={styles.errBanner}><Text style={styles.errText}>{error}</Text></View>}

              <Input label="Amount (ZAR)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" />
              <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="e.g. Woolworths groceries" returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />

              {modalType !== 'transfer' && (
                <>
                  <Text style={styles.catLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(modalType === 'deposit' ? INCOME_CATS : EXPENSE_CATS).map(c => (
                        <Pressable
                          key={c.id} onPress={() => setCategoryId(c.id)}
                          style={[styles.catChip, categoryId === c.id && styles.catChipActive]}
                        >
                          <Text style={[styles.catChipText, categoryId === c.id && { color: Colors.accent }]}>{c.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {modalType === 'transfer' && (
                <>
                  <Text style={styles.catLabel}>To account</Text>
                  <View style={{ gap: 8, marginBottom: Spacing.md }}>
                    {accounts.filter(a => a.id !== selectedAcc?.id).map(a => (
                      <Pressable
                        key={a.id} onPress={() => setDestAccId(a.id)}
                        style={[styles.catChip, { flex: undefined, paddingVertical: 12 }, destAccId === a.id && styles.catChipActive]}
                      >
                        <Text style={[styles.catChipText, destAccId === a.id && { color: Colors.accent }]}>{a.name} · {formatZAR(a.balance)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <Button
                label={modalType === 'deposit' ? 'Deposit' : modalType === 'withdraw' ? 'Pay' : 'Transfer'}
                onPress={submit} loading={saving}
              />
              <Button label="Cancel" onPress={() => { Keyboard.dismiss(); setModalType(null); }} variant="ghost" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: Colors.bg },
  header:       { paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm },
  pageTitle:    { color: Colors.text, fontSize: 26, fontWeight: '800' },
  accStrip:     { marginBottom: Spacing.sm },
  accChip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  accChipActive:{ backgroundColor: Colors.accentGlow, borderColor: Colors.accent },
  accChipText:  { color: Colors.textMuted, fontSize: Font.sm, fontWeight: '600' },
  balanceBar:   {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.card, marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  accName:      { color: Colors.textMuted, fontSize: Font.xs },
  accBalance:   { color: Colors.text, fontSize: Font.xl, fontWeight: '800' },
  actionRow:    { flexDirection: 'row', gap: Spacing.md },
  actionBtn:    { alignItems: 'center', gap: 4 },
  actionIcon:   { color: Colors.accent, fontSize: 20, fontWeight: '700' },
  actionLabel:  { color: Colors.textMuted, fontSize: Font.xs },
  txnRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 12 },
  txnIcon:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnIconText:  { fontSize: 16, fontWeight: '700', color: Colors.text },
  txnDesc:      { color: Colors.text, fontSize: Font.sm, fontWeight: '600' },
  txnMeta:      { color: Colors.textMuted, fontSize: Font.xs, marginTop: 2 },
  txnAmount:    { fontSize: Font.sm, fontWeight: '700' },
  txnBalance:   { color: Colors.textDim, fontSize: Font.xs },
  empty:        { alignItems: 'center', paddingTop: 60 },
  emptyEmoji:   { fontSize: 40, marginBottom: Spacing.sm },
  emptyText:    { color: Colors.textMuted, fontSize: Font.md },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  kavWrapper:   { justifyContent: 'flex-end' },
  sheet:        {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border,
    maxHeight: '85%',
  },
  sheetHandle:  { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  sheetHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sheetTitle:   { color: Colors.text, fontSize: Font.xl, fontWeight: '700' },
  doneBtn:      { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.accentGlow, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.accent },
  doneBtnText:  { color: Colors.accent, fontSize: Font.sm, fontWeight: '700' },
  errBanner:    { backgroundColor: Colors.dangerGlow, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.danger },
  errText:      { color: Colors.danger, fontSize: Font.sm },
  catLabel:     { color: Colors.textMuted, fontSize: Font.sm, fontWeight: '500', marginBottom: 8 },
  catChip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  catChipActive:{ backgroundColor: Colors.accentGlow, borderColor: Colors.accent },
  catChipText:  { color: Colors.textMuted, fontSize: Font.xs, fontWeight: '600' },
});
