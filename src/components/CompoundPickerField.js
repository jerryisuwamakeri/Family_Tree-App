import React, {useState, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  TextInput, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import {metaApi} from '../api/meta';
import {adminApi} from '../api/admin';
import {useAuth} from '../context/AuthContext';
import {isAdmin} from '../utils/helpers';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';

export default function CompoundPickerField({value, label, onChange}) {
  const {user} = useAuth();
  const [compounds, setCompounds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedName = compounds.find(c => String(c.id) === String(value))?.name;

  const load = () => {
    setLoading(true);
    metaApi.compounds()
      .then(setCompounds)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (modalVisible) load();
  }, [modalVisible]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await adminApi.createCompound({name: newName.trim()});
      setNewName('');
      setCreating(false);
      await load();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.75}>
        <Text style={[styles.selectorText, !selectedName && styles.placeholder]}>
          {selectedName || `Select ${label || 'Compound'}…`}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{label || 'Compound'}</Text>
          {isAdmin(user) && (
            <TouchableOpacity onPress={() => setCreating(v => !v)} style={styles.addBtn}>
              <Text style={styles.addBtnText}>{creating ? 'Cancel' : '+ New'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Create new compound inline */}
        {creating && (
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="New compound name…"
              placeholderTextColor={COLORS.textLight}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.createSaveBtn, saving && {opacity: 0.6}]}
              onPress={handleCreate}
              disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Text style={styles.createSaveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={{marginTop: SPACING.xl}} color={COLORS.primary} />
        ) : (
          <FlatList
            data={compounds}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => {
              const selected = String(value) === String(item.id);
              return (
                <TouchableOpacity
                  style={[styles.option, selected && styles.optionActive]}
                  onPress={() => { onChange(item.id); setModalVisible(false); }}>
                  <View style={[styles.radio, selected && styles.radioActive]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No compounds yet. Tap "+ New" to create one.</Text>
            }
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  selectorText: {flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text},
  placeholder: {color: COLORS.textLight},
  chevron: {fontSize: 16, color: COLORS.textMuted},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.base,
    paddingTop: SPACING.xl,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  closeBtnText: {color: COLORS.white, fontSize: FONTS.sizes.base},
  headerTitle: {flex: 1, color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold},
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  addBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  createRow: {
    flexDirection: 'row',
    padding: SPACING.base,
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  createInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  createSaveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    justifyContent: 'center',
  },
  createSaveBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold},
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  optionActive: {backgroundColor: COLORS.primaryLight},
  radio: {
    width: 20, height: 20, borderRadius: RADIUS.full,
    borderWidth: 2, borderColor: COLORS.border,
    marginRight: SPACING.md,
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: {borderColor: COLORS.primary},
  radioDot: {width: 10, height: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.primary},
  optionText: {fontSize: FONTS.sizes.base, color: COLORS.text},
  optionTextActive: {color: COLORS.primary, fontWeight: FONTS.weights.semibold},
  empty: {
    textAlign: 'center', padding: SPACING.xl,
    color: COLORS.textMuted, fontSize: FONTS.sizes.sm,
  },
});
