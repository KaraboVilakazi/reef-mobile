import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { budgetsApi } from '../../src/services/api';
import Button from '../../src/components/ui/Button';
import Input from '../../src/components/ui/Input';
import Skeleton from '../../src/components/ui/Skeleton';
import { Colors, Spacing, Font, Radius, Shadow } from '../../src/theme';
import type { Budget } from '../../src/types/api';

const EXPENSE_CATS = [
  { id: 2, name: 'Food & Groceries' }, { id: 3, name: 'Transport' },
  { id: 4, name: 'Entertainment' },    { id: 5, name: 'Utilities' },
  { id: 6, name: 'Healthcare' },       { id: 7, name: 'Shopping' },
  { id: 8, name: 'Education' },        { id: 9, name: 'Other' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatZAR(n: number) {
  return `R ${n.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
}

function ProgressBar({ pct, danger, warn }: { pct: number; danger: boolean; warn: boolean }) {
  const color = danger ? Colors.danger : warn ? Colors.warning : Colors.accent;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(pct * 100, 100)}%` as any, backgroundColor: color }]} />
    </View>
  );
}

export default function BudgetsScreen() {
  const now = new Date();
  const [month, setMonth]       = useState(now.getMonth() + 1);
  const [year]                  = useState(now.getFullYear());
  const [budgets, setBudgets]   = useState<Budget[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]       = useState(false);
  const [categoryId, setCategoryId] = useState(2);
  const [limit, setLimit]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = async () => {
    try {
      const res = await budgetsApi.getAll(month, year);
      setBudgets(res.data.data);
    } catch {}
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [month]));

  const saveBudget = async () => {
    const amt = parseFloat(limit);
    if (isNaN(amt) || amt <= 0) return setError('Enter a valid limit.');
    setSaving(true); setError('');
    try {
      await budgetsApi.set(categoryId, amt, month, year);
      setModal(false); setLimit('');
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save budget.');
    }
    setSaving(false);
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limitAmount, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.actualSpend, 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}
      >
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Budgets</Text>
          <Pressable onPress={() => { setError(''); setModal(true); }} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Set Budget</Text>
          </Pressable>
        </View>

        {/* Month selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthStrip} contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}>
          {MONTHS.map((m, i) => (
            <Pressable
              key={i} onPress={() => setMonth(i + 1)}
              style={[styles.monthChip, month === i + 1 && styles.monthChipActive]}
            >
              <Text style={[styles.monthText, month === i + 1 && { color: Colors.accent }]}>{m}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Summary card */}
        {!loading && budgets.length > 0 && (
          <View style={[styles.summaryWrap, Shadow.sm]}>
            <LinearGradient colors={['#1A2744','#0D1B35']} style={styles.summary}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Budgeted</Text>
                <Text style={styles.summaryVal}>{formatZAR(totalBudgeted)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Spent</Text>
                <Text style={[styles.summaryVal, { color: totalSpent > totalBudgeted ? Colors.danger : Colors.accent }]}>
                  {formatZAR(totalSpent)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Remaining</Text>
                <Text style={[styles.summaryVal, { color: Colors.info }]}>{formatZAR(Math.max(totalBudgeted - totalSpent, 0))}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Budget cards */}
        {loading
          ? [1,2,3].map(i => <Skeleton key={i} width="100%" height={120} style={{ borderRadius: Radius.lg, marginBottom: Spacing.sm }} />)
          : budgets.length === 0
            ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🎯</Text>
                <Text style={styles.emptyTitle}>No budgets for {MONTHS[month-1]}</Text>
                <Text style={styles.emptySubtitle}>Set spending limits to stay on track</Text>
                <Button label="Set a Budget" onPress={() => setModal(true)} style={{ marginTop: Spacing.md, width: 180 }} />
              </View>
            )
            : budgets.map(b => {
                const pct = b.limitAmount > 0 ? b.actualSpend / b.limitAmount : 0;
                return (
                  <View key={b.id} style={styles.budgetCard}>
                    <View style={styles.budgetTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.budgetCat}>{b.category}</Text>
                        <Text style={styles.budgetMeta}>
                          {formatZAR(b.actualSpend)} of {formatZAR(b.limitAmount)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        {b.isOverBudget && (
                          <View style={styles.alertBadge}>
                            <Text style={styles.alertBadgeText}>Over budget</Text>
                          </View>
                        )}
                        {!b.isOverBudget && b.isProjectedToOverrun && (
                          <View style={[styles.alertBadge, { backgroundColor: 'rgba(255,217,61,0.15)', borderColor: Colors.warning }]}>
                            <Text style={[styles.alertBadgeText, { color: Colors.warning }]}>On track to exceed</Text>
                          </View>
                        )}
                        <Text style={styles.pctText}>{Math.round(pct * 100)}%</Text>
                      </View>
                    </View>
                    <ProgressBar pct={pct} danger={b.isOverBudget} warn={b.isProjectedToOverrun} />
                    <View style={styles.budgetBottom}>
                      <Text style={styles.budgetHint}>
                        {b.isOverBudget
                          ? `Overspent by ${formatZAR(Math.abs(b.remainingAmount))}`
                          : `${formatZAR(b.remainingAmount)} remaining`}
                      </Text>
                      <Text style={styles.burnRate}>Burn rate: {formatZAR(b.burnRate)}/mo</Text>
                    </View>
                  </View>
                );
              })
        }
      </ScrollView>

      {/* Set Budget Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setModal(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Set Budget — {MONTHS[month-1]} {year}</Text>

          {!!error && <View style={styles.errBanner}><Text style={styles.errText}>{error}</Text></View>}

          <Text style={styles.catLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {EXPENSE_CATS.map(c => (
                <Pressable key={c.id} onPress={() => setCategoryId(c.id)}
                  style={[styles.catChip, categoryId === c.id && styles.catChipActive]}>
                  <Text style={[styles.catChipText, categoryId === c.id && { color: Colors.accent }]}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Input label="Monthly limit (ZAR)" value={limit} onChangeText={setLimit} keyboardType="numeric" placeholder="e.g. 3000" />
          <Button label="Save Budget" onPress={saveBudget} loading={saving} />
          <Button label="Cancel" onPress={() => setModal(false)} variant="ghost" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: Colors.bg },
  content:         { paddingBottom: 100 },
  topBar:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: Spacing.sm },
  pageTitle:       { color: Colors.text, fontSize: 26, fontWeight: '800' },
  addBtn:          { backgroundColor: Colors.accentGlow, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: Colors.accent },
  addBtnText:      { color: Colors.accent, fontSize: Font.sm, fontWeight: '700' },
  monthStrip:      { marginBottom: Spacing.md },
  monthChip:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  monthChipActive: { backgroundColor: Colors.accentGlow, borderColor: Colors.accent },
  monthText:       { color: Colors.textMuted, fontSize: Font.sm, fontWeight: '600' },
  summaryWrap:     { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
  summary:         { flexDirection: 'row', padding: Spacing.md },
  summaryCol:      { flex: 1, alignItems: 'center' },
  summaryLabel:    { color: 'rgba(255,255,255,0.5)', fontSize: Font.xs },
  summaryVal:      { color: Colors.text, fontSize: Font.lg, fontWeight: '700', marginTop: 2 },
  summaryDivider:  { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: Spacing.sm },
  budgetCard:      {
    backgroundColor: Colors.card, borderRadius: Radius.lg, marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  budgetTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  budgetCat:       { color: Colors.text, fontSize: Font.md, fontWeight: '700' },
  budgetMeta:      { color: Colors.textMuted, fontSize: Font.xs, marginTop: 2 },
  alertBadge:      { backgroundColor: Colors.dangerGlow, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.danger },
  alertBadgeText:  { color: Colors.danger, fontSize: Font.xs, fontWeight: '700' },
  pctText:         { color: Colors.textMuted, fontSize: Font.xs, fontWeight: '600' },
  progressTrack:   { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill:    { height: '100%', borderRadius: 3 },
  budgetBottom:    { flexDirection: 'row', justifyContent: 'space-between' },
  budgetHint:      { color: Colors.textMuted, fontSize: Font.xs },
  burnRate:        { color: Colors.textDim, fontSize: Font.xs },
  empty:           { alignItems: 'center', paddingTop: 80 },
  emptyEmoji:      { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle:      { color: Colors.text, fontSize: Font.xl, fontWeight: '700' },
  emptySubtitle:   { color: Colors.textMuted, fontSize: Font.sm, marginTop: 4 },
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:           { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border },
  sheetHandle:     { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  sheetTitle:      { color: Colors.text, fontSize: Font.xl, fontWeight: '700', marginBottom: Spacing.md },
  errBanner:       { backgroundColor: Colors.dangerGlow, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.danger },
  errText:         { color: Colors.danger, fontSize: Font.sm },
  catLabel:        { color: Colors.textMuted, fontSize: Font.sm, fontWeight: '500', marginBottom: 8 },
  catChip:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  catChipActive:   { backgroundColor: Colors.accentGlow, borderColor: Colors.accent },
  catChipText:     { color: Colors.textMuted, fontSize: Font.xs, fontWeight: '600' },
});
