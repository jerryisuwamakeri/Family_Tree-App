import React, {useState, useEffect} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView, RefreshControl,
} from 'react-native';
import {adminApi} from '../../api/admin';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import {getRoleLabel, getRoleBadgeColor, formatDate} from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ROLES = [
  'super_admin', 'family_admin', 'branch_manager',
  'registered_member', 'contributor', 'public_viewer',
];

function UserCard({user, onPress}) {
  const color = getRoleBadgeColor(user.role);
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(user)} activeOpacity={0.8}>
      <View style={[styles.avatar, {backgroundColor: color}]}>
        <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, {backgroundColor: color + '20', borderColor: color}]}>
            <Text style={[styles.badgeText, {color}]}>{getRoleLabel(user.role)}</Text>
          </View>
          {!user.approved && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function UserModal({user, onClose, onUpdated}) {
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const approveUser = async () => {
    setLoading(true);
    try {
      await adminApi.updateUserApproval(user.id, true);
      Alert.alert('Approved', `${user.name} has been approved.`);
      onUpdated();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = role => {
    Alert.alert('Change Role', `Set ${user.name}'s role to "${getRoleLabel(role)}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Confirm', onPress: async () => {
          setLoading(true);
          try {
            await adminApi.updateUserRole(user.id, role);
            Alert.alert('Updated', 'Role updated successfully.');
            onUpdated();
            onClose();
          } catch (e) {
            Alert.alert('Error', e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const deleteUser = () => {
    Alert.alert('Delete User', `Permanently delete ${user.name}? This cannot be undone.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await adminApi.deleteUser(user.id);
            onUpdated();
            onClose();
          } catch (e) {
            Alert.alert('Error', e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{user.name}</Text>
      </View>
      <ScrollView style={styles.modalBody}>
        <Text style={styles.detailRow}>Email: <Text style={styles.detailValue}>{user.email}</Text></Text>
        <Text style={styles.detailRow}>Role: <Text style={styles.detailValue}>{getRoleLabel(user.role)}</Text></Text>
        <Text style={styles.detailRow}>Status: <Text style={styles.detailValue}>{user.approved ? 'Approved' : 'Pending'}</Text></Text>
        <Text style={styles.detailRow}>Joined: <Text style={styles.detailValue}>{formatDate(user.created_at)}</Text></Text>

        {!user.approved && (
          <TouchableOpacity style={styles.approveBtn} onPress={approveUser} disabled={loading}>
            <Text style={styles.approveBtnText}>✓ Approve User</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.subHead}>Change Role</Text>
        {ROLES.map(role => (
          <TouchableOpacity
            key={role}
            style={[styles.roleBtn, user.role === role && styles.roleBtnActive]}
            onPress={() => changeRole(role)}
            disabled={loading || user.role === role}>
            <Text style={[styles.roleBtnText, user.role === role && styles.roleBtnTextActive]}>
              {getRoleLabel(role)}
              {user.role === role ? ' (current)' : ''}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.deleteBtn} onPress={deleteUser} disabled={loading}>
          <Text style={styles.deleteBtnText}>🗑️ Delete User</Text>
        </TouchableOpacity>

        <View style={{height: SPACING.xxxl}} />
      </ScrollView>
    </Modal>
  );
}

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => <UserCard user={item} onPress={setSelected} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={<EmptyState icon="👤" title="No users found" />}
        ListHeaderComponent={
          <Text style={styles.count}>{users.length} user{users.length !== 1 ? 's' : ''}</Text>
        }
        contentContainerStyle={users.length === 0 ? {flex: 1} : {paddingBottom: SPACING.xl}}
      />
      <UserModal user={selected} onClose={() => setSelected(null)} onUpdated={load} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  count: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, padding: SPACING.base},
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.base, marginHorizontal: SPACING.base, marginVertical: SPACING.xs,
    flexDirection: 'row', alignItems: 'center', ...SHADOWS.sm,
  },
  avatar: {
    width: 44, height: 44, borderRadius: RADIUS.full,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  avatarText: {color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold},
  info: {flex: 1},
  name: {fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text},
  email: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2},
  badgeRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4},
  badge: {borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2},
  badgeText: {fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium},
  pendingBadge: {backgroundColor: COLORS.secondaryLight, borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2},
  pendingText: {fontSize: FONTS.sizes.xs, color: COLORS.secondary, fontWeight: FONTS.weights.medium},
  arrow: {fontSize: 22, color: COLORS.textLight},
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, padding: SPACING.base, paddingTop: SPACING.xl,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  closeBtnText: {color: COLORS.white, fontSize: FONTS.sizes.base},
  modalTitle: {flex: 1, color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold},
  modalBody: {flex: 1, padding: SPACING.base},
  detailRow: {fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.sm},
  detailValue: {color: COLORS.text, fontWeight: FONTS.weights.medium},
  approveBtn: {
    backgroundColor: COLORS.success, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', marginVertical: SPACING.base,
  },
  approveBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold},
  subHead: {
    fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1,
    marginTop: SPACING.base, marginBottom: SPACING.sm,
  },
  roleBtn: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.base,
    marginBottom: SPACING.xs, backgroundColor: COLORS.white,
  },
  roleBtnActive: {borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight},
  roleBtnText: {fontSize: FONTS.sizes.sm, color: COLORS.text},
  roleBtnTextActive: {color: COLORS.primary, fontWeight: FONTS.weights.semibold},
  deleteBtn: {
    borderWidth: 1, borderColor: COLORS.danger, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.xl,
  },
  deleteBtnText: {color: COLORS.danger, fontWeight: FONTS.weights.semibold},
});
