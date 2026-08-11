import React, {useState, useEffect} from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, ScrollView, Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {adminApi} from '../../api/admin';
import {membersApi} from '../../api/members';
import {metaApi} from '../../api/meta';
import {BASE_URL} from '../../api/client';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import {getInitials} from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function ProgenitorCard({item, onPress}) {
  const photoUri = item.photo_url ? `${BASE_URL}${item.photo_url}` : null;
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      {photoUri ? (
        <Image source={{uri: photoUri}} style={styles.cardAvatar} />
      ) : (
        <View style={[styles.cardAvatar, styles.cardAvatarFallback]}>
          <Text style={styles.cardInitials}>{getInitials(item.full_name)}</Text>
        </View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.full_name}</Text>
        <Text style={styles.cardCompound}>
          {item.compound || item.compound_ref?.name || 'No compound assigned'}
        </Text>
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

function EditModal({progenitor, onClose, onSaved}) {
  const [compounds, setCompounds] = useState([]);
  const [selectedCompoundId, setSelectedCompoundId] = useState(
    progenitor.compound_id ?? progenitor.compound?.id ?? '',
  );
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUri, setPhotoUri] = useState(
    progenitor.photo_url ? `${BASE_URL}${progenitor.photo_url}` : null,
  );

  useEffect(() => {
    metaApi.compounds().then(setCompounds).catch(() => {});
  }, []);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'photo.jpg',
      });
      await membersApi.uploadPhoto(progenitor.id, formData);
      setPhotoUri(asset.uri);
      Alert.alert('Updated', 'Photo updated successfully.');
      onSaved();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveCompound = async () => {
    if (!selectedCompoundId) {
      Alert.alert('Required', 'Please select a compound.');
      return;
    }
    setSaving(true);
    try {
      await adminApi.updateProgenitor(progenitor.id, {compound_id: selectedCompoundId});
      Alert.alert('Saved', 'Compound updated successfully.');
      onSaved();
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle} numberOfLines={1}>{progenitor.full_name}</Text>
      </View>

      <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
        {/* Photo section */}
        <Text style={styles.sectionHead}>Profile Photo</Text>
        <View style={styles.photoSection}>
          {photoUri ? (
            <Image source={{uri: photoUri}} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <Text style={styles.photoInitials}>{getInitials(progenitor.full_name)}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.photoBtn, uploadingPhoto && styles.photoBtnDisabled]}
            onPress={handlePickPhoto}
            disabled={uploadingPhoto}>
            {uploadingPhoto ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.photoBtnText}>
                {photoUri ? '🔄 Change Photo' : '📷 Upload Photo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Compound section */}
        <Text style={styles.sectionHead}>Compound / Branch</Text>
        <View style={styles.compoundsContainer}>
          {compounds.length === 0 ? (
            <Text style={styles.loadingText}>Loading compounds…</Text>
          ) : (
            compounds.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.compoundOption,
                  String(selectedCompoundId) === String(c.id) && styles.compoundOptionActive,
                ]}
                onPress={() => setSelectedCompoundId(c.id)}>
                <View style={[
                  styles.compoundRadio,
                  String(selectedCompoundId) === String(c.id) && styles.compoundRadioActive,
                ]}>
                  {String(selectedCompoundId) === String(c.id) && (
                    <View style={styles.compoundRadioDot} />
                  )}
                </View>
                <Text style={[
                  styles.compoundOptionText,
                  String(selectedCompoundId) === String(c.id) && styles.compoundOptionTextActive,
                ]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSaveCompound}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Compound</Text>
          )}
        </TouchableOpacity>

        <View style={{height: SPACING.xxxl}} />
      </ScrollView>
    </Modal>
  );
}

export default function ProgenitorManagementScreen() {
  const [progenitors, setProgenitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const data = await adminApi.getProgenitors();
      setProgenitors(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.screen}>
      <FlatList
        data={progenitors}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <ProgenitorCard item={item} onPress={setEditing} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <Text style={styles.listCount}>
            {progenitors.length} progenitor{progenitors.length !== 1 ? 's' : ''}
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-circle-outline"
            title="No progenitors found"
            subtitle="Progenitors can be seeded from the Admin Dashboard."
          />
        }
        contentContainerStyle={progenitors.length === 0 ? {flex: 1} : {paddingBottom: SPACING.xl}}
      />

      {editing && (
        <EditModal
          progenitor={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  listCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    padding: SPACING.base,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  cardAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  cardAvatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInitials: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  cardInfo: {flex: 1},
  cardName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  cardCompound: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginTop: 3,
    fontWeight: FONTS.weights.medium,
  },
  cardArrow: {fontSize: 22, color: COLORS.textLight},

  // Modal
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  closeBtnText: {color: COLORS.white, fontSize: FONTS.sizes.base},
  modalTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  modalBody: {flex: 1, padding: SPACING.base},
  sectionHead: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },

  // Photo
  photoSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.base,
  },
  photoFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitials: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
  },
  photoBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minWidth: 160,
    alignItems: 'center',
  },
  photoBtnDisabled: {opacity: 0.6},
  photoBtnText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
    fontSize: FONTS.sizes.sm,
  },

  // Compounds
  compoundsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  loadingText: {
    padding: SPACING.base,
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  compoundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compoundOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  compoundRadio: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compoundRadioActive: {borderColor: COLORS.primary},
  compoundRadioDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  compoundOptionText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
  },
  compoundOptionTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // Save button
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.base,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  saveBtnDisabled: {opacity: 0.6},
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
  },
});
