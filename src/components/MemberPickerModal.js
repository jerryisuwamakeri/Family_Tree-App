import React, {useState, useEffect} from 'react';
import {
  Modal, View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import {membersApi} from '../api/members';
import {BASE_URL} from '../api/client';
import {COLORS, FONTS, SPACING, RADIUS} from '../utils/theme';
import {getInitials} from '../utils/helpers';

export default function MemberPickerModal({visible, title = 'Select Member', onSelect, onClose}) {
  const [query, setQuery] = useState('');
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    membersApi.list()
      .then(data => {
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(all);
    } else {
      const q = query.toLowerCase();
      setFiltered(all.filter(m => m.full_name?.toLowerCase().includes(q)));
    }
  }, [query, all]);

  const handleSelect = member => {
    onSelect(member);
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name…"
          placeholderTextColor={COLORS.textLight}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{marginTop: SPACING.xl}} color={COLORS.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{getInitials(item.full_name)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.full_name}</Text>
                {item.compound_name ? (
                  <Text style={styles.sub}>{item.compound_name}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No members found</Text>
          }
          contentContainerStyle={{paddingBottom: SPACING.xxxl}}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: {color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold},
  searchWrap: {
    padding: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  search: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  avatar: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  initials: {color: COLORS.white, fontWeight: FONTS.weights.bold, fontSize: FONTS.sizes.sm},
  info: {flex: 1},
  name: {fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.medium, color: COLORS.text},
  sub: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2},
  empty: {textAlign: 'center', padding: SPACING.xl, color: COLORS.textMuted},
});
