import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import Icon from '../../components/Icon';

export default function MessagesScreen({navigation}) {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>Messages</Text>
      <Text style={styles.sub}>Choose a message type to view</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BranchMessages')}
        activeOpacity={0.8}>
        <View style={styles.cardIconWrap}>
          <Icon name="business" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Branch Messages</Text>
          <Text style={styles.cardDesc}>Messages sent to your compound / branch</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DirectMessage')}
        activeOpacity={0.8}>
        <View style={styles.cardIconWrap}>
          <Icon name="mail" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>Direct Messages</Text>
          <Text style={styles.cardDesc}>Private messages between family members</Text>
        </View>
        <Icon name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.base},
  heading: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  sub: {fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.xl},
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardIconWrap: {
    width: 48, height: 48, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.base,
  },
  cardInfo: {flex: 1},
  cardTitle: {fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold, color: COLORS.text},
  cardDesc: {fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2},
});
