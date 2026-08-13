import React, {useState, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import {metaApi} from '../api/meta';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';
import Icon from './Icon';

// Picks the branch ancestor (progenitor) a member descends from.
// The backend requires progenitor_id on every new member, so this is mandatory.
const nameOf = p =>
  p.alias || [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ');

// usePublic: fetch via the unauthenticated /meta/progenitors-public endpoint
// instead of /meta/progenitors, which requires a logged-in user -- needed for
// contexts like registration where there's no auth token yet.
export default function ProgenitorPickerField({value, onChange, usePublic = false}) {
  const [rows, setRows] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const selected = rows.find(p => String(p.id) === String(value));

  useEffect(() => {
    if (!modalVisible) return;
    setLoading(true);
    const fetchProgenitors = usePublic ? metaApi.progenitorsPublic : metaApi.progenitors;
    fetchProgenitors()
      .then(data => setRows(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [modalVisible, usePublic]);

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)} activeOpacity={0.75}>
        <Text style={[styles.selectorText, !selected && styles.placeholder]}>
          {selected ? nameOf(selected) : 'Select branch ancestor…'}
        </Text>
        <Icon name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
            <Icon name="close" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Branch Ancestor</Text>
        </View>

        {loading ? (
          <ActivityIndicator style={{marginTop: SPACING.xl}} color={COLORS.primary} />
        ) : (
          <FlatList
            data={rows}
            keyExtractor={item => String(item.id)}
            renderItem={({item}) => {
              const isSelected = String(value) === String(item.id);
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionActive]}
                  onPress={() => { onChange(item.id); setModalVisible(false); }}>
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {nameOf(item)}
                    </Text>
                    {item.is_main_progenitor ? (
                      <Text style={styles.mainTag}>Main progenitor</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>No progenitors available.</Text>}
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  selectorText: {flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text},
  placeholder: {color: COLORS.textLight},
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary, padding: SPACING.base, paddingTop: SPACING.xl,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm,
  },
  headerTitle: {flex: 1, color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold},
  option: {
    flexDirection: 'row', alignItems: 'center', padding: SPACING.base,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  optionActive: {backgroundColor: COLORS.primaryLight},
  radio: {
    width: 20, height: 20, borderRadius: RADIUS.full, borderWidth: 2, borderColor: COLORS.border,
    marginRight: SPACING.md, justifyContent: 'center', alignItems: 'center',
  },
  radioActive: {borderColor: COLORS.primary},
  radioDot: {width: 10, height: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.primary},
  optionText: {fontSize: FONTS.sizes.base, color: COLORS.text},
  optionTextActive: {color: COLORS.primary, fontWeight: FONTS.weights.semibold},
  mainTag: {fontSize: FONTS.sizes.xs, color: COLORS.primary, marginTop: 2, fontWeight: FONTS.weights.medium},
  empty: {textAlign: 'center', padding: SPACING.xl, color: COLORS.textMuted, fontSize: FONTS.sizes.sm},
});
