import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';
import {getInitials, formatDate, getAge} from '../utils/helpers';
import {BASE_URL} from '../api/client';

export default function MemberCard({member, onPress}) {
  const age = getAge(member.date_of_birth);
  const photoUri = member.photo_path ? `${BASE_URL}/storage/${member.photo_path}` : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.row}>
        {photoUri ? (
          <Image source={{uri: photoUri}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initials}>{getInitials(member.full_name)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{member.full_name}</Text>
          {member.compound_name ? (
            <Text style={styles.compound}>{member.compound_name}</Text>
          ) : null}
          <View style={styles.meta}>
            {member.date_of_birth ? (
              <Text style={styles.metaText}>
                {age !== null ? `Age ${age}` : formatDate(member.date_of_birth)}
              </Text>
            ) : null}
            {member.is_deceased ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Deceased</Text>
              </View>
            ) : null}
            {member.occupation ? (
              <Text style={styles.metaText} numberOfLines={1}>{member.occupation}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.xs,
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  info: {flex: 1},
  name: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  compound: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: FONTS.weights.medium,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  metaText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  badge: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.danger,
    fontWeight: FONTS.weights.medium,
  },
  arrow: {
    fontSize: 22,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
});
