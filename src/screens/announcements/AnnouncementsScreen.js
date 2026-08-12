import React, {useState, useCallback} from 'react';
import {
  View, FlatList, TouchableOpacity, Text, StyleSheet,
  RefreshControl, Modal, ScrollView, Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {announcementsApi} from '../../api/announcements';
import {useAuth} from '../../context/AuthContext';
import AnnouncementCard from '../../components/AnnouncementCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import {formatDate, isAdmin} from '../../utils/helpers';
import {BASE_URL} from '../../api/client';
import Icon from '../../components/Icon';

function DetailModal({item, onClose, onDelete, canAdmin}) {
  if (!item) return null;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Icon name="close" size={18} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.modalTitle} numberOfLines={2}>{item.title}</Text>
        {canAdmin && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Icon name="trash-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.modalBody}>
        <Text style={styles.modalDate}>{formatDate(item.created_at)}</Text>
        {item.author?.name && <Text style={styles.modalAuthor}>By {item.author.name}</Text>}
        <Text style={styles.modalBodyText}>{item.body}</Text>
        {item.attachments?.length > 0 && (
          <View style={styles.attachments}>
            <Text style={styles.attachmentsTitle}>Attachments</Text>
            {item.attachments.map(a => (
              <View key={a.id} style={styles.attachmentRow}>
                <Icon name="attach-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.attachmentName}>{a.file_name || 'File'}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{height: SPACING.xxxl}} />
      </ScrollView>
    </Modal>
  );
}

export default function AnnouncementsScreen({navigation}) {
  const {user} = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const canAdmin = isAdmin(user);

  const fetch = async () => {
    try {
      const data = await announcementsApi.list();
      setItems(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetch().finally(() => setLoading(false));
  }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    Alert.alert('Delete', 'Delete this announcement?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await announcementsApi.delete(selected.id);
            setSelected(null);
            await fetch();
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
      {canAdmin && (
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => navigation.navigate('AddAnnouncement')}>
          <Icon name="add" size={18} color={COLORS.white} />
          <Text style={styles.postBtnText}>Post Announcement</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <AnnouncementCard announcement={item} onPress={() => setSelected(item)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <EmptyState icon="megaphone-outline" title="No announcements" subtitle="Nothing has been posted yet." />
        }
        contentContainerStyle={items.length === 0 ? {flex: 1} : {paddingVertical: SPACING.sm}}
      />

      <DetailModal
        item={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        canAdmin={canAdmin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  postBtn: {
    backgroundColor: COLORS.primary,
    margin: SPACING.base,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    ...SHADOWS.brand,
  },
  postBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.base,
    paddingTop: SPACING.xl,
  },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.overlayOnBrandLight,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.sm,
  },
  modalTitle: {flex: 1, color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold},
  deleteBtn: {padding: SPACING.sm},
  modalBody: {flex: 1, padding: SPACING.base},
  modalDate: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: SPACING.xs},
  modalAuthor: {fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: FONTS.weights.medium, marginBottom: SPACING.base},
  modalBodyText: {fontSize: FONTS.sizes.base, color: COLORS.text, lineHeight: 24},
  attachments: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
  },
  attachmentsTitle: {fontWeight: FONTS.weights.semibold, color: COLORS.primary, marginBottom: SPACING.sm},
  attachmentRow: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingVertical: SPACING.xs},
  attachmentName: {fontSize: FONTS.sizes.sm, color: COLORS.text},
});
