import React, {useState, useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {membersApi} from '../api/members';
import {metaApi} from '../api/meta';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';
import {getRoleLabel, isAdmin} from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

function StatCard({label, value, color = COLORS.primary}) {
  return (
    <View style={[styles.statCard, {borderTopColor: color}]}>
      <Text style={[styles.statValue, {color}]}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({navigation}) {
  const {user, logout, refreshMe} = useAuth();
  const [stats, setStats] = useState(null);
  const [compoundCounts, setCompoundCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [s, cc] = await Promise.all([
        membersApi.stats(),
        metaApi.compoundCounts(),
      ]);
      setStats(s);
      setCompoundCounts(Array.isArray(cc) ? cc : []);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData().finally(() => setLoading(false));
      refreshMe();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: logout},
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
      {/* Welcome banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Approval notice */}
      {user && !user.approved && (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            ⏳ Your account is pending approval by a family admin.
          </Text>
        </View>
      )}

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        {[
          {icon: '👥', label: 'View Members', onPress: () => navigation.navigate('Members')},
          {icon: '📢', label: 'Announcements', onPress: () => navigation.navigate('Announcements')},
          {icon: '💬', label: 'Messages', onPress: () => navigation.navigate('Messages')},
          isAdmin(user) && {icon: '⚙️', label: 'Admin Panel', onPress: () => navigation.navigate('Admin')},
        ].filter(Boolean).map((action, i) => (
          <TouchableOpacity key={i} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.75}>
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Family stats */}
      {stats && (
        <>
          <Text style={styles.sectionTitle}>Family Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Total Members" value={stats.total_members} />
            <StatCard label="Living" value={stats.living_members} color={COLORS.success} />
            <StatCard label="Deceased" value={stats.deceased_members} color={COLORS.textMuted} />
            <StatCard label="Compounds" value={compoundCounts.length} color={COLORS.secondary} />
          </View>
        </>
      )}

      {/* Compound breakdown */}
      {compoundCounts.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>By Compound</Text>
          <View style={styles.compoundsContainer}>
            {compoundCounts.map((c, i) => (
              <View key={i} style={styles.compoundRow}>
                <Text style={styles.compoundName}>{c.name}</Text>
                <Text style={styles.compoundCount}>{c.count}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{height: SPACING.xxxl}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  banner: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.sm},
  userName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  roleText: {color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium},
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  logoutText: {color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium},
  noticeBanner: {
    backgroundColor: COLORS.secondaryLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    padding: SPACING.base,
    margin: SPACING.base,
    borderRadius: RADIUS.sm,
  },
  noticeText: {color: COLORS.secondary, fontSize: FONTS.sizes.sm},
  sectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.base,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: 'center',
    width: '47%',
    ...SHADOWS.sm,
  },
  actionIcon: {fontSize: 32, marginBottom: SPACING.sm},
  actionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    width: '47%',
    borderTopWidth: 3,
    ...SHADOWS.sm,
  },
  statValue: {fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold},
  statLabel: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2},
  compoundsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.base,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  compoundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compoundName: {fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.medium},
  compoundCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});
