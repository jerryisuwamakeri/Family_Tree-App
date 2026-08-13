import React, {useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert, StatusBar, Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../context/AuthContext';
import {membersApi} from '../api/members';
import {metaApi} from '../api/meta';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';
import {getRoleLabel, isAdmin, getInitials} from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import Icon from '../components/Icon';

function StatCard({icon, set, label, value, tint}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, {backgroundColor: tint + '22'}]}>
        <Icon name={icon} set={set} size={20} color={tint} />
      </View>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({navigation}) {
  const insets = useSafeAreaInsets();
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

  const maxCompound = Math.max(1, ...compoundCounts.map(c => c.total || 0));

  const actions = [
    {icon: 'people', label: 'Members', sub: 'Browse family', tint: COLORS.primary, onPress: () => navigation.navigate('Members')},
    {icon: 'megaphone', label: 'News', sub: 'Announcements', tint: COLORS.secondary, onPress: () => navigation.navigate('Announcements')},
    {icon: 'chatbubbles', label: 'Messages', sub: 'Stay in touch', tint: COLORS.info, onPress: () => navigation.navigate('Messages')},
    isAdmin(user) && {icon: 'shield-checkmark', label: 'Admin', sub: 'Manage family', tint: COLORS.violet, onPress: () => navigation.navigate('Admin')},
  ].filter(Boolean);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Hero header */}
      <View style={[styles.hero, {paddingTop: insets.top + SPACING.md}]}>
        <View style={styles.heroTopRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Image source={require('../assets/logo.png')} style={styles.brandLogo} resizeMode="contain" />
            </View>
            <Text style={styles.brandName}>Maliki Family</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.greetRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userName} numberOfLines={1}>{user?.name}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={{paddingBottom: SPACING.xxxl}}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}>

        {/* Approval notice */}
        {user && !user.approved && (
          <View style={styles.noticeBanner}>
            <Icon name="time-outline" size={18} color={COLORS.warningDark} />
            <Text style={styles.noticeText}>
              Your account is pending approval by a family admin.
            </Text>
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.85}>
              <View style={[styles.actionIconWrap, {backgroundColor: action.tint + '18'}]}>
                <Icon name={action.icon} size={24} color={action.tint} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSub}>{action.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Family stats */}
        {stats && (
          <>
            <Text style={styles.sectionTitle}>Family Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="account-group" set="mci" label="Total Members" value={stats.members} tint={COLORS.primary} />
              <StatCard icon="sprout" set="mci" label="Living" value={stats.living} tint={COLORS.success} />
              <StatCard icon="candle" set="mci" label="Deceased" value={stats.deceased} tint={COLORS.textMuted} />
              <StatCard icon="business" label="Compounds" value={stats.compounds} tint={COLORS.secondary} />
            </View>
          </>
        )}

        {/* Compound breakdown */}
        {compoundCounts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>By Compound</Text>
            <View style={styles.compoundsContainer}>
              {compoundCounts.map((c, i) => (
                <View key={i} style={[styles.compoundRow, i === compoundCounts.length - 1 && {borderBottomWidth: 0}]}>
                  <View style={styles.compoundInfo}>
                    <Text style={styles.compoundName} numberOfLines={1}>{c.compound}</Text>
                    <View style={styles.compoundBarTrack}>
                      <View style={[styles.compoundBarFill, {width: `${Math.round((c.total / maxCompound) * 100)}%`}]} />
                    </View>
                  </View>
                  <View style={styles.compoundCountPill}>
                    <Text style={styles.compoundCount}>{c.total}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},

  // Hero
  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    ...SHADOWS.brand,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: SPACING.sm},
  brandMark: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: {width: 30, height: 30},
  brandName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
    letterSpacing: 0.2,
  },
  logoutBtn: {
    backgroundColor: COLORS.overlayOnBrandSubtle,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  logoutText: {color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold},
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  avatar: {
    width: 52, height: 52, borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlayOnBrandLight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.overlayOnBrandMedium,
  },
  avatarText: {color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold},
  welcomeText: {color: COLORS.overlayOnBrandStrong, fontSize: FONTS.sizes.sm},
  userName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.heavy,
    marginTop: 1,
  },
  roleBadge: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  roleText: {color: COLORS.primaryDeep, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold},

  body: {flex: 1, marginTop: -SPACING.sm},

  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginTop: SPACING.base,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
  },
  noticeText: {flex: 1, color: COLORS.warningDark, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium},

  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.base,
  },

  // Quick actions
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  actionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    width: '47%',
    ...SHADOWS.sm,
  },
  actionIconWrap: {
    width: 46, height: 46, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  actionIcon: {fontSize: 24},
  actionLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  actionSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    width: '47%',
    ...SHADOWS.sm,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statIcon: {fontSize: 20},
  statValue: {fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.heavy, color: COLORS.text},
  statLabel: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2, fontWeight: FONTS.weights.medium},

  // Compounds
  compoundsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.base,
    paddingHorizontal: SPACING.base,
    ...SHADOWS.sm,
  },
  compoundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compoundInfo: {flex: 1},
  compoundName: {fontSize: FONTS.sizes.sm, color: COLORS.text, fontWeight: FONTS.weights.semibold},
  compoundBarTrack: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  compoundBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  compoundCountPill: {
    minWidth: 34,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
  },
  compoundCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primaryDeep,
    fontWeight: FONTS.weights.bold,
  },
});
