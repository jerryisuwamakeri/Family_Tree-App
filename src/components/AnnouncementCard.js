import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../utils/theme';
import {formatDate, truncate} from '../utils/helpers';

export default function AnnouncementCard({announcement, onPress}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{announcement.title}</Text>
        <Text style={styles.date}>{formatDate(announcement.created_at)}</Text>
      </View>
      <Text style={styles.body}>{truncate(announcement.body, 120)}</Text>
      {announcement.attachments?.length > 0 && (
        <View style={styles.attachmentBadge}>
          <Text style={styles.attachmentText}>
            📎 {announcement.attachments.length} attachment{announcement.attachments.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      {announcement.author ? (
        <Text style={styles.author}>— {announcement.author.name}</Text>
      ) : null}
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  body: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  attachmentBadge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  attachmentText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  author: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
});
