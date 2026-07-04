import React, {useState, useEffect, useCallback} from 'react';
import {
  View, TextInput, FlatList, TouchableOpacity,
  Text, StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {membersApi} from '../../api/members';
import {useAuth} from '../../context/AuthContext';
import MemberCard from '../../components/MemberCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';

export default function MembersScreen({navigation}) {
  const {user} = useAuth();
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const canAdd = user && ['super_admin', 'family_admin', 'registered_member'].includes(user.role);

  // The API paginates (Laravel), so a single call only returns one page.
  // Load page 1 on focus and pull further pages as the list scrolls.
  const fetchPage = async (pageNum, replace) => {
    const res = await membersApi.list({page: pageNum, per_page: 50});
    const list = Array.isArray(res) ? res : res?.data ?? [];
    setLastPage(res?.last_page ?? 1);
    setTotal(res?.total ?? list.length);
    setPage(pageNum);
    setMembers(prev => (replace ? list : [...prev, ...list]));
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPage(1, true).catch(() => {}).finally(() => setLoading(false));
    }, []),
  );

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(members);
    } else {
      const q = search.toLowerCase();
      setFiltered(members.filter(m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.compound?.toLowerCase().includes(q) ||
        m.occupation?.toLowerCase().includes(q),
      ));
    }
  }, [search, members]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPage(1, true).catch(() => {});
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || page >= lastPage || search.trim()) return;
    setLoadingMore(true);
    await fetchPage(page + 1, false).catch(() => {});
    setLoadingMore(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search members…"
            placeholderTextColor={COLORS.textLight}
            clearButtonMode="while-editing"
          />
        </View>
        {canAdd && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddMember')}
            activeOpacity={0.85}>
            <Icon name="add" size={28} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.count}>
        {search ? filtered.length : total} member{(search ? filtered.length : total) !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <MemberCard
            member={item}
            onPress={() => navigation.navigate('MemberDetail', {memberId: item.id})}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No members found"
            subtitle={search ? 'Try a different search term' : 'No family members have been added yet.'}
          />
        }
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{marginVertical: SPACING.base}} color={COLORS.primary} /> : null
        }
        contentContainerStyle={filtered.length === 0 ? {flex: 1} : {paddingBottom: SPACING.xl}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  searchRow: {
    flexDirection: 'row',
    padding: SPACING.base,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base,
  },
  searchIcon: {fontSize: 15, marginRight: SPACING.sm},
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.brand,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
    fontSize: 26,
    lineHeight: 30,
  },
  count: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.semibold,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
});
