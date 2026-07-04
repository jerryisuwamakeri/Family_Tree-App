import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';
import {getInitials, formatDate, getAge, colorForName} from '../utils/helpers';
import {BASE_URL} from '../api/client';
import Icon from './Icon';

export default function MemberCard({member, onPress}) {
  const age = getAge(member.dob);
  const photoUri = member.photo_url ? `${BASE_URL}${member.photo_url}` : null;
  const avatarColor = colorForName(member.full_name || '');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.row}>
        {photoUri ? (
          <Image source={{uri: photoUri}} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, {backgroundColor: avatarColor}]}>
            <Text style={styles.initials}>{getInitials(member.full_name)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{member.full_name}</Text>
          {member.compound ? (
            <Text style={styles.compound}>{member.compound}</Text>
          ) : null}
          <View style={styles.meta}>
            {member.dob ? (
              <Text style={styles.metaText}>
                {age !== null ? `Age ${age}` : formatDate(member.dob)}
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
        <View style={styles.arrowWrap}>
          <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginHorizontal: SPACING.base,
    marginVertical: SPACING.xs + 2,
    ...SHADOWS.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    marginRight: SPACING.md,
  },
  avatarFallback: {
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
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  arrow: {
    fontSize: 20,
    lineHeight: 22,
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.bold,
  },
});
