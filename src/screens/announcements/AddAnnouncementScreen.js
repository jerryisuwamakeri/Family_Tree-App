import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {announcementsApi} from '../../api/announcements';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';

export default function AddAnnouncementScreen({navigation}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Required', 'Please fill in the title and body.');
      return;
    }
    setLoading(true);
    try {
      await announcementsApi.create({title: title.trim(), body: body.trim()});
      Alert.alert('Posted!', 'Your announcement has been posted.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Announcement title"
          placeholderTextColor={COLORS.textLight}
          maxLength={200}
        />

        <Text style={styles.label}>Message *</Text>
        <TextInput
          style={[styles.input, styles.bodyInput]}
          value={body}
          onChangeText={setBody}
          placeholder="Write your announcement here…"
          placeholderTextColor={COLORS.textLight}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.hint}>
          After posting you can attach files from the announcements list.
        </Text>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handlePost}
          disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Posting…' : 'Post Announcement'}</Text>
        </TouchableOpacity>

        <View style={{height: SPACING.xxxl}} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background, padding: SPACING.base},
  label: {
    fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium,
    color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.base,
  },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text,
  },
  bodyInput: {height: 200, textAlignVertical: 'top'},
  hint: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted,
    marginTop: SPACING.sm, lineHeight: 18,
  },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingVertical: SPACING.base, alignItems: 'center', marginTop: SPACING.xl,
    ...SHADOWS.brand,
  },
  btnDisabled: {opacity: 0.6},
  btnText: {color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.semibold},
});
