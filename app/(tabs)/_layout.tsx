import { Slot, usePathname, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius } from '../../src/theme';

const TABS = [
  { path: '/',             emoji: '🏠', label: 'Home'      },
  { path: '/accounts',     emoji: '💳', label: 'Accounts'  },
  { path: '/transactions', emoji: '↕',  label: 'Transfers' },
  { path: '/budgets',      emoji: '🎯', label: 'Budgets'   },
  { path: '/profile',      emoji: '👤', label: 'Profile'   },
];

export default function TabsLayout() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.bar}>
        {TABS.map(tab => {
          const active = tab.path === '/'
            ? pathname === '/' || pathname === '/index'
            : pathname.startsWith(tab.path);

          return (
            <Pressable
              key={tab.path}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(tab.path as any);
              }}
              style={styles.tabBtn}
            >
              <View style={[styles.tabInner, active && styles.tabActive]}>
                <Text style={styles.emoji}>{tab.emoji}</Text>
                {active && <Text style={styles.tabLabel}>{tab.label}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: Colors.bg },
  content:   { flex: 1 },
  bar: {
    flexDirection:    'row',
    backgroundColor:  Colors.surface,
    borderTopWidth:   1,
    borderTopColor:   Colors.border,
    paddingTop:       10,
    paddingBottom:    Platform.OS === 'ios' ? 28 : 12,
    paddingHorizontal: 8,
    minHeight:        72,
  },
  tabBtn:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabInner:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.full, gap: 5,
    minWidth: 44, minHeight: 36,
  },
  tabActive: { backgroundColor: Colors.accentGlow },
  emoji:     { fontSize: 20 },
  tabLabel:  { color: Colors.accent, fontSize: 12, fontWeight: '700' },
});
