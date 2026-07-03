import React, {useState, useEffect, useCallback} from 'react';
import {
  View, TextInput, FlatList, TouchableOpacity,
  Text, StyleSheet, RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {membersApi} from '../../api/members';
import {useAuth} from '../../context/AuthContext';
import MemberCard from '../../components/MemberCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {COLORS, FONTS, SPACING, RADIUS} from '../../utils/theme';

export default function MembersScreen({navigation}) {
  const {user} = useAuth();
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canAdd = user && ['super_admin', 'family_admin', 'registered_member'].includes(user.role);

  const fetchMembers = async () => {
    try {
      const data = await membersApi.list();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setMembers(list);
      setFiltered(list);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMembers().finally(() => setLoading(false));
    }, []),
  );

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(members);
    } else {
      const q = search.toLowerCase();
      setFiltered(members.filter(m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.compound_name?.toLowerCase().includes(q) ||
        m.occupation?.toLowerCase().includes(q),
      ));
    }
  }, [search, members]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search members…"
          placeholderTextColor={COLORS.textLight}
          clearButtonMode="while-editing"
        />
        {canAdd && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddMember')}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.count}>{filtered.length} member{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <MemberCard
            member={item}
            onPress={() => navigation.navigate('MemberDetail', {memberId: item.id})}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="No members found"
            subtitle={search ? 'Try a different search term' : 'No family members have been added yet.'}
          />
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
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
    fontSize: FONTS.sizes.sm,
  },
  count: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
});
