import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS} from '../utils/theme';

import {formatDate, getInitials} from '../utils/helpers';

export default function MessageItem({message, isOwn}) {
  return (
    <View style={[styles.wrapper, isOwn && styles.wrapperOwn]}>
      {!isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(message.sender_name || '?')}</Text>
        </View>
      )}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && message.sender_name ? (
          <Text style={styles.senderName}>{message.sender_name}</Text>
        ) : null}
        <Text style={[styles.body, isOwn && styles.bodyOwn]}>{message.body}</Text>
        <Text style={[styles.time, isOwn && styles.timeOwn]}>
          {formatDate(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.base,
    alignItems: 'flex-end',
  },
  wrapperOwn: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  bubbleOther: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: RADIUS.sm,
  },
  bubbleOwn: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  senderName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  body: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: 19,
  },
  bodyOwn: {color: COLORS.white},
  time: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  timeOwn: {color: COLORS.textOnBrandFaint},
});
