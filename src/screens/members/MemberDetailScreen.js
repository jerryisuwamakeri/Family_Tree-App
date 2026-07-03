import React, {useState, useEffect} from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import {membersApi} from '../../api/members';
import {useAuth} from '../../context/AuthContext';
import {BASE_URL} from '../../api/client';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import {formatDate, getAge, getInitials, isAdmin} from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

function InfoRow({label, value}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionHeader({title}) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function MemberDetailScreen({route, navigation}) {
  const {memberId} = route.params;
  const {user} = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canEdit = isAdmin(user);

  const load = async () => {
    try {
      const data = await membersApi.get(memberId);
      setMember(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [memberId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDelete = () => {
    Alert.alert('Delete Member', `Are you sure you want to delete ${member?.full_name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await membersApi.delete(memberId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!member) return null;

  const photoUri = member.photo_path ? `${BASE_URL}/storage/${member.photo_path}` : null;
  const age = getAge(member.date_of_birth);

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
      {/* Header */}
      <View style={styles.profileHeader}>
        {photoUri ? (
          <Image source={{uri: photoUri}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initials}>{getInitials(member.full_name)}</Text>
          </View>
        )}
        <Text style={styles.name}>{member.full_name}</Text>
        {member.compound_name ? <Text style={styles.compound}>{member.compound_name}</Text> : null}
        {member.is_deceased ? (
          <View style={styles.deceasedBadge}><Text style={styles.deceasedText}>Deceased</Text></View>
        ) : null}
        {age !== null && <Text style={styles.age}>{age} years old</Text>}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.treeBtn}
            onPress={() => navigation.navigate('FamilyTree', {memberId})}>
            <Text style={styles.treeBtnText}>🌳 View Tree</Text>
          </TouchableOpacity>
          {canEdit && (
            <>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditMember', {member})}>
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Personal info */}
      <SectionHeader title="Personal Information" />
      <View style={styles.card}>
        <InfoRow label="Date of Birth" value={formatDate(member.date_of_birth)} />
        <InfoRow label="Date of Death" value={formatDate(member.date_of_death)} />
        <InfoRow label="Gender" value={member.gender} />
        <InfoRow label="Occupation" value={member.occupation} />
        <InfoRow label="Education" value={member.education} />
        <InfoRow label="State of Origin" value={member.state_of_origin} />
        <InfoRow label="LGA" value={member.lga} />
        <InfoRow label="Address" value={member.address} />
      </View>

      {/* Contact info */}
      <SectionHeader title="Contact" />
      <View style={styles.card}>
        <InfoRow label="Phone" value={member.phone} />
        <InfoRow label="Email" value={member.email} />
      </View>

      {/* Family links */}
      <SectionHeader title="Family Links" />
      <View style={styles.card}>
        {member.father && (
          <TouchableOpacity onPress={() => navigation.push('MemberDetail', {memberId: member.father.id})}>
            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Father</Text>
              <Text style={styles.linkValue}>{member.father.full_name}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        {member.mother && (
          <TouchableOpacity onPress={() => navigation.push('MemberDetail', {memberId: member.mother.id})}>
            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Mother</Text>
              <Text style={styles.linkValue}>{member.mother.full_name}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        {member.spouses?.map(s => (
          <TouchableOpacity key={s.id} onPress={() => navigation.push('MemberDetail', {memberId: s.id})}>
            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Spouse</Text>
              <Text style={styles.linkValue}>{s.full_name}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
        {member.children?.map(c => (
          <TouchableOpacity key={c.id} onPress={() => navigation.push('MemberDetail', {memberId: c.id})}>
            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Child</Text>
              <Text style={styles.linkValue}>{c.full_name}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
        {!member.father && !member.mother && !member.spouses?.length && !member.children?.length && (
          <Text style={styles.noLinks}>No family links recorded</Text>
        )}
      </View>

      <View style={{height: SPACING.xxxl}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  profileHeader: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  avatar: {
    width: 96, height: 96,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarFallback: {backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center'},
  initials: {color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold},
  name: {color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold, marginTop: SPACING.md},
  compound: {color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.sm, marginTop: 4},
  age: {color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.sm, marginTop: 2},
  deceasedBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    marginTop: SPACING.xs,
  },
  deceasedText: {color: COLORS.white, fontSize: FONTS.sizes.xs},
  actions: {flexDirection: 'row', marginTop: SPACING.base, gap: SPACING.sm},
  treeBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  treeBtnText: {color: COLORS.primary, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  editBtnText: {color: COLORS.white, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  deleteBtn: {
    backgroundColor: 'rgba(220,38,38,0.2)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  deleteBtnText: {fontSize: FONTS.sizes.base},
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.base,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.base,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    width: 130,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  infoValue: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkLabel: {width: 70, fontSize: FONTS.sizes.sm, color: COLORS.textMuted},
  linkValue: {flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: FONTS.weights.medium},
  arrow: {fontSize: 20, color: COLORS.textLight},
  noLinks: {padding: SPACING.base, color: COLORS.textMuted, fontSize: FONTS.sizes.sm},
});
