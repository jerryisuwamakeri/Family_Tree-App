import React, {useState, useEffect} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ScrollView, RefreshControl,
} from 'react-native';
import {adminApi} from '../../api/admin';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function CompoundForm({compound, onSave, onClose}) {
  const [name, setName] = useState(compound?.name || '');
  const [location, setLocation] = useState(compound?.location || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Compound name is required.');
      return;
    }
    setLoading(true);
    try {
      if (compound) {
        await adminApi.updateCompound(compound.id, {name: name.trim(), location: location.trim()});
      } else {
        await adminApi.createCompound({name: name.trim(), location: location.trim()});
      }
      onSave();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{compound ? 'Edit Compound' : 'Add Compound'}</Text>
      </View>
      <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Compound Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Oke Odan"
          placeholderTextColor={COLORS.textLight}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Town / Village"
          placeholderTextColor={COLORS.textLight}
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving…' : compound ? 'Save Changes' : 'Add Compound'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

export default function CompoundManagementScreen() {
  const [compounds, setCompounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      const data = await adminApi.getCompounds();
      setCompounds(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleDelete = compound => {
    Alert.alert('Delete Compound', `Delete "${compound.name}"? This may affect associated members.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await adminApi.deleteCompound(compound.id);
            await load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addBtnText}>+ Add Compound</Text>
      </TouchableOpacity>

      <FlatList
        data={compounds}
        keyExtractor={item => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              {item.location ? <Text style={styles.cardLocation}>📍 {item.location}</Text> : null}
              {item.members_count != null && (
                <Text style={styles.cardCount}>{item.members_count} members</Text>
              )}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(item)}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="🏘️" title="No compounds" subtitle="Add a compound to get started." />}
        contentContainerStyle={compounds.length === 0 ? {flex: 1} : {paddingBottom: SPACING.xl}}
      />

      {showAdd && (
        <CompoundForm onSave={load} onClose={() => setShowAdd(false)} />
      )}
      {editing && (
        <CompoundForm compound={editing} onSave={load} onClose={() => setEditing(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  addBtn: {
    backgroundColor: COLORS.primary, margin: SPACING.base,
    borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center',
  },
  addBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.base, marginHorizontal: SPACING.base, marginVertical: SPACING.xs,
    flexDirection: 'row', alignItems: 'center', ...SHADOWS.sm,
  },
  cardInfo: {flex: 1},
  cardName: {fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text},
  cardLocation: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2},
  cardCount: {fontSize: FONTS.sizes.xs, color: COLORS.primary, marginTop: 2, fontWeight: FONTS.weights.medium},
  cardActions: {flexDirection: 'row', gap: SPACING.sm},
  editBtn: {
    borderWidth: 1, borderColor: COLORS.primary,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  editBtnText: {color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium},
  deleteBtn: {
    borderWidth: 1, borderColor: COLORS.danger,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  deleteBtnText: {color: COLORS.danger, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium},
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
  label: {fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.base},
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: SPACING.base, alignItems: 'center', marginTop: SPACING.xl,
  },
  saveBtnDisabled: {opacity: 0.6},
  saveBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.base},
});
