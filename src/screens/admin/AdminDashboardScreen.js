import React, {useState, useEffect} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import {adminApi} from '../../api/admin';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';

function ActionCard({icon, title, subtitle, onPress, color = COLORS.primary}) {
  return (
    <TouchableOpacity style={[styles.actionCard, {borderLeftColor: color}]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );
}

function ToolButton({icon, label, onPress, loading, color = COLORS.primary}) {
  return (
    <TouchableOpacity
      style={[styles.toolBtn, {backgroundColor: color + '15', borderColor: color}]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}>
      <Text style={styles.toolIcon}>{icon}</Text>
      <Text style={[styles.toolLabel, {color}]}>{loading ? 'Running…' : label}</Text>
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen({navigation}) {
  const [pendingCount, setPendingCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toolLoading, setToolLoading] = useState({});

  const load = async () => {
    try {
      const users = await adminApi.getUsers();
      const pending = (Array.isArray(users) ? users : users?.data ?? [])
        .filter(u => !u.approved).length;
      setPendingCount(pending);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const runTool = async (key, fn, confirm) => {
    if (confirm) {
      const ok = await new Promise(res =>
        Alert.alert('Confirm', confirm, [
          {text: 'Cancel', style: 'cancel', onPress: () => res(false)},
          {text: 'Continue', style: 'destructive', onPress: () => res(true)},
        ]),
      );
      if (!ok) return;
    }
    setToolLoading(t => ({...t, [key]: true}));
    try {
      const res = await fn();
      Alert.alert('Done', res?.message || 'Operation completed.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setToolLoading(t => ({...t, [key]: false}));
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>

      <Text style={styles.sectionTitle}>Management</Text>

      <ActionCard
        icon="👤"
        title="User Management"
        subtitle={pendingCount ? `${pendingCount} pending approval` : 'View and manage users'}
        color={pendingCount ? COLORS.secondary : COLORS.primary}
        onPress={() => navigation.navigate('UserManagement')}
      />
      <ActionCard
        icon="🏘️"
        title="Compound Management"
        subtitle="Add, edit, remove compounds"
        onPress={() => navigation.navigate('CompoundManagement')}
      />
      <ActionCard
        icon="👴"
        title="Progenitor Management"
        subtitle="Update photos and compounds for progenitors"
        onPress={() => navigation.navigate('ProgenitorManagement')}
      />

      <Text style={styles.sectionTitle}>Data Tools</Text>

      <View style={styles.toolsGrid}>
        <ToolButton
          icon="🔗"
          label="Fix Parent Links"
          loading={toolLoading.fixParents}
          onPress={() => runTool('fixParents', adminApi.fixParentLinks, 'This will attempt to fix broken parent links. Continue?')}
        />
        <ToolButton
          icon="✂️"
          label="Clean Name Dates"
          loading={toolLoading.cleanNames}
          onPress={() => runTool('cleanNames', adminApi.cleanNameDates, 'Clean name and date fields? Continue?')}
        />
        <ToolButton
          icon="🌱"
          label="Seed Progenitors"
          loading={toolLoading.seedProg}
          color={COLORS.success}
          onPress={() => runTool('seedProg', adminApi.seedStandardProgenitors, 'Seed standard progenitors into the database?')}
        />
        <ToolButton
          icon="🗑️"
          label="Purge Demo Members"
          loading={toolLoading.purge}
          color={COLORS.danger}
          onPress={() => runTool('purge', adminApi.purgeDemoMembers, 'This will permanently delete demo members. Are you sure?')}
        />
      </View>

      <Text style={styles.sectionTitle}>Import / Export</Text>

      <ActionCard
        icon="📥"
        title="Member Import"
        subtitle="Import members from Excel, view last import"
        onPress={() => Alert.alert('Import', 'Use the web admin panel to upload Excel files for member import.')}
      />

      <View style={{height: SPACING.xxxl}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.base,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  actionIcon: {fontSize: 28, marginRight: SPACING.md},
  actionInfo: {flex: 1},
  actionTitle: {fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text},
  actionSubtitle: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2},
  actionArrow: {fontSize: 22, color: COLORS.textLight},
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  toolBtn: {
    width: '47%',
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: 'center',
    borderWidth: 1,
  },
  toolIcon: {fontSize: 28, marginBottom: SPACING.sm},
  toolLabel: {fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, textAlign: 'center'},
});
