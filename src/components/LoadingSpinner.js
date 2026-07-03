import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {COLORS, FONTS, SPACING} from '../utils/theme';

export default function LoadingSpinner({message = 'Loading…', fullScreen = false}) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  message: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
});
