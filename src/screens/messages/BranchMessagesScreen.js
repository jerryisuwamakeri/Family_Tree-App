import React, {useState, useEffect, useRef} from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity,
  Text, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {messagesApi} from '../../api/messages';
import {useAuth} from '../../context/AuthContext';
import MessageItem from '../../components/MessageItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {COLORS, FONTS, SPACING, RADIUS} from '../../utils/theme';
import Icon from '../../components/Icon';

export default function BranchMessagesScreen() {
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = async () => {
    try {
      const data = await messagesApi.getBranchMessages();
      setMessages(Array.isArray(data) ? data : data?.data ?? []);
    } catch {}
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await messagesApi.sendBranchMessage({body: trimmed});
      setText('');
      await load();
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 200);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <MessageItem
            message={item}
            isOwn={item.user_id === user?.id || item.sender_id === user?.id}
          />
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <EmptyState icon="business-outline" title="No branch messages" subtitle="Be the first to post a message to your branch." />
        }
        contentContainerStyle={messages.length === 0 ? {flex: 1} : {paddingVertical: SPACING.sm}}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Write a message…"
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}>
          <Icon name="send" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {backgroundColor: COLORS.textLight},
});
