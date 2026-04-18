import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { PieChart } from 'react-native-gifted-charts';
import { useAuth } from '../../src/context/AuthContext';
import { accountsApi, transactionsApi } from '../../src/services/api';
import Skeleton from '../../src/components/ui/Skeleton';
import Badge from '../../src/components/ui/Badge';
import { Colors, Spacing, Font, Radius, Shadow } from '../../src/theme';
import type { Account, MonthlySummary } from '../../src/types/api';

const CHART_COLORS = ['#00C896','#7B6EF6','#FF4757','#FFD93D','#4FC3F7','#FF8C00'];

function formatZAR(amount: number) {
  return `R ${Math.abs(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router   = useRouter();
  const now      = new Date();

  const [accounts, setAccounts]   = useState<Account[]>([]);
  const [summary, setSummary]     = useState<MonthlySummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const accRes = await accountsApi.getAll();
      const accs   = accRes.data.data;
      setAccounts(accs);

      if (accs.length > 0) {
        const sumRes = await transactionsApi.getMonthlySummary(
          accs[0].id, now.getMonth() + 1, now.getFullYear()
        );
        setSummary(sumRes.data.data);
      }
    } catch {}
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, []));

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const pieData = summary?.byCategory
    .filter(c => c.amount > 0)
    .map((c, i) => ({
      value: c.amount,
      color: CHART_COLORS[i % CHART_COLORS.length],
      label: c.category,
    })) ?? [];

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting()}, {user?.firstName} 👋</Text>
          <Text style={styles.date}>{now.toLocaleDateString('en-ZA', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </View>
      </View>

      {/* Balance hero card */}
      <View style={[styles.heroWrap, Shadow.card]}>
        <LinearGradient
          colors={['#1A2744', '#0D1B35']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <LinearGradient
            colors={['rgba(0,200,150,0.3)', 'transparent']}
            style={styles.heroGlow}
          />
          <Text style={styles.heroLabel}>Total Balance</Text>
          {loading
            ? <Skeleton width={200} height={44} style={{ marginVertical: 4 }} />
            : <Text style={styles.heroAmount}>{formatZAR(totalBalance)}</Text>
          }
          <View style={styles.heroDivider} />
          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>↑ Income</Text>
              {loading
                ? <Skeleton width={80} height={16} />
                : <Text style={styles.heroStatIncome}>{formatZAR(summary?.totalIncome ?? 0)}</Text>
              }
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>↓ Expenses</Text>
              {loading
                ? <Skeleton width={80} height={16} />
                : <Text style={styles.heroStatExpenses}>{formatZAR(summary?.totalExpenses ?? 0)}</Text>
              }
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        <Pressable style={styles.quickBtn} onPress={() => router.push('/transactions')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.accentGlow }]}>
            <Text style={styles.quickEmoji}>↓</Text>
          </View>
          <Text style={styles.quickLabel}>Deposit</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => router.push('/transactions')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.dangerGlow }]}>
            <Text style={[styles.quickEmoji, { color: Colors.danger }]}>↑</Text>
          </View>
          <Text style={styles.quickLabel}>Pay</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => router.push('/transactions')}>
          <View style={[styles.quickIcon, { backgroundColor: Colors.purpleGlow }]}>
            <Text style={[styles.quickEmoji, { color: Colors.purple }]}>⇄</Text>
          </View>
          <Text style={styles.quickLabel}>Transfer</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => router.push('/budgets')}>
          <View style={[styles.quickIcon, { backgroundColor: 'rgba(255,217,61,0.15)' }]}>
            <Text style={[styles.quickEmoji, { color: Colors.warning }]}>🎯</Text>
          </View>
          <Text style={styles.quickLabel}>Budgets</Text>
        </Pressable>
      </View>

      {/* Accounts strip */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>My Accounts</Text>
        <Pressable onPress={() => router.push('/accounts')}>
          <Text style={styles.sectionLink}>View all →</Text>
        </Pressable>
      </View>
      {loading
        ? <Skeleton width="100%" height={80} style={{ borderRadius: Radius.md, marginBottom: Spacing.sm }} />
        : accounts.length === 0
          ? (
            <Pressable style={styles.emptyCard} onPress={() => router.push('/accounts')}>
              <Text style={styles.empty}>No accounts yet</Text>
              <Text style={styles.emptyHint}>Tap to add one →</Text>
            </Pressable>
          )
          : accounts.map(acc => (
            <Pressable
              key={acc.id}
              style={({ pressed }) => [styles.accountRow, pressed && { opacity: 0.75 }]}
              onPress={() => router.push({ pathname: '/transactions', params: { accountId: acc.id, accountName: acc.name } })}
            >
              <LinearGradient
                colors={acc.accountType === 'Savings' ? Colors.gradientGreen : Colors.gradientBlue}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.accountDot}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.accountName}>{acc.name}</Text>
                <Badge label={acc.accountType} variant="neutral" />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.accountBalance}>{formatZAR(acc.balance)}</Text>
                <Text style={styles.accountTap}>tap to transact</Text>
              </View>
            </Pressable>
          ))
      }

      {/* Spend by category chart */}
      {!loading && pieData.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Spend this month</Text>
          <View style={styles.chartCard}>
            <PieChart
              data={pieData}
              radius={80}
              innerRadius={50}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: Colors.textMuted, fontSize: Font.xs }}>Total</Text>
                  <Text style={{ color: Colors.text, fontSize: Font.sm, fontWeight: '700' }}>
                    {formatZAR(summary?.totalExpenses ?? 0)}
                  </Text>
                </View>
              )}
            />
            <View style={styles.legend}>
              {pieData.map((d, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendLabel}>{d.label}</Text>
                  <Text style={styles.legendAmount}>{formatZAR(d.value)}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: Colors.bg },
  content:        { padding: Spacing.lg, paddingBottom: 100 },
  topBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: 50 },
  greeting:       { color: Colors.text, fontSize: Font.lg, fontWeight: '700' },
  date:           { color: Colors.textMuted, fontSize: Font.sm, marginTop: 2 },
  avatar:         {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.accentGlow,
    borderWidth: 1.5, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:     { color: Colors.accent, fontSize: Font.sm, fontWeight: '800' },
  heroWrap:       { borderRadius: Radius.xl, overflow: 'hidden', marginBottom: Spacing.lg },
  hero:           { padding: Spacing.lg, minHeight: 180 },
  heroGlow:       { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 100 },
  heroLabel:      { color: 'rgba(255,255,255,0.6)', fontSize: Font.sm, letterSpacing: 1, textTransform: 'uppercase' },
  heroAmount:     { color: Colors.text, fontSize: Font.hero, fontWeight: '800', letterSpacing: -1, marginVertical: 4 },
  heroDivider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: Spacing.sm },
  heroRow:        { flexDirection: 'row' },
  heroStat:       { flex: 1, gap: 4 },
  heroStatLabel:  { color: 'rgba(255,255,255,0.5)', fontSize: Font.xs },
  heroStatIncome: { color: Colors.accent, fontSize: Font.md, fontWeight: '700' },
  heroStatExpenses:{ color: Colors.danger, fontSize: Font.md, fontWeight: '700' },
  heroStatDivider:{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: Spacing.md },
  sectionRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  sectionTitle:   { color: Colors.text, fontSize: Font.lg, fontWeight: '700' },
  sectionLink:    { color: Colors.accent, fontSize: Font.sm, fontWeight: '600' },
  quickRow:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  quickBtn:       { alignItems: 'center', gap: 8, flex: 1 },
  quickIcon:      { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  quickEmoji:     { fontSize: 22, color: Colors.accent, fontWeight: '700' },
  quickLabel:     { color: Colors.textMuted, fontSize: Font.xs, fontWeight: '500' },
  accountRow:     {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  accountDot:     { width: 4, height: 40, borderRadius: 2 },
  accountName:    { color: Colors.text, fontSize: Font.md, fontWeight: '600', marginBottom: 4 },
  accountBalance: { color: Colors.text, fontSize: Font.lg, fontWeight: '700' },
  accountTap:     { color: Colors.textDim, fontSize: Font.xs, marginTop: 2 },
  emptyCard:      { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  emptyHint:      { color: Colors.accent, fontSize: Font.sm, marginTop: 4 },
  chartCard:      {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  legend:         { width: '100%', marginTop: Spacing.md, gap: 8 },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot:      { width: 10, height: 10, borderRadius: 5 },
  legendLabel:    { flex: 1, color: Colors.textMuted, fontSize: Font.sm },
  legendAmount:   { color: Colors.text, fontSize: Font.sm, fontWeight: '600' },
  empty:          { color: Colors.textMuted, fontSize: Font.sm, textAlign: 'center' },
});
